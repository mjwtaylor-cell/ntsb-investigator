import type { GeneratedCase } from '../../engine';
import { formatSeconds } from './format';

export interface TranscriptLine {
  t_s: number;
  speaker: string;
  text: string;
  kind: 'speech' | 'sound' | 'atc';
}

/** Deterministic CVR/ATC lines anchored to flight events (UI presenter). */
export function presentCvr(bundle: GeneratedCase): TranscriptLine[] {
  const events = bundle.flight.events;
  const impact = bundle.flight.samples[bundle.flight.impactIndex];
  const impactT = impact?.t_s ?? 0;
  const flapEvt = events.find((e) => /flap/i.test(e.eventId) || /flap/i.test(e.description));
  const stallEvt = events.find(
    (e) => /stall/i.test(e.eventId) || /buffet/i.test(e.description) || /ice/i.test(e.eventId),
  );
  const base = flapEvt?.t_s ?? Math.max(0, impactT - 20);

  if (bundle.truth.templateId === 'T4') {
    return [
      { t_s: base - 12, speaker: 'ATC', text: 'Cleared for the approach, report field in sight.', kind: 'atc' },
      { t_s: base - 8, speaker: 'CAM', text: 'Field not in sight, continuing.', kind: 'speech' },
      { t_s: base - 3, speaker: 'FO', text: 'Flaps thirty-five.', kind: 'speech' },
      { t_s: base, speaker: 'HOT', text: '[sound similar to airframe buffet]', kind: 'sound' },
      {
        t_s: base + 2,
        speaker: 'CA',
        text: flapEvt ? flapEvt.description : 'What the—',
        kind: 'speech',
      },
      {
        t_s: stallEvt?.t_s ?? base + 4,
        speaker: 'HOT',
        text: stallEvt?.description ?? '[increasing buffet; pitch down]',
        kind: 'sound',
      },
      { t_s: impactT, speaker: 'HOT', text: '[sound of impact]', kind: 'sound' },
    ];
  }

  const lines: TranscriptLine[] = [
    { t_s: Math.max(0, impactT - 30), speaker: 'ATC', text: 'Traffic advisory as required.', kind: 'atc' },
  ];
  for (const e of events.slice(-4)) {
    lines.push({
      t_s: e.t_s,
      speaker: 'CAM',
      text: e.description,
      kind: 'speech',
    });
  }
  lines.push({ t_s: impactT, speaker: 'HOT', text: '[sound of impact]', kind: 'sound' });
  return lines.sort((a, b) => a.t_s - b.t_s);
}

export function presentAtc(bundle: GeneratedCase): TranscriptLine[] {
  return presentCvr(bundle).filter((l) => l.kind === 'atc' || l.speaker === 'ATC');
}

export function formatTranscriptStamp(t_s: number): string {
  return formatSeconds(t_s);
}
