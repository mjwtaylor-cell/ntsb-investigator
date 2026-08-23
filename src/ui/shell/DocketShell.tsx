import {
  FileText,
  Activity,
  Map,
  CloudSun,
  Radio,
  MessageSquareText,
  MessagesSquare,
  BookOpen,
} from 'lucide-react';
import { DocketNavigator } from '../docket/DocketNavigator';
import { ActionDrawer } from '../drawer/ActionDrawer';
import { DocumentViewer } from '../viewers/DocumentViewer';
import { FdrStrips } from '../viewers/FdrStrips';
import { WreckageMap } from '../viewers/WreckageMap';
import { Transcripts } from '../viewers/Transcripts';
import { RadarTrack } from '../viewers/RadarTrack';
import { WeatherPanel } from '../viewers/WeatherPanel';
import { InterviewPanel } from '../viewers/InterviewPanel';
import { HandbookPanel } from '../handbook/HandbookPanel';
import { formatBudgetPct } from '../presenters/format';
import { useCaseStore, type ViewerId } from '../store/caseStore';
import { getArchetype } from '../../engine';
import { FindingsBoard } from './FindingsBoard';
import styles from './DocketShell.module.css';

const TABS: { id: ViewerId; label: string; icon: typeof FileText }[] = [
  { id: 'document', label: 'Document', icon: FileText },
  { id: 'fdr', label: 'FDR Strips', icon: Activity },
  { id: 'wreckage', label: 'Wreckage', icon: Map },
  { id: 'transcripts', label: 'Transcripts', icon: MessageSquareText },
  { id: 'interview', label: 'Interview', icon: MessagesSquare },
  { id: 'radar', label: 'Radar/ADS-B', icon: Radio },
  { id: 'weather', label: 'Weather', icon: CloudSun },
  { id: 'handbook', label: 'Handbook', icon: BookOpen },
];

export function DocketShell() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const budgetTotal = useCaseStore((s) => s.budgetTotal);
  const activeViewer = useCaseStore((s) => s.activeViewer);
  const setViewer = useCaseStore((s) => s.setViewer);
  const rightRailOpen = useCaseStore((s) => s.rightRailOpen);
  const setRightRailOpen = useCaseStore((s) => s.setRightRailOpen);
  const resetCase = useCaseStore((s) => s.resetCase);

  if (!bundle || !state) return null;

  const arch = getArchetype(bundle.world.archetypeId);
  const budgetPct = formatBudgetPct(state.investigatorDaysRemaining, budgetTotal);
  const boardIn = Math.max(0, state.boardDeadlineDay - state.calendarDay);
  const title = `${arch.name} · ${bundle.world.operator.name} · Seed ${bundle.truth.seed}`;

  return (
    <div className={`${styles.shell} ${styles.shellRelative}`}>
      <header className={styles.topbar}>
        <div className={styles.brand}>NTSB Investigator</div>
        <div className={styles.caseTitle} title={title}>
          {title}
        </div>
        <div className={styles.meta}>
          <span>Day {state.calendarDay}</span>
          <span className={styles.meter} title="Investigator-days remaining">
            Budget
            <span className={styles.meterBar} aria-hidden="true">
              <span className={styles.meterFill} style={{ width: `${budgetPct}%` }} />
            </span>
            {budgetPct}%
          </span>
          <span className={styles.meter} title="Public confidence">
            Confidence
            <span className={styles.meterBar} aria-hidden="true">
              <span
                className={styles.meterFill}
                style={{
                  width: `${Math.max(0, Math.min(100, state.publicConfidence))}%`,
                  background: 'var(--ok)',
                }}
              />
            </span>
            {Math.round(state.publicConfidence)}
          </span>
          <span>Board in {boardIn}d</span>
          <button type="button" className={styles.draftBtn} disabled title="P4">
            Draft findings
          </button>
          <button type="button" className={styles.linkBtn} onClick={() => resetCase()}>
            Exit case
          </button>
        </div>
      </header>

      <button
        type="button"
        className={styles.railTab}
        aria-expanded={rightRailOpen}
        onClick={() => setRightRailOpen(!rightRailOpen)}
      >
        Findings
      </button>

      <div className={styles.body}>
        <aside className={styles.rail}>
          <DocketNavigator />
        </aside>

        <main className={styles.workspace}>
          <div className={styles.tabs} role="tablist" aria-label="Viewers">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const selected = activeViewer === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
                  onClick={() => setViewer(tab.id)}
                >
                  <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className={styles.panel} role="tabpanel">
            {activeViewer === 'document' ? <DocumentViewer /> : null}
            {activeViewer === 'fdr' ? <FdrStrips /> : null}
            {activeViewer === 'wreckage' ? <WreckageMap /> : null}
            {activeViewer === 'transcripts' ? <Transcripts /> : null}
            {activeViewer === 'radar' ? <RadarTrack /> : null}
            {activeViewer === 'weather' ? <WeatherPanel /> : null}
            {activeViewer === 'interview' ? <InterviewPanel /> : null}
            {activeViewer === 'handbook' ? <HandbookPanel /> : null}
          </div>

          <footer className={styles.footer}>
            NTSB Investigator is a work of fiction for entertainment and education. It is not
            affiliated with or endorsed by the National Transportation Safety Board. All aircraft,
            operators, airports, people and events are fictional.
          </footer>
        </main>

        <aside
          className={`${styles.railRight} ${rightRailOpen ? styles.railRightOpen : ''}`}
          aria-label="Findings board"
        >
          <FindingsBoard />
        </aside>
      </div>

      <ActionDrawer />
    </div>
  );
}
