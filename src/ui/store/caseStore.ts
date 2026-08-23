import { create } from 'zustand';
import {
  advanceTime,
  applyAction,
  createInitialState,
  generateCase,
  type Action,
  type CaseState,
  type EvidenceItem,
  type GeneratedCase,
  type InvestigativeGroup,
} from '../../engine';
import { activePressureEvents, type PressureEvent } from '../../engine/actions/pressure';

export type ViewerId =
  | 'document'
  | 'wreckage'
  | 'fdr'
  | 'transcripts'
  | 'radar'
  | 'weather';

const LOG_PREFIX = 'ntsb:case:';
const SETTINGS_KEY = 'ntsb:settings';

export interface PersistedLog {
  seed: string;
  difficulty: 'standard' | 'senior';
  actionLog: Action[];
  savedAt: string;
}

export interface CaseStore {
  seed: string | null;
  bundle: GeneratedCase | null;
  state: CaseState | null;
  selectedEvidenceId: string | null;
  selectedGroup: InvestigativeGroup | null;
  activeViewer: ViewerId;
  fdrCursorT: number;
  rightRailOpen: boolean;
  drawerOpen: boolean;
  error: string | null;
  /** Initial investigator-day budget (for meter). */
  budgetTotal: number;

  startCase: (seed: string, difficulty?: 'standard' | 'senior') => void;
  resumeIfSaved: (seed: string) => boolean;
  dispatch: (action: Action) => void;
  advance: (days: number) => void;
  selectEvidence: (id: string | null) => void;
  selectGroup: (g: InvestigativeGroup | null) => void;
  setViewer: (v: ViewerId) => void;
  setFdrCursor: (t: number) => void;
  setRightRailOpen: (open: boolean) => void;
  setDrawerOpen: (open: boolean) => void;
  clearError: () => void;
  exportLog: () => PersistedLog | null;
  resetCase: () => void;
}

function storageKey(seed: string): string {
  return `${LOG_PREFIX}${seed}:log`;
}

function persist(seed: string, difficulty: 'standard' | 'senior', actionLog: Action[]) {
  try {
    const payload: PersistedLog = {
      seed,
      difficulty,
      actionLog,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(storageKey(seed), JSON.stringify(payload));
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ lastSeed: seed, updatedAt: payload.savedAt }),
    );
  } catch {
    // Ignore quota / private mode.
  }
}

function loadPersisted(seed: string): PersistedLog | null {
  try {
    const raw = localStorage.getItem(storageKey(seed));
    if (!raw) return null;
    return JSON.parse(raw) as PersistedLog;
  } catch {
    return null;
  }
}

function replay(bundle: GeneratedCase, log: Action[]): CaseState {
  let state = createInitialState(bundle);
  for (const action of log) {
    if (action.type === 'advanceTime') {
      state = advanceTime(state, action.days, bundle);
    } else {
      state = applyAction(state, action, bundle);
    }
  }
  return state;
}

export function catalogueItem(
  bundle: GeneratedCase,
  id: string,
): EvidenceItem | undefined {
  return bundle.evidence.find((e) => e.id === id);
}

export function openPressure(bundle: GeneratedCase, state: CaseState): PressureEvent[] {
  return activePressureEvents(state, bundle.pressureEvents);
}

