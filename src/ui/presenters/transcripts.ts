import type { GeneratedCase } from '../../engine';
import { formatSeconds } from './format';

export interface TranscriptLine {
  t_s: number;
  speaker: string;
  text: string;
  kind: 'speech' | 'sound' | 'atc';
}

/**
 * Observation phrase bank (DOMAIN CVR notation). Lines are timed from flight
 * event *times* only — never event.description, eventId, or causal-node text.
 */
const PHRASES = {
  atcApproach: 'Cleared for the approach, report field in sight.',
  atcTraffic: 'Traffic advisory as required.',
  atcSpeed: 'Maintain one seven zero until established.',
  atcRto: 'Roll remaining available if abort.',
  camField: 'Field not in sight, continuing.',
  camConfig: 'Flaps thirty-five.',
  camGear: 'Gear down, three green.',
  camIcing: 'Ice building on the windshield.',
  camFuel: 'Fuel flow looks low — checking.',
  camPower: 'Power loss — troubleshooting.',
  hotWhat: 'What the—',
  hotUnintelligible: '[unintelligible]',
  hotExclaim: '#',
  hotPull: 'Pull up —',
  soundBuffet: '[sound similar to airframe buffet]',
  soundShaker: '[stick shaker]',
  soundClick: '[sound of click]',
  soundImpact: '[sound of impact]',
  soundIncreasing: '[sound similar to increasing buffet]',
  soundBang: '[sound of bang]',
  soundFireBell: '[sound of fire bell]',
  rdoReadback: 'Cleared approach, will report field.',
  rdoMayday: 'Mayday mayday — declaring an emergency.',
} as const;

function impactT(bundle: GeneratedCase): number {
  return bundle.flight.samples[bundle.flight.impactIndex]?.t_s ?? 0;
}

/** Absolute times of script hooks, sorted — ids/descriptions unused for text. */
function eventTimes(bundle: GeneratedCase): number[] {
  return bundle.flight.events.map((e) => e.t_s).sort((a, b) => a - b);
}

function tAt(times: number[], indexFromEnd: number, fallback: number): number {
  if (times.length === 0) return fallback;
  const i = Math.max(0, times.length - 1 - indexFromEnd);
  return times[i] ?? fallback;
}

function linesForT4(bundle: GeneratedCase): TranscriptLine[] {
  const impact = impactT(bundle);
  const times = eventTimes(bundle);
  const base = tAt(times, 1, Math.max(0, impact - 20));
  return [
    { t_s: Math.max(0, base - 12), speaker: 'APP', text: PHRASES.atcApproach, kind: 'atc' },
    { t_s: Math.max(0, base - 10), speaker: 'RDO-1', text: PHRASES.rdoReadback, kind: 'speech' },
    { t_s: Math.max(0, base - 8), speaker: 'CAM', text: PHRASES.camField, kind: 'speech' },
    { t_s: Math.max(0, base - 5), speaker: 'HOT-2', text: PHRASES.camIcing, kind: 'speech' },
    { t_s: Math.max(0, base - 3), speaker: 'HOT-1', text: PHRASES.camConfig, kind: 'speech' },
    { t_s: base, speaker: 'CAM', text: PHRASES.soundBuffet, kind: 'sound' },
    { t_s: base + 1, speaker: 'CAM', text: PHRASES.soundShaker, kind: 'sound' },
    { t_s: base + 2, speaker: 'HOT-1', text: PHRASES.hotWhat, kind: 'speech' },
    { t_s: tAt(times, 0, base + 4), speaker: 'CAM', text: PHRASES.soundIncreasing, kind: 'sound' },
    { t_s: impact, speaker: 'CAM', text: PHRASES.soundImpact, kind: 'sound' },
  ];
}

function linesForT1(bundle: GeneratedCase): TranscriptLine[] {
  const impact = impactT(bundle);
  const times = eventTimes(bundle);
  const enter = tAt(times, 2, Math.max(0, impact - 40));
  return [
    { t_s: Math.max(0, enter - 20), speaker: 'CTR', text: PHRASES.atcTraffic, kind: 'atc' },
    { t_s: enter, speaker: 'CAM', text: PHRASES.soundClick, kind: 'sound' },
    { t_s: enter + 5, speaker: 'HOT-1', text: PHRASES.hotUnintelligible, kind: 'speech' },
    { t_s: tAt(times, 1, impact - 15), speaker: 'CAM', text: PHRASES.soundIncreasing, kind: 'sound' },
    { t_s: tAt(times, 0, impact - 5), speaker: 'HOT-1', text: PHRASES.hotPull, kind: 'speech' },
    { t_s: impact, speaker: 'CAM', text: PHRASES.soundImpact, kind: 'sound' },
  ];
}

