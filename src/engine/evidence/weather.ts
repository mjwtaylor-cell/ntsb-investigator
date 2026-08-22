/** Weather package evidence (METAR/TAF/AIRMET style stubs). */

import type { CaseTruth, EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildWeatherItems(
  truth: CaseTruth,
  track: FlightTrack,
): EvidenceItem[] {
  void track;
  const icing = truth.templateId === 'T4' || truth.templateId === 'T1';
  return [
    {
      id: 'wx.metar_taf_package',
      group: 'meteorology',
      title: 'METAR/TAF/AIRMET package along route',
      cost: 1,
      leadTime: 1,
      prereqs: [],
      decay: 30,
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'wx.icing_airmet_pirep',
      group: 'meteorology',
      title: icing
        ? 'Icing AIRMET / PIREP package'
        : 'Upper-air sounding and winds aloft',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      decay: 30,
      reveals: [],
      renderer: 'document',
    },
  ];
}
