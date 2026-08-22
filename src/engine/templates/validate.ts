/** Structural validators for failure-mode templates (B2.4 guarantees). */

import type { CausalNode } from '../types';
import type { EvidenceHook, FailureModeTemplate } from './schema';

export interface TemplateValidationIssue {
  code: string;
  message: string;
}

function isCausal(node: CausalNode): boolean {
  return node.tier !== 'nonCausal' && node.kind !== 'nonCausalCondition';
}

function evidenceById(
  hooks: EvidenceHook[],
): Map<string, EvidenceHook> {
  return new Map(hooks.map((h) => [h.evidenceId, h]));
}

/** Kahn topological check — returns false if a cycle exists. */
function isDag(nodes: CausalNode[], edges: { from: string; to: string }[]): boolean {
  const ids = new Set(nodes.map((n) => n.id));
  const indeg = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of ids) {
    indeg.set(id, 0);
    adj.set(id, []);
  }
  for (const e of edges) {
    if (!ids.has(e.from) || !ids.has(e.to)) return false;
    adj.get(e.from)!.push(e.to);
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1);
  }
  const queue = [...ids].filter((id) => (indeg.get(id) ?? 0) === 0);
  let seen = 0;
  while (queue.length > 0) {
    const id = queue.shift()!;
    seen += 1;
    for (const next of adj.get(id) ?? []) {
      const d = (indeg.get(next) ?? 0) - 1;
      indeg.set(next, d);
      if (d === 0) queue.push(next);
    }
  }
  return seen === ids.size;
}

/**
 * Validate B2.4 template guarantees.
 * Returns an empty array when the template is structurally sound.
 */
export function validateTemplate(
  template: FailureModeTemplate,
): TemplateValidationIssue[] {
  const issues: TemplateValidationIssue[] = [];
  const nodeIds = new Set(template.nodes.map((n) => n.id));
  const hooks = evidenceById(template.evidenceHooks);
  const supportsA1 = template.archetypes.includes('A1');

  if (template.nodes.length === 0) {
    issues.push({ code: 'nodes.empty', message: 'Template has no causal nodes' });
  }

  const duplicateIds = template.nodes
    .map((n) => n.id)
    .filter((id, i, arr) => arr.indexOf(id) !== i);
  for (const id of new Set(duplicateIds)) {
    issues.push({ code: 'nodes.duplicate', message: `Duplicate node id: ${id}` });
  }

  const probable = template.nodes.filter((n) => n.tier === 'probableCause');
  if (probable.length < 1) {
    issues.push({
      code: 'tier.probableCause',
      message: 'Need ≥1 probableCause node',
    });
  }

  if (!template.probableCauseNodeIds || template.probableCauseNodeIds.length < 1) {
    issues.push({
      code: 'pc.empty',
      message: 'probableCauseNodeIds must list ≥1 node',
    });
  } else {
    for (const id of template.probableCauseNodeIds) {
      if (!nodeIds.has(id)) {
        issues.push({
          code: 'pc.unknownNode',
          message: `probableCauseNodeIds references unknown ${id}`,
        });
      } else {
        const node = template.nodes.find((n) => n.id === id)!;
        if (node.tier !== 'probableCause') {
          issues.push({
            code: 'pc.tierMismatch',
            message: `PC node ${id} must have tier probableCause (has ${node.tier})`,
          });
        }
        if (node.kind === 'outcome') {
          issues.push({
            code: 'pc.outcome',
            message: `Outcome node ${id} cannot be in the PC set`,
          });
        }
      }
    }
  }


  const { min, max } = template.redHerringDraw;
  if (min < 1 || max > 3 || min > max) {
    issues.push({
      code: 'redHerring.draw',
      message: 'redHerringDraw must satisfy 1 ≤ min ≤ max ≤ 3',
    });
  }
  if (template.redHerringPool.length < max) {
    issues.push({
      code: 'redHerring.pool',
      message: `redHerringPool length ${template.redHerringPool.length} < draw max ${max}`,
    });
  }

  for (const node of template.nodes) {
    if (!isCausal(node)) continue;
    if (node.revealedBy.length < 2) {
      issues.push({
        code: 'reveal.count',
        message: `Causal node ${node.id} needs ≥2 revealedBy links (has ${node.revealedBy.length})`,
      });
    }
    let hasWithout = false;
    for (const link of node.revealedBy) {
      const hook = hooks.get(link.evidenceId);
      if (!hook) {
        issues.push({
          code: 'reveal.unknownEvidence',
          message: `Node ${node.id} references unknown evidence ${link.evidenceId}`,
        });
        continue;
      }
      if (link.strength < 0 || link.strength > 1) {
        issues.push({
          code: 'reveal.strength',
          message: `Node ${node.id} link ${link.evidenceId} strength out of [0,1]`,
        });
      }
      if (hook.withoutRecorders) hasWithout = true;
    }
    if (supportsA1 && !hasWithout) {
      issues.push({
        code: 'reveal.a1WithoutRecorders',
        message: `A1-capable template: node ${node.id} needs ≥1 withoutRecorders evidence`,
      });
    }
  }

  for (const e of template.edges) {
    if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) {
      issues.push({
        code: 'edge.unknownNode',
        message: `Edge ${e.from}→${e.to} references unknown node`,
      });
    }
  }

  if (template.nodes.length > 0 && !isDag(template.nodes, template.edges)) {
    issues.push({ code: 'graph.cycle', message: 'Causal graph must be a DAG' });
  }

  for (const id of template.parCostStub.evidenceSet) {
    if (!hooks.has(id)) {
      issues.push({
        code: 'par.unknownEvidence',
        message: `parCostStub.evidenceSet references unknown ${id}`,
      });
    }
  }

  const hookDupes = template.evidenceHooks
    .map((h) => h.evidenceId)
    .filter((id, i, arr) => arr.indexOf(id) !== i);
  for (const id of new Set(hookDupes)) {
    issues.push({
      code: 'evidence.duplicate',
      message: `Duplicate evidence hook id: ${id}`,
    });
  }

  return issues;
}

export function assertValidTemplate(template: FailureModeTemplate): void {
  const issues = validateTemplate(template);
  if (issues.length > 0) {
    const detail = issues.map((i) => `${i.code}: ${i.message}`).join('; ');
    throw new Error(`Invalid template ${template.id}: ${detail}`);
  }
}
