/**
 * Seeded PRNG (mulberry32) with named forks for deterministic case generation.
 *
 * Named streams used later by the engine (fork once per concern; never reorder
 * draws within an existing stream):
 *   - world
 *   - crew
 *   - maintenance
 *   - weather
 *   - template
 *   - flight
 *   - witnesses
 *   - pressure
 */

export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Inclusive integer in [min, max]. */
  nextInt(min: number, max: number): number;
  /** Pick one element; throws if arr is empty. */
  pick<T>(arr: readonly T[]): T;
  /** True with probability p (clamped to [0, 1]). */
  chance(p: number): boolean;
  /** Fisher–Yates shuffle of a shallow copy; does not mutate arr. */
  shuffle<T>(arr: readonly T[]): T[];
  /**
   * Independent child stream derived from parent seed + name.
   * Stable: same parent seed + name → same sequence, unaffected by parent draws
   * or by other forks.
   */
  fork(name: string): Rng;
}

/** FNV-1a 32-bit hash; numbers are taken as uint32 seeds directly. */
export function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') {
    return seed >>> 0;
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(state: number): () => number {
  let a = state >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRngFromState(seedKey: string, state: number): Rng {
  const nextFloat = mulberry32(state);

  const rng: Rng = {
    next() {
      return nextFloat();
    },

    nextInt(min: number, max: number) {
      if (!Number.isFinite(min) || !Number.isFinite(max)) {
        throw new RangeError('nextInt: min and max must be finite');
      }
      if (max < min) {
        throw new RangeError(`nextInt: max (${max}) < min (${min})`);
      }
      const lo = Math.ceil(min);
      const hi = Math.floor(max);
      if (hi < lo) {
        throw new RangeError(`nextInt: no integers in [${min}, ${max}]`);
      }
      const span = hi - lo + 1;
      return lo + Math.floor(nextFloat() * span);
    },

    pick<T>(arr: readonly T[]): T {
      if (arr.length === 0) {
        throw new Error('pick: empty array');
      }
      const idx = rng.nextInt(0, arr.length - 1);
      return arr[idx] as T;
    },

    chance(p: number) {
      if (!Number.isFinite(p)) {
        return false;
      }
      if (p <= 0) return false;
      if (p >= 1) return true;
      return nextFloat() < p;
    },

    shuffle<T>(arr: readonly T[]): T[] {
      const out = arr.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = rng.nextInt(0, i);
        const tmp = out[i] as T;
        out[i] = out[j] as T;
        out[j] = tmp;
      }
      return out;
    },

    fork(name: string) {
      const childKey = `${seedKey}::${name}`;
      return createRngFromState(childKey, hashSeed(childKey));
    },
  };

  return rng;
}

/** Create an RNG from a string seed (hashed to uint32 for mulberry32). */
export function createRng(seed: string): Rng {
  return createRngFromState(seed, hashSeed(seed));
}
