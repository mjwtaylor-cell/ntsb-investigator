/** Pure CaseState reducer for investigation actions. */

import type {
  Action,
  CaseBundle,
  CaseState,
  InvestigativeGroup,
} from '../types';
import { applyDecay, isEvidenceAvailable } from './decay';
import { enqueueRequest, resolveQueue } from './queue';
import {
  applyPressureResponse,
  type PressureEvent,
} from './pressure';
import { conductInterview } from '../interviews';

/** Investigator-days burned per active group per calendar day. */
export const GROUP_DAILY_BURN = 0.35;

/** Groups assumed when folding burn into par (B2.7 sanity: 5-group case). */
export const EXPECTED_GROUPS_FOR_PAR = 5;

/** Evidence-cost multiplier baked into par (same for Standard and Senior). */
export const PAR_EVIDENCE_MULT = 1.6;

export interface ReduceContext {
  bundle: CaseBundle;
  pressureEvents: PressureEvent[];
}

export function createInitialState(bundle: CaseBundle): CaseState {
  const budgetMult = bundle.truth.difficulty === 'senior' ? 1.1 : 1.5;
  return {
    seed: bundle.truth.seed,
    calendarDay: 0,
    boardDeadlineDay: 180,
    investigatorDaysRemaining: Math.ceil(
      bundle.par.investigatorDays * budgetMult,
    ),
    investigatorDaysSpent: 0,
    publicConfidence: 72,
    partyCooperation: {
      operator: 65,
      manufacturer: 60,
      faa: 70,
    },
    activeGroups: [],
    obtainedEvidenceIds: [],
    securedEvidenceIds: [],
    decayedEvidenceIds: [],
    queue: [],
    actionLog: [],
    findings: [],
    findingEdges: [],
    recommendations: [],
    pressureResolvedIds: [],
    submitted: false,
  };
}

function burnGroups(state: CaseState, days: number): CaseState {
  if (state.activeGroups.length === 0 || days <= 0) return state;
  const burn = state.activeGroups.length * GROUP_DAILY_BURN * days;
  return {
    ...state,
    investigatorDaysRemaining: Math.max(
      0,
      state.investigatorDaysRemaining - burn,
    ),
    investigatorDaysSpent: state.investigatorDaysSpent + burn,
  };
}

/** Advance calendar, resolve queue, apply decay, burn active groups. */
export function advanceTime(
  state: CaseState,
  days: number,
  bundle: CaseBundle,
): CaseState {
  if (days < 0) throw new Error('days must be >= 0');
  if (days === 0) return state;
  let next: CaseState = {
    ...state,
    calendarDay: state.calendarDay + days,
    actionLog: [...state.actionLog, { type: 'advanceTime', days }],
  };
  next = burnGroups(next, days);
  next = resolveQueue(next);
  next = applyDecay(next, bundle);
  return next;
}

export function applyAction(
  state: CaseState,
  action: Action,
  ctx: ReduceContext,
): CaseState {
  if (state.submitted && action.type !== 'upsertFinding') {
    throw new Error('Case already submitted');
  }
  const { bundle, pressureEvents } = ctx;

  switch (action.type) {
    case 'requestEvidence': {
      if (!isEvidenceAvailable(state, action.evidenceId)) {
        throw new Error(`Evidence unavailable: ${action.evidenceId}`);
      }
      return enqueueRequest(state, bundle, action.evidenceId);
    }
    case 'standUpGroup': {
      if (state.activeGroups.includes(action.group)) return state;
      return {
        ...state,
        activeGroups: [...state.activeGroups, action.group],
        actionLog: [...state.actionLog, action],
      };
    }
    case 'standDownGroup': {
      return {
        ...state,
        activeGroups: state.activeGroups.filter((g) => g !== action.group),
        actionLog: [...state.actionLog, action],
      };
    }
    case 'advanceTime':
      return advanceTime(state, action.days, bundle);
    case 'secureEvidence': {
      if (state.securedEvidenceIds.includes(action.evidenceId)) return state;
      return {
        ...state,
        securedEvidenceIds: [...state.securedEvidenceIds, action.evidenceId],
        actionLog: [...state.actionLog, action],
      };
    }
    case 'subpoena': {
      const party = action.partyId;
      const coop = { ...state.partyCooperation };
      coop[party] = Math.max(0, (coop[party] ?? 50) - 15);
      return {
        ...state,
        partyCooperation: coop,
        actionLog: [...state.actionLog, action],
      };
    }
    case 'issueUrgentRec': {
      const target = action.recommendation.targetNodeId;
      const node = target
        ? bundle.truth.nodes.find((n) => n.id === target)
        : undefined;
      const correct =
        !!node &&
        (node.kind === 'latentCondition' || node.kind === 'precondition');
      const delta = correct ? 5 : target ? -10 : -2;
      return {
        ...state,
        recommendations: [...state.recommendations, action.recommendation],
        publicConfidence: Math.max(
          0,
          Math.min(100, state.publicConfidence + delta),
        ),
        actionLog: [...state.actionLog, action],
      };
    }
    case 'upsertFinding': {
      const rest = state.findings.filter((f) => f.id !== action.finding.id);
      return {
        ...state,
        findings: [...rest, action.finding],
        actionLog: [...state.actionLog, action],
      };
    }
    case 'removeFinding': {
      return {
        ...state,
        findings: state.findings.filter((f) => f.id !== action.findingId),
        findingEdges: state.findingEdges.filter(
          (e) =>
            e.from !== action.findingId && e.to !== action.findingId,
        ),
        actionLog: [...state.actionLog, action],
      };
    }
    case 'linkFindings': {
      const edge = {
        from: action.fromFindingId,
        to: action.toFindingId,
      };
      if (
        state.findingEdges.some(
          (e) => e.from === edge.from && e.to === edge.to,
        )
      ) {
        return state;
      }
      return {
        ...state,
        findingEdges: [...state.findingEdges, edge],
        actionLog: [...state.actionLog, action],
      };
    }
    case 'conductInterview': {
      return conductInterview(state, action.subjectId as never, action.topicId).state;
    }
    case 'respondPressure':
      return applyPressureResponse(
        state,
        pressureEvents,
        action.eventId,
        action.choiceId,
      );
    case 'submitReport':
      return {
        ...state,
        submitted: true,
        actionLog: [...state.actionLog, action],
      };
    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}

export type { InvestigativeGroup };
