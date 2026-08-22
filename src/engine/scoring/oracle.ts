/** Scoring oracles: truth ≥ 95, empty ≤ 10, red-herring PC drop ≥ 12. */

import type { CaseBundle, CaseState } from '../types';
import {
  emptyFindings,
  scoreCase,
  truthFindings,
  type FindingsInput,
} from './score';

export interface OracleResult {
  truthScore: number;
  emptyScore: number;
  herringDrop: number;
  pass: boolean;
}

export function runOracles(
  bundle: CaseBundle,
  state: CaseState,
): OracleResult {
  const truth = scoreCase(truthFindings(bundle), bundle, state);
  const empty = scoreCase(emptyFindings(), bundle, state);

  const withHerring: FindingsInput = truthFindings(bundle);
  const herring = bundle.truth.nodes.find((n) => n.tier === 'nonCausal');
  if (herring) {
    withHerring.findings = [
      ...withHerring.findings,
      {
        id: 'f.herring_as_pc',
        text: herring.text,
        tier: 'probableCause',
        citedEvidenceIds: [],
        claimedNodeId: herring.id,
      },
    ];
  }
  const herringScore = scoreCase(withHerring, bundle, state);
  const herringDrop = truth.total - herringScore.total;

  const pass =
    truth.total >= 95 &&
    empty.total <= 10 &&
    (herring ? herringDrop >= 12 : true);

  return {
    truthScore: truth.total,
    emptyScore: empty.total,
    herringDrop,
    pass,
  };
}
