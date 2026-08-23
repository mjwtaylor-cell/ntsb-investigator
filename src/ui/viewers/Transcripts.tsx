import { useMemo } from 'react';
import { presentCvr, formatTranscriptStamp } from '../presenters/transcripts';
import { useCaseStore } from '../store/caseStore';
import styles from './Transcripts.module.css';

export function Transcripts() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const lines = useMemo(() => (bundle ? presentCvr(bundle) : []), [bundle]);
  const unlocked = Boolean(
    state &&
      (state.obtainedEvidenceIds.includes('cvr.transcript') ||
        state.obtainedEvidenceIds.includes('ops.dispatcher_interview') ||
        state.obtainedEvidenceIds.includes('atc.tower_transcript')),
  );

  if (!bundle || !state) {
    return <div className={styles.empty}>Start a case to view transcripts.</div>;
  }
  if (!unlocked) {
    return (
      <div className={styles.empty}>
        <p className={styles.eyebrow}>Transcripts</p>
        <p className={styles.lock}>
          Obtain CVR transcript (after recorder recovery) or an ATC/dispatch interview to unlock.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.panel} aria-label="Transcript viewer">
      <p className={styles.eyebrow}>CVR / ATC transcript · Seed {bundle.truth.seed}</p>
      <div className={styles.list}>
        {lines.map((line) => (
          <div key={`${line.t_s}-${line.speaker}-${line.text}`} className={styles.row}>
            <span className={styles.t}>{formatTranscriptStamp(line.t_s)}</span>
            <span className={styles.spk}>{line.speaker}</span>
            <span className={line.kind === 'sound' ? styles.sound : undefined}>{line.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
