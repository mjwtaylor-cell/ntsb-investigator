/** Truth-graph generation: template selection + CaseTruth DAG from template. */

import { createRng, type Rng } from '../rng';
import {
  getTemplate,
  templatesForArchetype,
  type FailureModeTemplate,
} from '../templates';
import type { Archetype } from '../archetypes';
import type {
  CaseTruth,
  CausalNode,
  Difficulty,
  TemplateId,
} from '../types';
import type { GenerateOpts } from './world';

/** Curated seed → template (DESIGN B2.13: seed 1174 is A2 / T4). */
const CURATED_TEMPLATE: Readonly<Record<string, TemplateId>> = {
  '1174': 'T4',
};

function pickTemplate(
  seed: string,
  archetypeId: Archetype['id'],
  rng: Rng,
  opts: GenerateOpts,
): FailureModeTemplate {
  if (opts.template) {
    const t = getTemplate(opts.template);
    if (!t.archetypes.includes(archetypeId)) {
      throw new Error(
        `Template ${opts.template} not valid for archetype ${archetypeId}`,
      );
    }
    return t;
  }
  const curated = CURATED_TEMPLATE[seed];
  if (curated) {
    const t = getTemplate(curated);
    if (t.archetypes.includes(archetypeId)) return t;
  }
  const candidates = templatesForArchetype(archetypeId);
  if (candidates.length === 0) {
    throw new Error(`No templates for archetype ${archetypeId}`);
  }
  return rng.pick(candidates);
}

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
 * Keeps solvability (≥2 reveals) by relying on template withoutRecorders coverage.
 */
function filterRevealsForArchetype(
  nodes: CausalNode[],
  archetype: Archetype,
  template: FailureModeTemplate,
): CausalNode[] {
  const hookById = new Map(
    template.evidenceHooks.map((h) => [h.evidenceId, h]),
  );
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
      const hook = hookById.get(id);
      if (!hook) return true; // catalogue may still add generic items
      return true;
    });
    return { ...node, revealedBy };
  });
}

/**
 * Build CaseTruth from selected template + red-herring draw.
 * Uses rng.fork('template') for selection and herring draws.
 */
export function generateTruth(
  seed: string,
  archetype: Archetype,
  difficulty: Difficulty,
  opts: GenerateOpts = {},
): { truth: CaseTruth; template: FailureModeTemplate } {
  const templateRng = createRng(seed).fork('template');
  const template = pickTemplate(seed, archetype.id, templateRng, opts);

  const baseNodes = filterRevealsForArchetype(
    template.nodes.map((n) => ({
      ...n,
      revealedBy: n.revealedBy.map((r) => ({ ...r })),
      conflictsWith: n.conflictsWith ? [...n.conflictsWith] : undefined,
    })),
    archetype,
    template,
  );

  const herrings = drawRedHerrings(template, difficulty, templateRng);
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

export { pickTemplate };
