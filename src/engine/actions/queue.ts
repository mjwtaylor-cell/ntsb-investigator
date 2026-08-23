/** Action queue: ETA resolution when time advances. */

import type { Action, CaseBundle, CaseState, QueuedWork } from '../types';
import { catalogueById } from './decay';

let queueSeq = 0;

export function nextQueueId(seed: string, day: number): string {
  queueSeq += 1;
  return `q.${seed}.${day}.${queueSeq}`;
}

/** Reset module counter (tests / generateCase). */
export function resetQueueSeq(): void {
  queueSeq = 0;
}

export function enqueueRequest(
  state: CaseState,
  bundle: CaseBundle,
  evidenceId: string,
): CaseState {
  const item = catalogueById(bundle).get(evidenceId);
  if (!item) {
    throw new Error(`Unknown evidence: ${evidenceId}`);
  }
  if (state.decayedEvidenceIds.includes(evidenceId)) {
    throw new Error(`Evidence decayed: ${evidenceId}`);
  }
  if (evidenceId.startsWith('interview.')) {
    throw new Error('Conduct interview topics via the Interview panel');
  }
  if (
    state.obtainedEvidenceIds.includes(evidenceId) ||
    state.queue.some(
      (q) => q.source.type === 'requestEvidence' && q.source.evidenceId === evidenceId,
    )
  ) {
    return state;
  }
  for (const pre of item.prereqs) {
    if (!state.obtainedEvidenceIds.includes(pre)) {
      throw new Error(`Prerequisite not obtained: ${pre} for ${evidenceId}`);
    }
  }
  if (
    item.partyCooperationMin !== undefined &&
    item.partyId &&
    (state.partyCooperation[item.partyId] ?? 0) < item.partyCooperationMin
  ) {
    throw new Error(`Party cooperation too low for ${evidenceId}`);
  }

  const cost = item.cost;
  if (state.investigatorDaysRemaining < cost) {
    throw new Error('Insufficient investigator-days');
  }

  const work: QueuedWork = {
    id: nextQueueId(state.seed, state.calendarDay),
    source: { type: 'requestEvidence', evidenceId },
    etaDay: state.calendarDay + item.leadTime,
    costCharged: cost,
  };

  if (item.leadTime === 0) {
    return {
      ...state,
      investigatorDaysRemaining: state.investigatorDaysRemaining - cost,
      investigatorDaysSpent: state.investigatorDaysSpent + cost,
      obtainedEvidenceIds: [...state.obtainedEvidenceIds, evidenceId].sort(),
      actionLog: [...state.actionLog, { type: 'requestEvidence', evidenceId }],
    };
  }

  return {
    ...state,
    investigatorDaysRemaining: state.investigatorDaysRemaining - cost,
    investigatorDaysSpent: state.investigatorDaysSpent + cost,
    queue: [...state.queue, work],
    actionLog: [...state.actionLog, { type: 'requestEvidence', evidenceId }],
  };
}

/** Resolve queue items whose ETA ≤ calendarDay. */
export function resolveQueue(state: CaseState): CaseState {
  const due = state.queue.filter((q) => q.etaDay <= state.calendarDay);
  const pending = state.queue.filter((q) => q.etaDay > state.calendarDay);
  if (due.length === 0) return state;

  const obtained = new Set(state.obtainedEvidenceIds);
  for (const q of due) {
    if (q.source.type === 'requestEvidence') {
      obtained.add(q.source.evidenceId);
    }
  }
  return {
    ...state,
    queue: pending,
    obtainedEvidenceIds: Array.from(obtained).sort(),
  };
}

export function daysUntilNextResult(state: CaseState): number | null {
  if (state.queue.length === 0) return null;
  const next = Math.min(...state.queue.map((q) => q.etaDay));
  return Math.max(0, next - state.calendarDay);
}

export type { Action };
