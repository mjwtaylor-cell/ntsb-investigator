/** Registry of failure-mode templates (P1: T1, T2, T4, T6). */

import type { ArchetypeId, TemplateId } from '../types';
import type { FailureModeTemplate } from './schema';
import { T1_VFR_IMC } from './t1-vfr-imc';
import { T2_FUEL } from './t2-fuel';
import { assertValidTemplate } from './validate';

const ALL: FailureModeTemplate[] = [T1_VFR_IMC, T2_FUEL];

for (const t of ALL) {
  assertValidTemplate(t);
}

export const TEMPLATES: Readonly<Partial<Record<TemplateId, FailureModeTemplate>>> =
  Object.fromEntries(ALL.map((t) => [t.id, t]));

export const TEMPLATE_IDS: readonly TemplateId[] = ALL.map((t) => t.id);

export function getTemplate(id: TemplateId): FailureModeTemplate {
  const t = TEMPLATES[id];
  if (!t) {
    throw new Error(`Unknown or unimplemented template: ${id}`);
  }
  return t;
}

export function listTemplates(): FailureModeTemplate[] {
  return TEMPLATE_IDS.map((id) => TEMPLATES[id]!);
}

/** Templates whose archetype list includes `archetypeId`. */
export function templatesForArchetype(
  archetypeId: ArchetypeId,
): FailureModeTemplate[] {
  return listTemplates().filter((t) => t.archetypes.includes(archetypeId));
}