export const useCaseStore = create<CaseStore>((set, get) => ({
  seed: null,
  bundle: null,
  state: null,
  selectedEvidenceId: null,
  selectedGroup: null,
  activeViewer: 'document',
  fdrCursorT: 0,
  rightRailOpen: false,
  drawerOpen: true,
  error: null,
  budgetTotal: 0,

  startCase: (seed, difficulty = 'standard') => {
    const trimmed = seed.trim();
    if (!trimmed) {
      set({ error: 'Enter a seed.' });
      return;
    }
    try {
      const bundle = generateCase(trimmed, { difficulty });
      const state = createInitialState(bundle);
      const impact = bundle.flight.samples[bundle.flight.impactIndex];
      set({
        seed: trimmed,
        bundle,
        state,
        selectedEvidenceId: null,
        selectedGroup: null,
        activeViewer: 'document',
        fdrCursorT: impact?.t_s ?? 0,
        error: null,
        budgetTotal: state.investigatorDaysRemaining,
      });
      persist(trimmed, difficulty, state.actionLog);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },

  resumeIfSaved: (seed) => {
    const saved = loadPersisted(seed);
    if (!saved) return false;
    try {
      const bundle = generateCase(saved.seed, { difficulty: saved.difficulty });
      const state = replay(bundle, saved.actionLog);
      const impact = bundle.flight.samples[bundle.flight.impactIndex];
      const initial = createInitialState(bundle);
      set({
        seed: saved.seed,
        bundle,
        state,
        selectedEvidenceId: null,
        selectedGroup: null,
        activeViewer: 'document',
        fdrCursorT: impact?.t_s ?? 0,
        error: null,
        budgetTotal: initial.investigatorDaysRemaining,
      });
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },

  dispatch: (action) => {
    const { bundle, state, seed } = get();
    if (!bundle || !state || !seed) return;
    try {
      const next = applyAction(state, action, bundle);
      set({ state: next, error: null });
      persist(seed, bundle.truth.difficulty, next.actionLog);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },

  advance: (days) => {
    const { bundle, state, seed } = get();
    if (!bundle || !state || !seed) return;
    try {
      const next = advanceTime(state, days, bundle);
      set({ state: next, error: null });
      persist(seed, bundle.truth.difficulty, next.actionLog);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : String(err) });
    }
  },

  selectEvidence: (id) => {
    const { bundle } = get();
    const item = id && bundle ? catalogueItem(bundle, id) : undefined;
    set({
      selectedEvidenceId: id,
      selectedGroup: item?.group ?? get().selectedGroup,
      activeViewer: item
        ? viewerForEvidence(item)
        : get().activeViewer,
    });
  },

  selectGroup: (g) => set({ selectedGroup: g }),
  setViewer: (v) => set({ activeViewer: v }),
  setFdrCursor: (t) => set({ fdrCursorT: t }),
  setRightRailOpen: (open) => set({ rightRailOpen: open }),
  setDrawerOpen: (open) => set({ drawerOpen: open }),
  clearError: () => set({ error: null }),

  exportLog: () => {
    const { seed, bundle, state } = get();
    if (!seed || !bundle || !state) return null;
    return {
      seed,
      difficulty: bundle.truth.difficulty,
      actionLog: state.actionLog,
      savedAt: new Date().toISOString(),
    };
  },

  resetCase: () => {
    const { seed } = get();
    if (seed) {
      try {
        localStorage.removeItem(storageKey(seed));
      } catch {
        /* ignore */
      }
    }
    set({
      seed: null,
      bundle: null,
      state: null,
      selectedEvidenceId: null,
      selectedGroup: null,
      activeViewer: 'document',
      fdrCursorT: 0,
      error: null,
      budgetTotal: 0,
    });
  },
}));

function viewerForEvidence(item: EvidenceItem): ViewerId {
  if (item.id.startsWith('adsb.') || item.id.startsWith('radar.') || item.group === 'atc') {
    if (item.renderer === 'map' || item.renderer === 'trace') return 'radar';
  }
  if (item.id.startsWith('wx.') || item.group === 'meteorology') return 'weather';
  switch (item.renderer) {
    case 'trace':
      return 'fdr';
    case 'map':
    case 'photo-set':
      return 'wreckage';
    case 'transcript':
    case 'dialogue':
      return 'transcripts';
    default:
      return 'document';
  }
}

export function lastSeedFromSettings(): string | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { lastSeed?: string };
    return parsed.lastSeed ?? null;
  } catch {
    return null;
  }
}
