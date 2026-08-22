/** Scoring: C/P/S/R/E formula from DESIGN B2.9. */

import type {
  CaseBundle,
  CaseState,
  Grade,
  NodeTier,
  PlayerFinding,
  PlayerRecommendation,
  ScoreReport,
} from '../types';
import { NODE_TIER_WEIGHT } from '../types';

export interface FindingsInput {
  findings: PlayerFinding[];
  findingEdges?: { from: string; to: string }[];
  recommendations: PlayerRecommendation[];
}

function causalNodes(bundle: CaseBundle) {
  return bundle.truth.nodes.filter((n) => n.tier !== 'nonCausal');
}

function nonCausalIds(bundle: CaseBundle): Set<string> {
  return new Set(
    bundle.truth.nodes.filter((n) => n.tier === 'nonCausal').map((n) => n.id),
  );
}

function evidenceRevealsNode(
  bundle: CaseBundle,
  evidenceIds: string[],
  nodeId: string,
): boolean {
  const wanted = new Set(evidenceIds);
  for (const item of bundle.evidence) {
    if (!wanted.has(item.id)) continue;
    if (item.reveals.some((r) => r.nodeId === nodeId && r.strength > 0)) {
      return true;
    }
  }
  // Also accept truth.revealedBy linkage if evidence obtained
  const node = bundle.truth.nodes.find((n) => n.id === nodeId);
  if (!node) return false;
  return node.revealedBy.some((l) => wanted.has(l.evidenceId));
}

function coverage(findings: PlayerFinding[], bundle: CaseBundle): number {
  const causal = causalNodes(bundle);
  const denom = causal.reduce((s, n) => s + NODE_TIER_WEIGHT[n.tier], 0);
  if (denom <= 0) return 0;
  let numer = 0;
  for (const node of causal) {
    const hit = findings.find(
      (f) =>
        f.claimedNodeId === node.id &&
        f.tier === node.tier &&
        evidenceRevealsNode(bundle, f.citedEvidenceIds, node.id),
    );
    if (hit) numer += NODE_TIER_WEIGHT[node.tier];
  }
  return numer / denom;
}

function precisionPenalty(findings: PlayerFinding[], bundle: CaseBundle): number {
  const nonCausal = nonCausalIds(bundle);
  let p = 0;
  for (const f of findings) {
    const claimedNon =
      (f.claimedNodeId && nonCausal.has(f.claimedNodeId)) ||
      f.tier === 'nonCausal';
    if (claimedNon && f.tier === 'probableCause') p += 15;
    else if (claimedNon && f.tier === 'contributing') p += 6;
    if (f.citedEvidenceIds.length === 0) p += 2;
    else if (
      f.claimedNodeId &&
      !evidenceRevealsNode(bundle, f.citedEvidenceIds, f.claimedNodeId)
    ) {
      p += 2;
    }
  }
  return p;
}

function statementScore(findings: PlayerFinding[], bundle: CaseBundle): number {
  const truthPc = new Set(
    bundle.truth.nodes
      .filter((n) => n.tier === 'probableCause')
      .map((n) => n.id),
  );
  const truthContrib = new Set(
    bundle.truth.nodes
      .filter((n) => n.tier === 'contributing')
      .map((n) => n.id),
  );
  const playerPc = new Set(
    findings
      .filter((f) => f.tier === 'probableCause' && f.claimedNodeId)
      .map((f) => f.claimedNodeId!),
  );
  const playerContrib = new Set(
    findings
      .filter((f) => f.tier === 'contributing' && f.claimedNodeId)
      .map((f) => f.claimedNodeId!),
  );

  let s = 0;
  const pcOk =
    truthPc.size === playerPc.size &&
    [...truthPc].every((id) => playerPc.has(id));
  if (pcOk) s += 12;

  const inter = [...truthContrib].filter((id) => playerContrib.has(id)).length;
  const union = new Set([...truthContrib, ...playerContrib]).size;
  const jaccard = union === 0 ? 1 : inter / union;
  s += jaccard * 8;
  return s;
}

