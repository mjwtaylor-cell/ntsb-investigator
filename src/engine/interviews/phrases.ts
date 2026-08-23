/** Observational interview phrase banks — never truth-node text. */

import type { InterviewSubjectId } from './types';

const ADMISSIONS: Record<string, string[]> = {
  weather_on_release: [
    'Freezing drizzle was in the package; I briefed the crew on the arrival weather.',
    'The TAF carried a freezing precipitation tempo around their ETA.',
  ],
  no_icing_remark: [
    'I did not annotate an icing limitation on the release itself.',
    'The release weather block did not carry a special icing remark.',
  ],
  mel_awareness: [
    'I knew there was an open deferred item on the de-ice boots.',
    'The MEL sheet showed the outboard boot still deferred that morning.',
  ],
  schedule_pressure: [
    'We had been running short turns on that route for a few weeks.',
    'The afternoon banks were tight; nobody wanted a long delay.',
  ],
  parts_delay: [
    'The boot section was on order; we were waiting on the vendor.',
    'Parts were delayed, so the item stayed deferred.',
  ],
  repeat_deferral_paperwork: [
    'The second deferral reused the earlier date field on the form.',
    'I was told to carry the deferral forward with the same paperwork.',
  ],
  radio_calls: [
    'They checked in on the approach frequency; transmissions sounded routine.',
    'I did not hear a mayday or pan-pan on the frequency.',
  ],
  no_emergency_declared: [
    'No emergency was declared to my knowledge.',
    'They did not report an emergency or request priority handling.',
  ],
  sound_description: [
    'It sounded like sputtering or a surge, then quiet.',
    'I heard a rising then cutting sound before the impact noise.',
  ],
  lights_seen: [
    'I saw lights low on the approach path, then they disappeared.',
    'Landing lights were visible briefly before the field went dark.',
  ],
  syllabus_gap: [
    'Tailplane icing recognition is not a separate checked item in our syllabus.',
    'We cover airframe icing generally; the tailplane module is thin.',
  ],
};

const DEFLECTIONS: Record<string, string[]> = {
  crew_decision: [
    'Configuration and airspeed on final are crew decisions.',
    'I was not in the cockpit; that call belonged to the flight crew.',
  ],
  company_policy: [
    'Policy allows dispatch with that deferral category under the MEL.',
    'We followed the written MEL procedures as I understood them.',
  ],
  maintenance_culture: [
    'Maintenance answers to a different chain; I focus on flight ops.',
    'I cannot speak to every deferred item on the line.',
  ],
  mel_process: [
    'MEL control sits with maintenance control, not with my desk.',
    'Repeat deferrals are a maintenance-control process question.',
  ],
  management_direction: [
    'I deferred what control asked me to defer.',
    'The paperwork came back approved from maintenance control.',
  ],
};

const TOPIC_OPENERS: Record<string, string> = {
  release_weather: 'Walk me through the weather you put on the release.',
  deferred_boot: 'What did you know about the deferred boot item that morning?',
  company_icing_policy: 'How does company policy handle dispatch into known icing with boots deferred?',
  schedule: 'Describe the schedule pressure on that route recently.',
  mel_oversight: 'Who owns MEL repeat-deferral oversight at the company?',
  boot_deferral: 'Explain the paperwork trail on the boot deferral.',
  parts_status: 'What was the parts status and any functional check?',
  final_calls: 'What radio calls do you recall on final?',
  what_heard: 'What did you hear?',
  what_seen: 'What did you see along the approach path?',
  icing_training: 'How does the training program cover icing recognition?',
  approach_standards: 'What are the standards for an unstabilised approach?',
};

export function topicOpener(topicId: string): string {
  return TOPIC_OPENERS[topicId] ?? 'Tell me what you remember about that topic.';
}

export function pickAdmission(
  key: string,
  subjectId: InterviewSubjectId,
  topicId: string,
): string {
  const list = ADMISSIONS[key] ?? [
    'I can confirm the factual timeline as far as my notes go.',
  ];
  const idx = hashPick(`${subjectId}:${topicId}:${key}`, list.length);
  return list[idx]!;
}

export function pickDeflection(
  key: string,
  subjectId: InterviewSubjectId,
  topicId: string,
): string {
  const list = DEFLECTIONS[key] ?? [
    'That sits outside what I personally handled.',
  ];
  const idx = hashPick(`${subjectId}:${topicId}:def:${key}`, list.length);
  return list[idx]!;
}

function hashPick(s: string, n: number): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % n;
}
