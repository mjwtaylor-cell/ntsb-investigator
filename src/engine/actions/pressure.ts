/** Seeded pressure events (full set, 6 per case) with response choices. */

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
  /** Multiply remaining investigator-days (e.g. 0.85 budget cut). */
  budgetMult?: number;
}

export interface PressureEvent {
  id: string;
  title: string;
  body: string;
  /** Calendar day when the event fires if not yet resolved. */
  triggerDay: number;
  choices: PressureChoice[];
}

/** Full DESIGN B2.3 catalogue — first three preserve P1 day-draw order. */
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
  {
    title: 'Similar incident elsewhere',
    body: 'Another operator reports a related occurrence; advocates press for an urgent recommendation.',
    choices: [
      {
        id: 'urgent_review',
        label: 'Open urgent-rec review board',
        cost: 3,
        confidenceDelta: 3,
      },
      {
        id: 'monitor',
        label: 'Monitor and wait for lab results',
        cost: 1,
        confidenceDelta: 0,
      },
      {
        id: 'defer',
        label: 'Defer entirely to the other investigation',
        cost: 0,
        confidenceDelta: -5,
      },
    ],
  },
  {
    title: 'Family briefing request',
    body: 'Next of kin ask for a closed factual update before any public statement.',
    choices: [
      {
        id: 'brief_family',
        label: 'Hold a closed family factual brief',
        cost: 2,
        confidenceDelta: 5,
      },
      {
        id: 'written',
        label: 'Send a written process letter only',
        cost: 1,
        confidenceDelta: 1,
      },
      {
        id: 'postpone',
        label: 'Postpone until more facts land',
        cost: 0,
        confidenceDelta: -4,
      },
    ],
  },
  {
    title: 'Budget cut',
    body: 'Headquarters trims investigation support; investigator-days shrink mid-case.',
    choices: [
      {
        id: 'absorb',
        label: 'Absorb the cut; stand down one group',
        cost: 0,
        confidenceDelta: -2,
        budgetMult: 0.85,
      },
      {
        id: 'appeal',
        label: 'Appeal for a partial restoration',
        cost: 2,
        confidenceDelta: 1,
        budgetMult: 0.92,
      },
      {
        id: 'public',
        label: 'Note the constraint in a public update',
        cost: 1,
        confidenceDelta: -1,
        budgetMult: 0.85,
      },
    ],
  },
];

/** Build 6 deterministic pressure events for a seed (appends draws after P1 trio). */
export function buildPressureEvents(seed: string): PressureEvent[] {
  const rng = createRng(seed).fork('pressure');
  const days = [
    rng.nextInt(3, 12),
    rng.nextInt(15, 40),
    rng.nextInt(45, 90),
    rng.nextInt(18, 55),
    rng.nextInt(60, 120),
    rng.nextInt(80, 150),
  ];
  // Keep original relative order of the first three templates; sort all by day.
  const indexed = TEMPLATES.map((t, i) => ({ t, day: days[i]!, i }));
  indexed.sort((a, b) => a.day - b.day || a.i - b.i);
  return indexed.map(({ t, day }, ord) => ({
    ...t,
    id: `pressure.${ord + 1}`,
    triggerDay: day,
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

  let remaining = state.investigatorDaysRemaining - choice.cost;
  let spent = state.investigatorDaysSpent + choice.cost;
  if (choice.budgetMult !== undefined) {
    const before = remaining;
    remaining = Math.max(0, Math.floor(remaining * choice.budgetMult));
    spent += before - remaining;
  }

  return {
    ...state,
    investigatorDaysRemaining: remaining,
    investigatorDaysSpent: spent,
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
