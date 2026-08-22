/** Barrel for engine types (TECH.md `src/engine/types`). */

export type {
  ArchetypeId,
  TemplateId,
  Difficulty,
  InvestigativeGroup,
  EvidenceRenderer,
  OpsPart,
  CrewRole,
  TimeOfDay,
  Grade,
} from './ids';

export type {
  NodeTier,
  CausalNodeKind,
  EvidenceRevealLink,
  CausalNode,
  CausalEdge,
  CaseTruth,
} from './causal';
export { NODE_TIER_WEIGHT } from './causal';

export type {
  OperatorProfile,
  CrewMember,
  MelItem,
  MaintenanceHistory,
  Environment,
  World,
} from './world';

export type { EvidenceNodeReveal, EvidenceItem, EvidenceCatalogue } from './evidence';

export type {
  PlayerFinding,
  PlayerRecommendation,
  Action,
  QueuedWork,
  CaseState,
  Par,
  ScoreReport,
  CaseBundle,
} from './action';
