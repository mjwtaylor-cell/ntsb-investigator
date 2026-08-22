/**
 * Evidence catalogue assembly: costs, lead times, prereqs, decay, reveals.
 * Aligns with DOMAIN.md groups and DESIGN B2.6.
 */

import type { Archetype } from '../archetypes';
import type { FailureModeTemplate } from '../templates';
import type {
  CaseTruth,
  EvidenceCatalogue,
  EvidenceItem,
  EvidenceNodeReveal,
  Par,
} from '../types';
import type { FlightTrack } from '../sim';
import { buildRecorderItems } from './recorders';
import { buildRadarItems } from './radar';
import { buildWeatherItems } from './weather';
import { buildWreckageItems } from './wreckage';
import { buildRecordsItems } from './records';
import { buildWitnessItems } from './witnesses';
import { buildPartyItems } from './parties';

function decayFor(id: string): number | undefined {
  if (id.startsWith('wx.')) return 30;
  if (id.includes('security') || id.includes('doorbell') || id.includes('video'))
    return 7;
  if (id.startsWith('witness.')) return 14;
  return undefined;
}

function prereqsFor(id: string, archetype: Archetype): string[] {
  const pre: string[] = [];
  if (id === 'fdr.readout' || id === 'cvr.transcript') {
    pre.push('recorders.recovery');
  }
  if (id.startsWith('nvm.')) {
    pre.push('nvm.device_recovery');
  }
  if (id.startsWith('lab.') || id.includes('teardown') || id.includes('fractography')) {
    pre.push('structures.wreckage_map');
  }
  if (id === 'fdr.readout' && archetype.recorders.fdr === 'none') {
    return ['__impossible__'];
  }
  if (id === 'cvr.transcript' && !archetype.recorders.cvr) {
    return ['__impossible__'];
  }
  return pre;
}

/** Materialise template hooks into EvidenceItem records. */
export function materialiseHooks(
  template: FailureModeTemplate,
  truth: CaseTruth,
  archetype: Archetype,
): EvidenceItem[] {
  const revealIndex = new Map<string, EvidenceNodeReveal[]>();
  for (const node of truth.nodes) {
    for (const link of node.revealedBy) {
      const list = revealIndex.get(link.evidenceId) ?? [];
      list.push({ nodeId: node.id, strength: link.strength });
      revealIndex.set(link.evidenceId, list);
    }
  }

  const items: EvidenceItem[] = [];
  for (const hook of template.evidenceHooks) {
    if (hook.evidenceId === 'fdr.readout' && archetype.recorders.fdr === 'none') {
      continue;
    }
    if (hook.evidenceId === 'cvr.transcript' && !archetype.recorders.cvr) {
      continue;
    }
    if (
      hook.evidenceId === 'nvm.engine_monitor' &&
      !archetype.recorders.engineMonitorNvm
    ) {
      continue;
    }
    if (
      hook.evidenceId === 'nvm.portable_gps' &&
      !archetype.recorders.portableGps
    ) {
      continue;
    }

    const prereqs = prereqsFor(hook.evidenceId, archetype);
    if (prereqs.includes('__impossible__')) continue;

    items.push({
      id: hook.evidenceId,
      group: hook.group,
      title: hook.title,
      cost: hook.costStub,
      leadTime: hook.leadTimeStub,
      prereqs,
      reveals: revealIndex.get(hook.evidenceId) ?? [],
      decay: decayFor(hook.evidenceId),
      renderer: hook.renderer,
    });
  }
  return items;
}

