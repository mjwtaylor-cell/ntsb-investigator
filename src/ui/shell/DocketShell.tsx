import { FileText, Activity, Map, CloudSun } from 'lucide-react';
import styles from './DocketShell.module.css';
import { PaperDocument } from './PaperDocument';
import { StripChart } from './StripChart';
import { FindingsBoard } from './FindingsBoard';

const GROUPS = [
  { id: 'operations', label: 'Operations', badge: '2 new' },
  { id: 'human', label: 'Human Performance' },
  { id: 'structures', label: 'Structures', badge: '1 new' },
  { id: 'systems', label: 'Systems' },
  { id: 'powerplants', label: 'Powerplants' },
  { id: 'maintenance', label: 'Maintenance Records' },
  { id: 'atc', label: 'ATC' },
  { id: 'meteorology', label: 'Meteorology', badge: '1 new' },
  { id: 'survival', label: 'Survival Factors' },
  { id: 'recorders', label: 'Recorders', badge: 'NEW' },
  { id: 'witnesses', label: 'Witnesses' },
  { id: 'parties', label: 'Parties' },
] as const;

export function DocketShell() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>NTSB Investigator</div>
        <div className={styles.caseTitle}>Kestrel 19 · Flight 204 · Placeholder</div>
        <div className={styles.meta}>
          <span>Day 9</span>
          <span className={styles.meter} title="Investigator-days">
            Budget
            <span className={styles.meterBar} aria-hidden="true">
              <span className={styles.meterFill} style={{ width: '61%' }} />
            </span>
            61%
          </span>
          <span className={styles.meter} title="Public confidence">
            Confidence
            <span className={styles.meterBar} aria-hidden="true">
              <span className={styles.meterFill} style={{ width: '72%', background: 'var(--ok)' }} />
            </span>
            72
          </span>
          <span>Board in 261d</span>
          <button type="button" className={styles.draftBtn}>
            Draft findings
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.rail} aria-label="Docket navigator">
          <p className={styles.sectionEyebrow}>Docket</p>
          <ul className={styles.groupList}>
            {GROUPS.map((g) => (
              <li key={g.id}>
                <div className={styles.groupItem}>
                  <span>{g.label}</span>
                  {'badge' in g && g.badge ? <span className={styles.badge}>{g.badge}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <main className={styles.workspace}>
          <div className={styles.tabs} role="tablist" aria-label="Viewers">
            <button type="button" className={`${styles.tab} ${styles.tabActive}`} role="tab" aria-selected="true">
              <FileText size={14} strokeWidth={1.5} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              Document
            </button>
            <button type="button" className={styles.tab} role="tab" aria-selected="false">
              <Activity size={14} strokeWidth={1.5} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              FDR Strips
            </button>
            <button type="button" className={styles.tab} role="tab" aria-selected="false">
              <Map size={14} strokeWidth={1.5} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              Wreckage
            </button>
            <button type="button" className={styles.tab} role="tab" aria-selected="false">
              <CloudSun size={14} strokeWidth={1.5} style={{ marginRight: 6, verticalAlign: '-2px' }} />
              Weather
            </button>
          </div>

          <div className={styles.panelRow}>
            <PaperDocument />
            <StripChart />
          </div>

          <footer className={styles.footer}>
            NTSB Investigator is a work of fiction for entertainment and education. It is not affiliated
            with or endorsed by the National Transportation Safety Board. All aircraft, operators,
            airports, people and events are fictional.
          </footer>
        </main>

        <aside className={styles.railRight} aria-label="Findings board">
          <FindingsBoard />
        </aside>
      </div>
    </div>
  );
}
