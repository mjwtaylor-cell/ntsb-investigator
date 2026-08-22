/** Registry of fictional archetypes A1–A4 (B2.4). */

import type { ArchetypeId } from '../types';
import type { Archetype } from './schema';
import { A1_MERIDIAN } from './a1-meridian';
import { A2_KESTREL } from './a2-kestrel';
import { A3_AURORA } from './a3-aurora';
import { A4_HALCYON } from './a4-halcyon';

export const ARCHETYPES: Readonly<Record<ArchetypeId, Archetype>> = {
  A1: A1_MERIDIAN,
  A2: A2_KESTREL,
  A3: A3_AURORA,
  A4: A4_HALCYON,
};

export const ARCHETYPE_IDS: readonly ArchetypeId[] = ['A1', 'A2', 'A3', 'A4'];

export function getArchetype(id: ArchetypeId): Archetype {
  const arch = ARCHETYPES[id];
  if (!arch) {
    throw new Error(`Unknown archetype: ${id}`);
  }
  return arch;
}

export function listArchetypes(): Archetype[] {
  return ARCHETYPE_IDS.map((id) => ARCHETYPES[id]);
}
