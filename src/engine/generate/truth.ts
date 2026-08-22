/** Truth-graph generation: template selection + CaseTruth DAG from template. */

import { createRng, type Rng } from '../rng';
import type { FailureModeTemplate } from '../templates';
import type { Archetype } from '../archetypes';
import type { CaseTruth, CausalNode, Difficulty } from '../types';
import type { GenerateOpts } from './world';
import { resolveSelection } from './resolve';

function drawRedHerrings(
  template: FailureModeTemplate,
  difficulty: Difficulty,
  rng: Rng,
): CausalNode[] {
  const pool = template.redHerringPool;
  if (pool.length === 0) return [];
  let n = rng.nextInt(template.redHerringDraw.min, template.redHerringDraw.max);
  if (difficulty === 'senior') n = Math.min(pool.length, n + 1);
  const picked = rng.shuffle(pool).slice(0, n);
  return picked.map((slot) => ({
    id: slot.id,
    kind: 'nonCausalCondition' as const,
    tier: 'nonCausal' as const,
    text: slot.text,
    revealedBy: [
      { evidenceId: 'ops.records_general', strength: 0.4 },
      { evidenceId: 'parties.operator_submission', strength: 0.35 },
    ],
  }));
}

/**
 * Filter node reveal links to evidence the archetype can actually produce.
 */
function filterRevealsForArchetype(
  nodes: CausalNode[],
  archetype: Archetype,
  _template: FailureModeTemplate,
): CausalNode[] {
  const hasFdr = archetype.recorders.fdr !== 'none';
  const hasCvr = archetype.recorders.cvr;
  const hasEngineNvm = archetype.recorders.engineMonitorNvm;
  const hasGps = archetype.recorders.portableGps;

  return nodes.map((node) => {
    const revealedBy = node.revealedBy.filter((link) => {
      const id = link.evidenceId;
      if (id === 'fdr.readout' && !hasFdr) return false;
      if (id === 'cvr.transcript' && !hasCvr) return false;
      if (id === 'nvm.engine_monitor' && !hasEngineNvm) return false;
      if (id === 'nvm.portable_gps' && !hasGps) return false;
      return true;
    });
    return { ...node, revealedBy };
  });
}

/**
 * Build CaseTruth from selected template + red-herring draw.
 */
export function generateTruth(
  seed: string,
  archetype: Archetype,
  difficulty: Difficulty,
  opts: GenerateOpts = {},
): { truth: CaseTruth; template: FailureModeTemplate } {
  const resolved = resolveSelection(seed, {
    ...opts,
    archetype: opts.archetype ?? archetype.id,
    difficulty,
  });
  const template = resolved.template;

  const baseNodes = filterRevealsForArchetype(
    template.nodes.map((n) => ({
      ...n,
      revealedBy: n.revealedBy.map((r) => ({ ...r })),
      conflictsWith: n.conflictsWith ? [...n.conflictsWith] : undefined,
    })),
    archetype,
    template,
  );

  const herrings = drawRedHerrings(
    template,
    difficulty,
    createRng(seed).fork('template'),
  );
  const nodes = [...baseNodes, ...herrings];

  const truth: CaseTruth = {
    seed,
    archetypeId: archetype.id,
    templateId: template.id,
    difficulty,
    nodes,
    edges: template.edges.map((e) => ({ ...e })),
  };

  return { truth, template };
}

export { resolveSelection, CaseSelectionError } from './resolve';
