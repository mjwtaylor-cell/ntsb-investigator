import { useCaseStore } from '../store/caseStore';
import styles from './FindingsBoard.module.css';

export function FindingsBoard() {
  const state = useCaseStore((s) => s.state);
  const bundle = useCaseStore((s) => s.bundle);

  if (!state || !bundle) {
    return (
      <div className={styles.board}>
        <p className={styles.eyebrow}>Findings board</p>
        <p className={styles.empty}>Open a case to pin findings. Full composer lands in P4.</p>
      </div>
    );
  }

  const obtained = state.obtainedEvidenceIds.length;
  const nodes = bundle.truth.nodes.filter((n) => n.kind !== 'outcome');

  return (
    <div className={styles.board}>
      <p className={styles.eyebrow}>Findings board</p>
      {state.findings.length === 0 ? (
        <div className={styles.card}>
          <p className={`${styles.tier} ${styles.tierNote}`}>Working notes</p>
          <p className={styles.text}>
            {obtained === 0
              ? 'No evidence held yet. Stand up groups, request items, advance time.'
              : `${obtained} evidence item(s) held. Draft findings arrive in P4 — use notes here for now.`}
          </p>
        </div>
      ) : (
        state.findings.map((f) => (
          <div
            key={f.id}
            className={`${styles.card} ${f.tier === 'probableCause' ? styles.cardPc : ''}`}
          >
            <p
              className={`${styles.tier} ${
                f.tier === 'probableCause' ? styles.tierPc : styles.tierContrib
              }`}
            >
              {f.tier}
            </p>
            <p className={styles.text}>{f.text}</p>
            {f.citedEvidenceIds.length > 0 ? (
              <p className={styles.cite}>cites: {f.citedEvidenceIds.join(' · ')}</p>
            ) : null}
          </div>
        ))
      )}

      <div className={styles.chain} aria-label="Causal chain overview">
        <p className={styles.eyebrow}>Truth tiers (hidden until debrief)</p>
        <p className={styles.empty}>
          {nodes.length} causal nodes in seed {bundle.truth.seed}. Board submission and debrief are
          P4.
        </p>
        <p className={styles.cite}>
          Par {bundle.par.investigatorDays} inv-d / {bundle.par.calendarDays} cal-d · budget left{' '}
          {state.investigatorDaysRemaining.toFixed(1)}
        </p>
      </div>
    </div>
  );
}
