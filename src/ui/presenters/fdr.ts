import type { FlightSample, FlightTrack, GeneratedCase } from '../../engine';

export interface FdrSeries {
  t_s: number[];
  altitude_ft: number[];
  ias_kt: number[];
  pitch_deg: number[];
  flap_deg: number[];
  events: FlightTrack['events'];
  /** Indices into the downsampled arrays. */
  sampleIndex: number[];
}

const MAX_POINTS = 480;

/** Prefer the last window before impact for readable strips. */
export function presentFdr(bundle: GeneratedCase, windowSec = 600): FdrSeries {
  const { samples, events, impactIndex } = bundle.flight;
  const end = Math.min(samples.length - 1, impactIndex + 5);
  const endT = samples[end]?.t_s ?? 0;
  const startT = Math.max(0, endT - windowSec);
  const window = samples.filter((s) => s.t_s >= startT && s.t_s <= endT);
  const step = Math.max(1, Math.ceil(window.length / MAX_POINTS));
  const picked: FlightSample[] = [];
  for (let i = 0; i < window.length; i += step) {
    const s = window[i];
    if (s) picked.push(s);
  }
  const last = window[window.length - 1];
  if (last && picked[picked.length - 1] !== last) picked.push(last);

  return {
    t_s: picked.map((s) => s.t_s),
    altitude_ft: picked.map((s) => s.pressureAltitude_ft),
    ias_kt: picked.map((s) => s.ias_kt),
    pitch_deg: picked.map((s) => s.pitch_deg),
    flap_deg: picked.map((s) => s.flap_deg),
    events: events.filter((e) => e.t_s >= startT && e.t_s <= endT),
    sampleIndex: picked.map((_, i) => i),
  };
}

export function sampleAt(bundle: GeneratedCase, t_s: number): FlightSample | undefined {
  const samples = bundle.flight.samples;
  if (samples.length === 0) return undefined;
  let best = samples[0]!;
  let bestD = Math.abs(best.t_s - t_s);
  // Binary-ish scan: samples are 1 Hz monotonic
  const i = Math.max(0, Math.min(samples.length - 1, Math.round(t_s - (samples[0]?.t_s ?? 0))));
  for (let k = Math.max(0, i - 2); k <= Math.min(samples.length - 1, i + 2); k++) {
    const s = samples[k]!;
    const d = Math.abs(s.t_s - t_s);
    if (d < bestD) {
      best = s;
      bestD = d;
    }
  }
  return best;
}
