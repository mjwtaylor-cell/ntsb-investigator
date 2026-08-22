/** Player actions and event-sourced case state (B2.7 / B2.14). */

import type { Grade, InvestigativeGroup } from './ids';
import type { CaseTruth, NodeTier } from './causal';
import type { World } from './world';
import type { EvidenceCatalogue } from './evidence';

/** Player-authored finding on the board. */
export interface PlayerFinding {
  id: string;
  text: string;
  tier: NodeTier;
  /** Evidence ids cited in support. */
  citedEvidenceIds: string[];
  /** Optional link to a truth node id once revealed / claimed. */
  claimedNodeId?: string;
}

export interface PlayerRecommendation {
  id: string;
  recipient: 'faa' | 'manufacturer' | 'operator' | 'industry';
  text: string;
  /** Latent / precondition node targeted, if any. */
  targetNodeId?: string;
  urgent: boolean;
}

export type Action =
  | { type: 'requestEvidence'; evidenceId: string }
  | { type: 'standUpGroup'; group: InvestigativeGroup }
  | { type: 'standDownGroup'; group: InvestigativeGroup }
  | { type: 'advanceTime'; days: number }
  | { type: 'secureEvidence'; evidenceId: string }
  | { type: 'subpoena'; partyId: string }
  | { type: 'issueUrgentRec'; recommendation: PlayerRecommendation }
  | { type: 'upsertFinding'; finding: PlayerFinding }
  | { type: 'removeFinding'; findingId: string }
  | { type: 'linkFindings'; fromFindingId: string; toFindingId: string }
  | { type: 'respondPressure'; eventId: string; choiceId: string }
  | { type: 'submitReport' };

export interface QueuedWork {
  id: string;
  /** Action that spawned this queued result. */
  source: Action;
  /** Calendar day when the result resolves. */
  etaDay: number;
  costCharged: number;
}

/**
 * Mutable investigation state.
 * Persisted as `reduce(seed, actionLog)` (B2.14).
 */
export interface CaseState {
  seed: string;
  calendarDay: number;
  boardDeadlineDay: number;
  investigatorDaysRemaining: number;
  investigatorDaysSpent: number;
  publicConfidence: number;
  /** Party id → cooperation 0–100. */
  partyCooperation: Record<string, number>;
  activeGroups: InvestigativeGroup[];
  obtainedEvidenceIds: string[];
  securedEvidenceIds: string[];
  /** Evidence ids lost to decay. */
  decayedEvidenceIds: string[];
  queue: QueuedWork[];
  actionLog: Action[];
  findings: PlayerFinding[];
  /** "led to" links between finding ids. */
  findingEdges: { from: string; to: string }[];
  recommendations: PlayerRecommendation[];
  pressureResolvedIds: string[];
  submitted: boolean;
}

/** Par budget derived from the minimum sufficient evidence set (B2.7). */
export interface Par {
  investigatorDays: number;
  calendarDays: number;
  /** Evidence ids in the minimum sufficient set. */
  evidenceSet: string[];
}

/** Score breakdown after board submission (B2.9). */
export interface ScoreReport {
  total: number;
  grade: Grade;
  /** Coverage C in [0, 1] before the 50·C scale factor. */
  coverage: number;
  precisionPenalty: number;
  statement: number;
  recommendations: number;
  efficiency: number;
}

/** Output of `generateCase` (TECH.md). */
export interface CaseBundle {
  truth: CaseTruth;
  world: World;
  evidence: EvidenceCatalogue;
  par: Par;
}
