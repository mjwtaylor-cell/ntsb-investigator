/** Radar / ADS-B evidence derived from flight track. */

import type { Archetype } from '../archetypes';
import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildRadarItems(
  archetype: Archetype,
  track: FlightTrack,
): EvidenceItem[] {
  const items: EvidenceItem[] = [
    {
      id: 'atc.radar_summary',
      group: 'atc',
      title: 'ASR / Mode C summary (≈4.6 s sweeps)',
      cost: 1,
      leadTime: 3,
      prereqs: [],
      reveals: [],
      renderer: 'table',
      decay: 15,
    },
  ];
  if (archetype.recorders.adsBOut) {
    items.push({
      id: 'adsb.track_meta',
      group: 'atc',
      title: `ADS-B track metadata (${track.samples.length} samples @ 1 Hz)`,
      cost: 0,
      leadTime: 0,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    });
  }
  return items;
}
