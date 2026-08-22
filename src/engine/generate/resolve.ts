/** Coordinated archetype + template selection (uniform, curated, CLI opts). */

import { createRng, type Rng } from '../rng';
import { getArchetype, listArchetypes } from '../archetypes';
import type { Archetype } from '../archetypes';
import {
  getTemplate,
  templatesForArchetype,
  type FailureModeTemplate,
} from '../templates';
import type { ArchetypeId, Difficulty, TemplateId } from '../types';
import type { GenerateOpts } from './world';

/** Curated seed → A2 / T4 (DESIGN B2.13 walkthrough). */
const CURATED: Readonly<Record<string, { archetype: ArchetypeId; template: TemplateId }>> = {
  '1174': { archetype: 'A2', template: 'T4' },
};

export class CaseSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CaseSelectionError';
  }
}

export interface ResolvedSelection {
  archetype: Archetype;
  template: FailureModeTemplate;
  difficulty: Difficulty;
}

function pickUniform<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) {
    throw new CaseSelectionError('No candidates to pick from');
  }
  return rng.pick(items as T[]);
}

/**
 * Resolve archetype + template for a seed.
 * - Every archetype is reachable; template drawn uniformly from that
 *   archetype's applicable list.
 * - Forced `--template` auto-picks a compatible archetype when none given.
 * - Incompatible forced pair → CaseSelectionError (friendly, no stack at CLI).
 */
export function resolveSelection(
  seed: string,
  opts: GenerateOpts = {},
): ResolvedSelection {
  const difficulty: Difficulty = opts.difficulty ?? 'standard';
  const worldRng = createRng(seed).fork('world');
  const templateRng = createRng(seed).fork('template');

  if (opts.template && opts.archetype) {
    const template = getTemplate(opts.template);
    if (!template.archetypes.includes(opts.archetype)) {
      throw new CaseSelectionError(
        `Template ${opts.template} is not valid for archetype ${opts.archetype}. ` +
          `Compatible archetypes: ${template.archetypes.join(', ') || '(none)'}.`,
      );
    }
    return {
      archetype: getArchetype(opts.archetype),
      template,
      difficulty,
    };
  }

  if (opts.template) {
    const template = getTemplate(opts.template);
    const curated = CURATED[seed];
    let archetypeId: ArchetypeId;
    if (curated && template.archetypes.includes(curated.archetype)) {
      archetypeId = curated.archetype;
    } else {
      archetypeId = pickUniform(worldRng, template.archetypes);
    }
    return {
      archetype: getArchetype(archetypeId),
      template,
      difficulty,
    };
  }

  if (opts.archetype) {
    const archetype = getArchetype(opts.archetype);
    const candidates = templatesForArchetype(opts.archetype);
    if (candidates.length === 0) {
      throw new CaseSelectionError(
        `No templates available for archetype ${opts.archetype}.`,
      );
    }
    const curated = CURATED[seed];
    let template: FailureModeTemplate;
    if (
      curated &&
      curated.archetype === opts.archetype &&
      candidates.some((t) => t.id === curated.template)
    ) {
      template = getTemplate(curated.template);
    } else {
      template = pickUniform(templateRng, candidates);
    }
    return { archetype, template, difficulty };
  }

  // Unforced: curated seed or uniform archetype then uniform applicable template.
  const curated = CURATED[seed];
  if (curated) {
    return {
      archetype: getArchetype(curated.archetype),
      template: getTemplate(curated.template),
      difficulty,
    };
  }

  const archetype = pickUniform(worldRng, listArchetypes());
  const candidates = templatesForArchetype(archetype.id);
  if (candidates.length === 0) {
    throw new CaseSelectionError(
      `No templates available for archetype ${archetype.id}.`,
    );
  }
  const template = pickUniform(templateRng, candidates);
  return { archetype, template, difficulty };
}
