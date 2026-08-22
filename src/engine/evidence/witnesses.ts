/** Witness evidence — template text, placement along track. */

import { createRng } from '../rng';
import type { CaseTruth, EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

const STATEMENTS = [
  'I saw the airplane descending steeply with a wing low.',
  'It sounded like the engine was sputtering, then a loud rush.',
  'Lights were visible through the cloud base, then they vanished.',
  'There was a bang like a backfire before it went down.',
  'It looked normal on approach until the nose dropped suddenly.',
] as const;

export function buildWitnessItems(
  truth: CaseTruth,
  track: FlightTrack,
): EvidenceItem[] {
  const rng = createRng(truth.seed).fork('witnesses');
  void track;
  void rng;
  return [
    {
      id: 'witness.ground_observers',
      group: 'witnesses',
      title: 'Ground observer statements',
      cost: 2,
      leadTime: 3,
      prereqs: [],
      decay: 14,
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'witness.line_service',
      group: 'witnesses',
      title: 'Line-service / ramp witness interview',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      decay: 14,
      reveals: [],
      renderer: 'dialogue',
    },
    {
      id: 'witness.cabin_ice_observation',
      group: 'witnesses',
      title: 'Cabin / passenger ice observation (if any)',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      decay: 14,
      reveals: [],
      renderer: 'dialogue',
    },
  ];
}

/** Generate short witness statement texts for a seed (template flavour). */
export function witnessStatements(seed: string): string[] {
  const rng = createRng(seed).fork('witnesses');
  const n = rng.nextInt(3, 6);
  return Array.from({ length: n }, () => rng.pick(STATEMENTS));
}