function linesForT2(bundle: GeneratedCase): TranscriptLine[] {
  const impact = impactT(bundle);
  const times = eventTimes(bundle);
  const quit = tAt(times, 2, Math.max(0, impact - 90));
  return [
    { t_s: Math.max(0, quit - 10), speaker: 'CAM', text: PHRASES.camFuel, kind: 'speech' },
    { t_s: quit, speaker: 'HOT-1', text: PHRASES.camPower, kind: 'speech' },
    { t_s: quit + 2, speaker: 'RDO-1', text: PHRASES.rdoMayday, kind: 'speech' },
    { t_s: tAt(times, 1, impact - 20), speaker: 'CAM', text: PHRASES.soundClick, kind: 'sound' },
    { t_s: tAt(times, 0, impact - 5), speaker: 'HOT-1', text: PHRASES.hotWhat, kind: 'speech' },
    { t_s: impact, speaker: 'CAM', text: PHRASES.soundImpact, kind: 'sound' },
  ];
}

function linesForT6(bundle: GeneratedCase): TranscriptLine[] {
  const impact = impactT(bundle);
  const times = eventTimes(bundle);
  const burst = tAt(times, 2, Math.max(0, impact - 30));
  return [
    { t_s: Math.max(0, burst - 15), speaker: 'TWR', text: PHRASES.atcRto, kind: 'atc' },
    { t_s: burst, speaker: 'CAM', text: PHRASES.soundBang, kind: 'sound' },
    { t_s: burst + 1, speaker: 'CAM', text: PHRASES.soundFireBell, kind: 'sound' },
    { t_s: burst + 2, speaker: 'HOT-1', text: PHRASES.hotWhat, kind: 'speech' },
    { t_s: burst + 3, speaker: 'HOT-2', text: 'Rejecting —', kind: 'speech' },
    { t_s: tAt(times, 0, impact - 5), speaker: 'CAM', text: PHRASES.soundIncreasing, kind: 'sound' },
    { t_s: impact, speaker: 'CAM', text: PHRASES.soundImpact, kind: 'sound' },
  ];
}

function linesGeneric(bundle: GeneratedCase): TranscriptLine[] {
  const impact = impactT(bundle);
  return [
    { t_s: Math.max(0, impact - 30), speaker: 'ATC', text: PHRASES.atcTraffic, kind: 'atc' },
    { t_s: Math.max(0, impact - 12), speaker: 'HOT-1', text: PHRASES.camGear, kind: 'speech' },
    { t_s: Math.max(0, impact - 6), speaker: 'CAM', text: PHRASES.soundBuffet, kind: 'sound' },
    { t_s: Math.max(0, impact - 3), speaker: 'HOT-1', text: PHRASES.hotWhat, kind: 'speech' },
    { t_s: impact, speaker: 'CAM', text: PHRASES.soundImpact, kind: 'sound' },
  ];
}

/** Deterministic CVR/ATC lines anchored to flight event *times* (UI presenter). */
export function presentCvr(bundle: GeneratedCase): TranscriptLine[] {
  const tid = bundle.truth.templateId;
  let lines: TranscriptLine[];
  switch (tid) {
    case 'T4':
      lines = linesForT4(bundle);
      break;
    case 'T1':
      lines = linesForT1(bundle);
      break;
    case 'T2':
      lines = linesForT2(bundle);
      break;
    case 'T6':
      lines = linesForT6(bundle);
      break;
    default:
      lines = linesGeneric(bundle);
  }
  return lines.sort((a, b) => a.t_s - b.t_s);
}

export function presentAtc(bundle: GeneratedCase): TranscriptLine[] {
  return presentCvr(bundle).filter((l) => l.kind === 'atc' || l.speaker === 'ATC' || /^(TWR|DEP|APP|CTR|GND)$/.test(l.speaker));
}

export function formatTranscriptStamp(t_s: number): string {
  return formatSeconds(t_s);
}
