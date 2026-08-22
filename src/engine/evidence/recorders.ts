/** FDR / CVR / NVM evidence stubs derived from flight track + archetype. */

import type { Archetype } from '../archetypes';
import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildRecorderItems(
  archetype: Archetype,
  track: FlightTrack,
): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  const impact = track.samples[track.impactIndex];
  const note = impact
    ? `impact≈${impact.ias_kt} kt / ${impact.pitch_deg}° pitch`
    : 'no impact sample';

  if (archetype.recorders.fdr !== 'none') {
    items.push({
      id: 'fdr.readout',
      group: 'recorders',
      title:
        archetype.recorders.fdr === 'lightweight'
          ? 'Lightweight FDR readout'
          : 'FDR parametric readout',
      cost: 3,
      leadTime: 14,
      prereqs: ['recorders.recovery'],
      reveals: [],
      renderer: 'trace',
    });
  }
  if (archetype.recorders.cvr) {
    items.push({
      id: 'cvr.transcript',
      group: 'recorders',
      title: 'CVR transcript',
      cost: 3,
      leadTime: 14,
      prereqs: ['recorders.recovery'],
      reveals: [],
      renderer: 'transcript',
    });
  }
  if (archetype.recorders.engineMonitorNvm) {
    items.push({
      id: 'nvm.engine_monitor',
      group: 'systems',
      title: `Engine-monitor NVM (${note})`,
      cost: 2,
      leadTime: 4,
      prereqs: ['nvm.device_recovery'],
      reveals: [],
      renderer: 'trace',
    });
  }
  if (archetype.recorders.portableGps) {
    items.push({
      id: 'nvm.portable_gps',
      group: 'systems',
      title: 'Portable / panel GPS track log',
      cost: 2,
      leadTime: 4,
      prereqs: ['nvm.device_recovery'],
      reveals: [],
      renderer: 'trace',
    });
  }
  return items;
}
