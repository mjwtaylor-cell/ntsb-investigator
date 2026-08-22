/** Witness evidence stubs placed along the track. */

import { createRng } from '../rng';
import type { CaseTruth, EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildWitnessItems(
  truth: CaseTruth,
  track: FlightTrack,
): EvidenceItem[] {
  const rng = createRng(truth.seed).fork('witnesses');
  const count = rng.nextInt(3, 6);
  const impact = track.samples[track.impactIndex] ?? track.samples.at(-1);
  const lat = impact?.lat_deg ?? 0;
  const lon = impact?.lon_deg ?? 0;
  return [
    {
      id: 'witness.canvass_plan',
      group: 'witnesses',
      title: `Witness canvass plan (${count} observers near ${lat.toFixed(3)}, ${lon.toFixed(3)})`,
      cost: 1,
      leadTime: 1,
      prereqs: [],
      reveals: [],
      decay: 14,
      renderer: 'document',
    },
  ];
}