function recoveryStubs(archetype: Archetype): EvidenceItem[] {
  const items: EvidenceItem[] = [
    {
      id: 'recorders.recovery',
      group: 'recorders',
      title: 'Recorder / NVM recovery from wreckage',
      cost: 2,
      leadTime: 2,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'nvm.device_recovery',
      group: 'systems',
      title: 'Portable NVM / avionics device recovery',
      cost: 1,
      leadTime: 2,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'ops.records_general',
      group: 'operations',
      title: 'General operator / crew records package',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'parties.operator_submission',
      group: 'parties',
      title: 'Operator party submission',
      cost: 1,
      leadTime: 30,
      prereqs: [],
      partyCooperationMin: 40,
      partyId: 'operator',
      reveals: [],
      renderer: 'document',
    },
  ];
  if (archetype.recorders.fdr === 'none' && !archetype.recorders.cvr) {
    // still useful as NVM path
  }
  return items;
}

export function buildPar(
  template: FailureModeTemplate,
  catalogue: EvidenceCatalogue,
  difficulty: 'standard' | 'senior',
): Par {
  const set = template.parCostStub.evidenceSet.filter((id) =>
    catalogue.some((e) => e.id === id),
  );
  // Fall back to cheapest without-recorder items if filtered empty
  const evidenceSet =
    set.length > 0
      ? set
      : catalogue
          .filter((e) => e.prereqs.length === 0)
          .sort((a, b) => a.cost - b.cost)
          .slice(0, 5)
          .map((e) => e.id);

  const stubDays = template.parCostStub.investigatorDays;
  const stubCal = template.parCostStub.calendarDays;
  const mult = difficulty === 'senior' ? 1.1 : 1.6;
  return {
    investigatorDays: Math.ceil(stubDays * mult),
    calendarDays: stubCal,
    evidenceSet,
  };
}

export interface EvidenceBuildResult {
  catalogue: EvidenceCatalogue;
  par: Par;
  /** Short derived blurbs for CLI / later viewers. */
  derivedNotes: Record<string, string>;
}

/** Full evidence build for a generated case. */
export function buildEvidence(
  template: FailureModeTemplate,
  truth: CaseTruth,
  archetype: Archetype,
  track: FlightTrack,
): EvidenceBuildResult {
  const fromHooks = materialiseHooks(template, truth, archetype);
  const extras = [
    ...recoveryStubs(archetype),
    ...buildRecorderItems(archetype, track),
    ...buildRadarItems(archetype, track),
    ...buildWeatherItems(truth, track),
    ...buildWreckageItems(track),
    ...buildRecordsItems(truth),
    ...buildWitnessItems(truth, track),
    ...buildPartyItems(),
  ];

  const byId = new Map<string, EvidenceItem>();
  for (const item of [...extras, ...fromHooks]) {
    const prev = byId.get(item.id);
    if (!prev) {
      byId.set(item.id, item);
    } else {
      // Merge reveals; prefer hook cost/title
      byId.set(item.id, {
        ...prev,
        ...item,
        reveals: mergeReveals(prev.reveals, item.reveals),
        prereqs: Array.from(new Set([...prev.prereqs, ...item.prereqs])),
      });
    }
  }

  // Attach truth reveals onto any catalogue id referenced by nodes
  for (const node of truth.nodes) {
    for (const link of node.revealedBy) {
      const item = byId.get(link.evidenceId);
      if (!item) continue;
      item.reveals = mergeReveals(item.reveals, [
        { nodeId: node.id, strength: link.strength },
      ]);
    }
  }

  const catalogue = Array.from(byId.values()).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  const par = buildPar(template, catalogue, truth.difficulty);

  const derivedNotes: Record<string, string> = {
    'flight.summary': `samples=${track.samples.length}; events=${track.events.map((e) => e.eventId).join(',')}`,
    'impact.sample': `t=${track.impactIndex}`,
  };

  return { catalogue, par, derivedNotes };
}

function mergeReveals(
  a: EvidenceNodeReveal[],
  b: EvidenceNodeReveal[],
): EvidenceNodeReveal[] {
  const map = new Map<string, number>();
  for (const r of [...a, ...b]) {
    map.set(r.nodeId, Math.max(map.get(r.nodeId) ?? 0, r.strength));
  }
  return Array.from(map.entries()).map(([nodeId, strength]) => ({
    nodeId,
    strength,
  }));
}
