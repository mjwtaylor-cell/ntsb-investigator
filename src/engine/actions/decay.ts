/** Evidence decay: perishable items lost unless secured. */

import type { CaseBundle, CaseState, EvidenceItem } from '../types';

export function catalogueById(bundle: CaseBundle): Map<string, EvidenceItem> {
  return new Map(bundle.evidence.map((e) => [e.id, e]));
}

/** Mark unsecured evidence whose decay day has passed. */
export function applyDecay(state: CaseState, bundle: CaseBundle): CaseState {
  const byId = catalogueById(bundle);
  const decayed = new Set(state.decayedEvidenceIds);
  const secured = new Set(state.securedEvidenceIds);
  for (const item of bundle.evidence) {
    if (item.decay === undefined) continue;
    if (secured.has(item.id)) continue;
    if (state.obtainedEvidenceIds.includes(item.id)) continue;
    if (state.calendarDay >= item.decay) {
      decayed.add(item.id);
    }
  }
  // Also drop queued work targeting decayed items
  const queue = state.queue.filter((q) => {
    if (q.source.type !== 'requestEvidence') return true;
    return !decayed.has(q.source.evidenceId);
  });
  void byId;
  return {
    ...state,
    decayedEvidenceIds: Array.from(decayed).sort(),
    queue,
  };
}

export function isEvidenceAvailable(
  state: CaseState,
  evidenceId: string,
): boolean {
  return !state.decayedEvidenceIds.includes(evidenceId);
}
