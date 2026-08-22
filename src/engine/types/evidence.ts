/** Evidence catalogue item shape (B2.6): costs, lead time, prereqs, decay. */

import type { EvidenceRenderer, InvestigativeGroup } from './ids';

/** Node reveal emitted when this evidence is obtained. */
export interface EvidenceNodeReveal {
  nodeId: string;
  /** Reveal strength in [0, 1]. */
  strength: number;
}

/**
 * One obtainable evidence item in the case catalogue.
 * Actions "Request…" this item; results arrive after leadTime.
 */
export interface EvidenceItem {
  id: string;
  /** Investigative group that produces / owns this item. */
  group: InvestigativeGroup;
  title: string;
  /** Investigator-days spent when requested. */
  cost: number;
  /** Calendar days until the result is available. */
  leadTime: number;
  /**
   * Prerequisites: other evidence ids, recovered component tags
   * (e.g. `recovered.recorder`), or group-active tokens.
   */
  prereqs: string[];
  /** Minimum party cooperation (0–100) required, if any. */
  partyCooperationMin?: number;
  /** Party id whose cooperation gate applies. */
  partyId?: string;
  /** Causal nodes this item can reveal. */
  reveals: EvidenceNodeReveal[];
  /**
   * Calendar day after which the item is lost unless secured.
   * Undefined = no decay.
   */
  decay?: number;
  renderer: EvidenceRenderer;
}

/** Full catalogue for a generated case. */
export type EvidenceCatalogue = EvidenceItem[];
