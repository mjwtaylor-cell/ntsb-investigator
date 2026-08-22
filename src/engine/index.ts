export type * from './types';
export { NODE_TIER_WEIGHT } from './types';
export { createRng, hashSeed, type Rng } from './rng';

export function generateCase(_seed?: string): never {
  void _seed;
  throw new Error('engine not yet implemented');
}

export function applyAction(): never {
  throw new Error('engine not yet implemented');
}

export function advanceTime(): never {
  throw new Error('engine not yet implemented');
}

export function score(): never {
  throw new Error('engine not yet implemented');
}
