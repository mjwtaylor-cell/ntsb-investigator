import { describe, it, expect } from 'vitest';
import { generateCase } from '../../src/engine';
import { presentCvr, presentAtc } from '../../src/ui/presenters/transcripts';
import { presentDocument, docketNumber } from '../../src/ui/presenters/documents';
import { witnessStatements } from '../../src/engine/evidence/witnesses';
import { presentInterviewTranscript } from '../../src/ui/presenters/interviews';
import { INTERVIEW_SUBJECTS, createInitialState } from '../../src/engine';

const SEEDS = ['1174', '42', '9001', 'a1-case', 't6-seed'];

function bundleFor(seed: string) {
  const opts =
    seed === 'a1-case'
      ? { archetype: 'A1' as const, template: 'T1' as const }
      : seed === 't6-seed'
        ? { archetype: 'A3' as const, template: 'T6' as const }
        : {};
  return generateCase(seed, opts);
}

function collectPresentationStrings(seed: string): string[] {
  const bundle = bundleFor(seed);
  const out: string[] = [];
  for (const line of presentCvr(bundle)) {
    out.push(line.text, line.speaker);
  }
  for (const line of presentAtc(bundle)) {
    out.push(line.text, line.speaker);
  }
  for (const s of witnessStatements(bundle.truth.seed)) {
    out.push(s);
  }
  for (const item of bundle.evidence) {
    const paper = presentDocument(item, bundle, 9);
    out.push(paper.eyebrow, paper.title, paper.meta, ...paper.body);
    if (paper.stamp) out.push(paper.stamp);
    if (paper.watermark) out.push(paper.watermark);
  }
  out.push(docketNumber(bundle));
  const state = createInitialState(bundle);
  state.obtainedEvidenceIds = bundle.evidence.map((e) => e.id);
  state.activeGroups = Array.from(new Set(bundle.evidence.map((e) => e.group)));
  for (const sub of INTERVIEW_SUBJECTS) {
    for (const topic of sub.topics) {
      const eid = `interview.${sub.id}.${topic.id}`;
      if (!bundle.evidence.some((e) => e.id === eid)) continue;
      const tr = presentInterviewTranscript(eid, state);
      if (!tr) continue;
      out.push(tr.title);
      for (const line of tr.lines) out.push(line.speaker, line.text);
    }
  }
  return out;
}

describe('evidence never contains the truth', () => {
  for (const seed of SEEDS) {
    it(`presentation strings for seed ${seed} omit node/event truth text`, () => {
      const bundle = bundleFor(seed);
      const haystack = collectPresentationStrings(seed).join('\n');

      for (const node of bundle.truth.nodes) {
        expect(haystack.includes(node.id), `leaked node id ${node.id}`).toBe(false);
        if (node.text.length >= 24) {
          expect(haystack.includes(node.text), `leaked node text: ${node.text.slice(0, 40)}…`).toBe(
            false,
          );
        }
      }
      for (const ev of bundle.flight.events) {
        expect(haystack.includes(ev.eventId), `leaked event id ${ev.eventId}`).toBe(false);
        if (ev.description.length >= 16) {
          expect(
            haystack.includes(ev.description),
            `leaked event description: ${ev.description.slice(0, 40)}…`,
          ).toBe(false);
        }
      }
      const metaLines = bundle.evidence.map((item) => presentDocument(item, bundle, 3).meta);
      for (const meta of metaLines) {
        expect(meta.toLowerCase()).not.toContain(`seed ${bundle.truth.seed.toLowerCase()}`);
        expect(/^[A-Z]{3}\d{2}FA\d{3}$/.test((meta.split(' · ')[0] ?? '').trim())).toBe(true);
      }
    });
  }

  it('72-hour history is a sleep/duty table without CRM indices', () => {
    const bundle = generateCase('1174');
    const item = bundle.evidence.find((e) => e.id === 'hp.72hour_history');
    expect(item).toBeTruthy();
    const paper = presentDocument(item!, bundle, 5);
    const joined = paper.body.join('\n');
    expect(joined).toMatch(/wake/i);
    expect(joined).toMatch(/duty/i);
    expect(joined.toLowerCase()).not.toContain('crm');
    expect(joined).not.toMatch(/\d\.\d{2}/);
  });
});
