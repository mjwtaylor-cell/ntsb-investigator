/** Weather package evidence derived from truth + track winds. */

import type { CaseTruth, EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildWeatherItems(
  truth: CaseTruth,
  track: FlightTrack,
): EvidenceItem[] {
  void truth;
  const sample = track.samples[Math.min(track.impactIndex, track.samples.length - 1)];
  const wind = sample
    ? `${sample.windDir_deg}°/${sample.windSpeed_kt} kt`
    : 'unknown';
  return [
    {
      id: 'wx.site_observation_stub',
      group: 'meteorology',
      title: `Near-site wind estimate at impact (${wind})`,
      cost: 1,
      leadTime: 1,
      prereqs: [],
      reveals: [],
      decay: 30,
      renderer: 'document',
    },
  ];
}
