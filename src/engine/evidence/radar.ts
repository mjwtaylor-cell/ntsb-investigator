/** Radar ASR (~4.6 s) and ADS-B (~1 Hz) evidence stubs. */

import type { Archetype } from '../archetypes';
import type { EvidenceItem } from '../types';
import type { FlightTrack } from '../sim';

export function buildRadarItems(
  archetype: Archetype,
  track: FlightTrack,
): EvidenceItem[] {
  const items: EvidenceItem[] = [
    {
      id: 'radar.asr_extract',
      group: 'atc',
      title: 'ASR radar extract (≈4.6 s / Mode C 100 ft)',
      cost: 1,
      leadTime: 5,
      prereqs: [],
      decay: 15,
      reveals: [],
      renderer: 'map',
    },
  ];
  if (archetype.recorders.adsBOut) {
    items.push({
      id: 'adsb.track',
      group: 'atc',
      title: `ADS-B track reconstruction (${track.samples.length} s)`,
      cost: 1,
      leadTime: 2,
      prereqs: [],
      reveals: [],
      renderer: 'map',
    });
  }
  return items;
}

/** Downsample 1 Hz track to ASR-like ~4.6 s returns with Mode C quantisation. */
export function asrReturns(
  track: FlightTrack,
): { t_s: number; alt_100ft: number; lat_deg: number; lon_deg: number }[] {
  const out: {
    t_s: number;
    alt_100ft: number;
    lat_deg: number;
    lon_deg: number;
  }[] = [];
  for (let t = 0; t < track.samples.length; t += 5) {
    const s = track.samples[t];
    if (!s) continue;
    out.push({
      t_s: s.t_s,
      alt_100ft: Math.round(s.pressureAltitude_ft / 100) * 100,
      lat_deg: s.lat_deg,
      lon_deg: s.lon_deg,
    });
  }
  return out;
}