function recommendationsScore(
  recs: PlayerRecommendation[],
  bundle: CaseBundle,
): number {
  const latent = new Set(
    bundle.truth.nodes
      .filter(
        (n) =>
          n.kind === 'latentCondition' ||
          n.kind === 'precondition' ||
          n.tier === 'precondition',
      )
      .map((n) => n.id),
  );
  let r = 0;
  let supported = 0;
  for (const rec of recs) {
    const ok = rec.targetNodeId && latent.has(rec.targetNodeId);
    if (ok) {
      if (supported < 3) {
        r += 5;
        supported += 1;
      }
      if (rec.urgent) r += 5;
    } else {
      r -= 3;
      if (rec.urgent) r -= 10;
    }
  }
  return Math.max(-20, Math.min(20, r));
}

function efficiencyScore(state: CaseState, bundle: CaseBundle): number {
  const parDays = bundle.par.investigatorDays;
  const parCal = bundle.par.calendarDays;
  if (parDays <= 0) return 5;
  const budgetRatio = state.investigatorDaysSpent / (parDays * 1.5);
  const calRatio = state.calendarDay / Math.max(1, parCal);
  let e = 10;
  if (budgetRatio > 1) e -= Math.min(5, (budgetRatio - 1) * 8);
  if (calRatio > 1) e -= Math.min(5, (calRatio - 1) * 6);
  if (budgetRatio < 0.5 && state.submitted) e -= 1;
  return Math.max(0, Math.min(10, e));
}

function gradeFor(total: number): Grade {
  if (total >= 90) return 'S';
  if (total >= 80) return 'A';
  if (total >= 65) return 'B';
  if (total >= 50) return 'C';
  return 'D';
}

/**
 * Score a submitted findings set against truth.
 * Total = 50·C + S + R + E − P, clamped to [0, 100].
 */
export function scoreCase(
  findings: FindingsInput,
  bundle: CaseBundle,
  state: CaseState,
): ScoreReport {
  const C = coverage(findings.findings, bundle);
  const P = precisionPenalty(findings.findings, bundle);
  const S = statementScore(findings.findings, bundle);
  const R = recommendationsScore(findings.recommendations, bundle);
  const E = efficiencyScore(state, bundle);
  const raw = 50 * C + S + R + E - P;
  const total = Math.max(0, Math.min(100, raw));
  return {
    total,
    grade: gradeFor(total),
    coverage: C,
    precisionPenalty: P,
    statement: S,
    recommendations: R,
    efficiency: E,
  };
}

/** Build oracle findings that cite revealing evidence for every causal node. */
export function truthFindings(bundle: CaseBundle): FindingsInput {
  const findings: PlayerFinding[] = [];
  for (const node of causalNodes(bundle)) {
    const cited = bundle.evidence
      .filter((e) => e.reveals.some((r) => r.nodeId === node.id))
      .map((e) => e.id);
    // Fall back to revealedBy ids present in catalogue
    const fromNode = node.revealedBy
      .map((l) => l.evidenceId)
      .filter((id) => bundle.evidence.some((e) => e.id === id));
    const ids = cited.length > 0 ? cited : fromNode;
    findings.push({
      id: `f.${node.id}`,
      text: node.text,
      tier: node.tier as NodeTier,
      citedEvidenceIds: ids.slice(0, 3),
      claimedNodeId: node.id,
    });
  }
  const recs: PlayerRecommendation[] = bundle.truth.nodes
    .filter((n) => n.kind === 'latentCondition' || n.kind === 'precondition')
    .slice(0, 3)
    .map((n, i) => ({
      id: `rec.${i}`,
      recipient: 'faa' as const,
      text: `Address ${n.id}`,
      targetNodeId: n.id,
      urgent: false,
    }));
  return { findings, recommendations: recs };
}

export function emptyFindings(): FindingsInput {
  return { findings: [], recommendations: [] };
}
