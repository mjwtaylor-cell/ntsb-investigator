/** Recorder / NVM evidence stubs derived from archetype + track. */

import type { Archetype } from '../archetypes';
import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildRecorderItems(
  archetype: Archetype,
  track: FlightTrack,
): EvidenceItem[] {
  void track;
  const items: EvidenceItem[] = [];
  if (archetype.recorders.fdr !== 'none') {
    items.push({
      id: 'recorders.fdr_capability_note',
      group: 'recorders',
      title: `FDR fitment note (${archetype.recorders.fdr})`,
      cost: 0,
      leadTime: 0,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    });
  }
  if (archetype.recorders.cvr) {
    items.push({
      id: 'recorders.cvr_capability_note',
      group: 'recorders',
      title: 'CVR fitment note',
      cost: 0,
      leadTime: 0,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    });
  }
  return items;
}
