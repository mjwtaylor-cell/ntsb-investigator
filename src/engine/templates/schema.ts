/** Failure-mode template schema: causal graph + hooks (B2.4). */

import type {
  ArchetypeId,
  CausalEdge,
  CausalNode,
  EvidenceRenderer,
  InvestigativeGroup,
  TemplateId,
} from '../types';

/** Flight phase labels matching the phase-scripted sim (B2.5). */
export type FlightPhase =
  | 'preflight'
  | 'taxi'
  | 'takeoff'
  | 'climb'
  | 'cruise'
  | 'descent'
  | 'approach'
  | 'landing'
  | 'goAround';

/** Named knob world-gen may override when instantiating a template. */
export interface TemplateParameter {
  key: string;
  description: string;
  defaultValue: string | number | boolean;
}

/**
 * Event injected into the flight script at a phase.
 * World-gen / sim expand these into kinematic samples later.
 */
export interface FlightScriptHook {
  phase: FlightPhase;
  /** Stable event id, e.g. `event.enter_imc`. */
  eventId: string;
  /** What happens (sim brief; not player-facing prose). */
  description: string;
  /** Optional seconds into the phase when the event fires. */
  atSeconds?: number;
}

/**
 * Stub catalogue entry the template guarantees will exist.
 * Evidence derivation later materialises full EvidenceItem records.
 */
export interface EvidenceHook {
  evidenceId: string;
  group: InvestigativeGroup;
  title: string;
  /**
   * True when the item does not require FDR/CVR recovery.
   * A1-capable templates need ≥1 such reveal per causal node.
   */
  withoutRecorders: boolean;
  renderer: EvidenceRenderer;
  /** Investigator-day cost stub for par estimation. */
  costStub: number;
  /** Calendar-day lead-time stub. */
  leadTimeStub: number;
}

/** Candidate non-causal condition drawn into the truth graph. */
export interface RedHerringSlot {
  id: string;
  text: string;
  /** Pool tag for themed selection. */
  poolTag: string;
}

/** Par budget stub (minimum sufficient evidence set). */
export interface ParCostStub {
  investigatorDays: number;
  calendarDays: number;
  /** Evidence hook ids forming the minimum sufficient set. */
  evidenceSet: string[];
}

/**
 * Parameterised failure-mode template.
 * One file per template id; registry selects by archetype fit.
 */
export interface FailureModeTemplate {
  id: TemplateId;
  name: string;
  summary: string;
  /** Archetypes this template may attach to. */
  archetypes: readonly ArchetypeId[];
  /** Default parameter knobs (world-gen may override). */
  parameters: readonly TemplateParameter[];
  /** Base causal nodes (includes nonCausal placeholders when fixed). */
  nodes: CausalNode[];
  /** Directed "led to" edges forming a DAG. */
  edges: CausalEdge[];
  flightScriptHooks: FlightScriptHook[];
  evidenceHooks: EvidenceHook[];
  /** Pool from which 1–3 nonCausal nodes are drawn. */
  redHerringPool: RedHerringSlot[];
  redHerringDraw: { min: number; max: number };
  /**
   * Explicit probable-cause node ids.
   * Default convention: initiating event + propagation mechanism.
   */
  probableCauseNodeIds: readonly string[];
  parCostStub: ParCostStub;
}
