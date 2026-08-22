/** Truth-graph types: causal nodes and the case truth DAG (B2.4). */

import type { ArchetypeId, Difficulty, TemplateId } from './ids';

/** Scoring weight tier for a node on the findings board. */
export type NodeTier =
  | 'probableCause'
  | 'contributing'
  | 'precondition'
  | 'nonCausal';

/** Structural role of a node in the accident chain. */
export type CausalNodeKind =
  | 'latentCondition'
  | 'precondition'
  | 'initiatingEvent'
  | 'propagation'
  | 'crewAction'
  | 'outcome'
  | 'nonCausalCondition';

/** Which evidence exposes a node, and how strongly (0..1). */
export interface EvidenceRevealLink {
  evidenceId: string;
  /** Reveal strength in [0, 1]. */
  strength: number;
}

export interface CausalNode {
  /** Stable id, e.g. `latent.mel_misuse`. */
  id: string;
  kind: CausalNodeKind;
  tier: NodeTier;
  /** Finding-style declarative sentence. */
  text: string;
  /** Evidence items that expose this node. */
  revealedBy: EvidenceRevealLink[];
  /** Red-herring / mutual-exclusion interplay. */
  conflictsWith?: string[];
}

/** Directed "led to" edge in the truth DAG. */
export interface CausalEdge {
  from: string;
  to: string;
}

/**
 * Hidden simulated truth for a generated case.
 * Player never sees this object until debrief.
 */
export interface CaseTruth {
  seed: string;
  archetypeId: ArchetypeId;
  templateId: TemplateId;
  difficulty: Difficulty;
  nodes: CausalNode[];
  edges: CausalEdge[];
}

/** Tier → scoring weight (B2.9). */
export const NODE_TIER_WEIGHT: Readonly<Record<NodeTier, number>> = {
  probableCause: 3,
  contributing: 1.5,
  precondition: 1,
  nonCausal: 0,
};
