import { useEffect } from 'react';
import { DocketShell } from './ui/shell/DocketShell';
import { SeedEntry } from './ui/modes/SeedEntry';
import { useCaseStore } from './ui/store/caseStore';
import type { ViewerId } from './ui/store/caseStore';
import {
  applyAction,
  advanceTime,
  type InvestigativeGroup,
} from './engine';

const VIEWERS: ViewerId[] = [
  'document',
  'wreckage',
  'fdr',
  'transcripts',
  'radar',
  'weather',
];

/** Deep-link / screenshot helper: ?seed=1174&viewer=fdr&unlock=1 */
function useQueryBootstrap() {
  const seed = useCaseStore((s) => s.seed);
  const startCase = useCaseStore((s) => s.startCase);
  const resumeIfSaved = useCaseStore((s) => s.resumeIfSaved);
  const setViewer = useCaseStore((s) => s.setViewer);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qSeed = params.get('seed');
    if (!qSeed || seed) return;
    const viewer = params.get('viewer') as ViewerId | null;
    const unlock = params.get('unlock') === '1';
    const resumed = resumeIfSaved(qSeed);
    if (!resumed) startCase(qSeed, 'standard');
    if (unlock) {
      // Run after store settles
      queueMicrotask(() => unlockDemoCase());
    }
    if (viewer && VIEWERS.includes(viewer)) {
      queueMicrotask(() => setViewer(viewer));
    }
  }, [seed, startCase, resumeIfSaved, setViewer]);
}

function unlockDemoCase() {
  const store = useCaseStore.getState();
  const { bundle } = store;
  let { state } = store;
  if (!bundle || !state) return;

  const groups = new Set(bundle.evidence.map((e) => e.group));
  for (const g of groups) {
    state = applyAction(state, { type: 'standUpGroup', group: g as InvestigativeGroup }, bundle);
  }

  // Request in waves until catalogue is exhausted or budget blocks
  for (let wave = 0; wave < 12; wave++) {
    let progressed = false;
    for (const item of bundle.evidence) {
      if (state.obtainedEvidenceIds.includes(item.id)) continue;
      if (state.queue.some((q) => q.source.type === 'requestEvidence' && q.source.evidenceId === item.id)) {
        continue;
      }
      if (state.decayedEvidenceIds.includes(item.id)) continue;
      if (!item.prereqs.every((p) => state!.obtainedEvidenceIds.includes(p))) continue;
      if (state.investigatorDaysRemaining < item.cost) continue;
      try {
        state = applyAction(state, { type: 'requestEvidence', evidenceId: item.id }, bundle);
        progressed = true;
      } catch {
        /* skip */
      }
    }
    if (state.queue.length > 0) {
      const etas = state.queue.map((q) => q.etaDay);
      const next = Math.max(1, Math.min(...etas) - state.calendarDay);
      state = advanceTime(state, next, bundle);
      progressed = true;
    }
    if (!progressed) break;
  }

  // Extra calendar pad for pressure / decay demos
  if (state.calendarDay < 30) {
    state = advanceTime(state, 30 - state.calendarDay, bundle);
  }

  const impact = bundle.flight.samples[bundle.flight.impactIndex];
  useCaseStore.setState({
    state,
    fdrCursorT: impact?.t_s ?? useCaseStore.getState().fdrCursorT,
    error: null,
  });
  try {
    localStorage.setItem(
      `ntsb:case:${bundle.truth.seed}:log`,
      JSON.stringify({
        seed: bundle.truth.seed,
        difficulty: bundle.truth.difficulty,
        actionLog: state.actionLog,
        savedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore */
  }
}

export function App() {
  useQueryBootstrap();
  const seed = useCaseStore((s) => s.seed);
  if (!seed) return <SeedEntry />;
  return <DocketShell />;
}
