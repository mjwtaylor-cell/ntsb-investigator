/** Wreckage evidence stubs derived from impact sample. */

import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildWreckageItems(track: FlightTrack): EvidenceItem[] {
  const impact = track.samples[track.impactIndex] ?? track.samples.at(-1);
  const speed = impact?.ias_kt ?? 0;
  const angle = impact ? Math.abs(impact.pitch_deg) : 0;
  const trail = Math.round(speed * Math.cos((angle * Math.PI) / 180) * 8);
  return [
    {
      id: 'structures.debris_trail_estimate',
      group: 'structures',
      title: `Debris trail length estimate (~${Math.max(20, trail)} ft stub)`,
      cost: 1,
      leadTime: 2,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'structures.photo_set_site',
      group: 'structures',
      title: 'Site photo set (PIP / ground scar)',
      cost: 1,
      leadTime: 1,
      prereqs: [],
      reveals: [],
      renderer: 'photo-set',
    },
  ];
}
