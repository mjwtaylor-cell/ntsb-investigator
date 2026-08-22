/** Wreckage / impact geometry evidence from final flight state. */

import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildWreckageItems(track: FlightTrack): EvidenceItem[] {
  const impact = track.samples[track.impactIndex];
  const steep = impact ? Math.abs(impact.pitch_deg) > 12 : false;
  return [
    {
      id: 'structures.wreckage_map',
      group: 'structures',
      title: steep
        ? 'Wreckage distribution map (compact high-angle field)'
        : 'Wreckage distribution map and PIP',
      cost: 3,
      leadTime: 5,
      prereqs: [],
      reveals: [],
      renderer: 'map',
    },
    {
      id: 'structures.ground_scar_survey',
      group: 'structures',
      title: steep
        ? 'Ground-scar / crater survey'
        : 'Ground-scar and slide-path survey',
      cost: 2,
      leadTime: 4,
      prereqs: [],
      reveals: [],
      renderer: 'photo-set',
    },
    {
      id: 'systems.cockpit_switch_exam',
      group: 'systems',
      title: 'Cockpit switch and instrument-position exam',
      cost: 2,
      leadTime: 3,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'photo-set',
    },
  ];
}
