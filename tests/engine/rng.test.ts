import { describe, it, expect } from 'vitest';
import { createRng, hashSeed } from '../../src/engine/rng';

describe('createRng', () => {
  it('same seed → same sequence', () => {
    const a = createRng('case-1174');
    const b = createRng('case-1174');
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);

    const c = createRng('case-1174');
    const d = createRng('case-1174');
    expect(
      Array.from({ length: 10 }, () => c.nextInt(0, 100)),
    ).toEqual(Array.from({ length: 10 }, () => d.nextInt(0, 100)));
  });

  it('different seeds diverge', () => {
    const a = createRng('alpha');
    const b = createRng('beta');
    const seqA = Array.from({ length: 8 }, () => a.next());
    const seqB = Array.from({ length: 8 }, () => b.next());
    expect(seqA).not.toEqual(seqB);
  });

  it('nextInt stays in inclusive range', () => {
    const rng = createRng('bounds');
    for (let i = 0; i < 200; i++) {
      const n = rng.nextInt(3, 7);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(7);
    }
  });

  it('pick and shuffle copy are deterministic', () => {
    const items = ['a', 'b', 'c', 'd', 'e'] as const;
    const r1 = createRng('deck');
    const r2 = createRng('deck');
    expect(r1.pick(items)).toBe(r2.pick(items));
    const shuffled = r1.shuffle(items);
    expect(shuffled).toEqual(r2.shuffle(items));
    expect(shuffled).not.toBe(items);
    expect([...items]).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('chance respects extremes', () => {
    const rng = createRng('chance');
    expect(rng.chance(0)).toBe(false);
    expect(rng.chance(1)).toBe(true);
  });
});

describe('rng.fork', () => {
  it("fork('weather') is independent of fork('crew')", () => {
    const root = createRng('root-seed');
    const weather = root.fork('weather');
    const crew = root.fork('crew');

    const weatherSeq = Array.from({ length: 15 }, () => weather.next());
    const crewSeq = Array.from({ length: 15 }, () => crew.next());
    expect(weatherSeq).not.toEqual(crewSeq);

    // Drawing on one fork does not affect a freshly forked sibling.
    const weather2 = createRng('root-seed').fork('weather');
    const crewAfterWeatherDraws = createRng('root-seed').fork('crew');
    // advance weather2
    for (let i = 0; i < 15; i++) weather2.next();
    const crewFresh = Array.from({ length: 15 }, () => crewAfterWeatherDraws.next());
    expect(crewFresh).toEqual(crewSeq);
  });

  it('fork stability across calls', () => {
    const root = createRng('stable');
    const first = root.fork('weather');
    const again = root.fork('weather');
    expect(Array.from({ length: 12 }, () => first.next())).toEqual(
      Array.from({ length: 12 }, () => again.next()),
    );

    // Parent draws must not change fork output.
    const rootA = createRng('stable');
    rootA.next();
    rootA.nextInt(0, 99);
    const forkedAfterDraws = rootA.fork('weather');

    const rootB = createRng('stable');
    const forkedClean = rootB.fork('weather');

    expect(Array.from({ length: 10 }, () => forkedAfterDraws.next())).toEqual(
      Array.from({ length: 10 }, () => forkedClean.next()),
    );
  });

  it('named stream keys hash distinctly', () => {
    const names = [
      'world',
      'crew',
      'maintenance',
      'weather',
      'template',
      'flight',
      'witnesses',
      'pressure',
    ] as const;
    const hashes = new Set(names.map((n) => hashSeed(`seed::${n}`)));
    expect(hashes.size).toBe(names.length);
  });
});
