/** Seeded pressure events (P1: 3 events) with response choices. */

import { createRng } from '../rng';
import type { CaseState } from '../types';

export interface PressureChoice {
  id: string;
  label: string;
  /** Investigator-day cost (may be 0). */
  cost: number;
  /** Public confidence delta. */
  confidenceDelta: number;
  /** Optional party cooperation deltas. */
  partyDelta?: Record<string, number>;
}

export interface PressureEvent {
  id: string;
  title: string;
  body: string;
  /** Calendar day when the event fires if not yet resolved. */
  triggerDay: number;
  choices: PressureChoice[];
}

const TEMPLATES: Omit<PressureEvent, 'id' | 'triggerDay'>[] = [
  {
    title: 'Media leak of a working theory',
    body: 'A local outlet airs an unverified engine-failure narrative.',
    choices: [
      {
        id: 'brief',
        label: 'Issue a factual media brief',
        cost: 1,
        confidenceDelta: 4,
      },
      {
        id: 'ignore',
        label: 'No comment',
        cost: 0,
        confidenceDelta: -6,
      },
      {
        id: 'correct',
        label: 'Correct on record, cite docket process',
        cost: 2,
        confidenceDelta: 6,
      },
    ],
  },
  {
    title: 'Weather threatens the site',
    body: 'Forecast shows a storm that may erase perishable ground evidence.',
    choices: [
      {
        id: 'surge',
        label: 'Surge structures team overnight',
        cost: 3,
        confidenceDelta: 3,
      },
      {
        id: 'secure',
        label: 'Secure marked perishables only',
        cost: 1,
        confidenceDelta: 1,
      },
      {
        id: 'accept',
        label: 'Accept risk and continue planned work',
        cost: 0,
        confidenceDelta: -4,
      },
    ],
  },
  {
    title: 'Congressional letter',
    body: 'A committee requests an accelerated briefing on probable cause.',
    choices: [
      {
        id: 'schedule',
        label: 'Schedule a process briefing (no findings)',
        cost: 2,
        confidenceDelta: 5,
      },
      {
        id: 'decline',
        label: 'Decline pending board meeting',
        cost: 0,
        confidenceDelta: -3,
        partyDelta: { faa: -5 },
      },
      {
        id: 'interim',
        label: 'Release interim factual update',
        cost: 2,
        confidenceDelta: 2,
      },
    ],
  },
];

/** Build 3 deterministic pressure events for a seed. */
export function buildPressureEvents(seed: string): PressureEvent[] {
  const rng = createRng(seed).fork('pressure');
  const days = [rng.nextInt(3, 12), rng.nextInt(15, 40), rng.nextInt(45, 90)];
  days.sort((a, b) => a - b);
  return TEMPLATES.map((t, i) => ({
    ...t,
    id: `pressure.${i + 1}`,
    triggerDay: days[i]!,
    choices: t.choices.map((c) => ({ ...c })),
  }));
}

export function applyPressureResponse(
  state: CaseState,
  events: PressureEvent[],
  eventId: string,
  choiceId: string,
): CaseState {
  if (state.pressureResolvedIds.includes(eventId)) return state;
  const event = events.find((e) => e.id === eventId);
  if (!event) throw new Error(`Unknown pressure event: ${eventId}`);
  if (state.calendarDay < event.triggerDay) {
    throw new Error(`Pressure event not yet active: ${eventId}`);
  }
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Unknown choice: ${choiceId}`);
  if (state.investigatorDaysRemaining < choice.cost) {
    throw new Error('Insufficient investigator-days for pressure response');
  }

  const partyCooperation = { ...state.partyCooperation };
  if (choice.partyDelta) {
    for (const [k, d] of Object.entries(choice.partyDelta)) {
      partyCooperation[k] = Math.max(
        0,
        Math.min(100, (partyCooperation[k] ?? 50) + d),
      );
    }
  }

  return {
    ...state,
    investigatorDaysRemaining: state.investigatorDaysRemaining - choice.cost,
    investigatorDaysSpent: state.investigatorDaysSpent + choice.cost,
    publicConfidence: Math.max(
      0,
      Math.min(100, state.publicConfidence + choice.confidenceDelta),
    ),
    partyCooperation,
    pressureResolvedIds: [...state.pressureResolvedIds, eventId],
    actionLog: [
      ...state.actionLog,
      { type: 'respondPressure', eventId, choiceId },
    ],
  };
}

/** Pending pressure events that have triggered and are unresolved. */
export function activePressureEvents(
  state: CaseState,
  events: PressureEvent[],
): PressureEvent[] {
  return events.filter(
    (e) =>
      state.calendarDay >= e.triggerDay &&
      !state.pressureResolvedIds.includes(e.id),
  );
}
