import { useEffect, useMemo, useState } from 'react';
import {
  INTERVIEW_SUBJECTS,
  unlockedTopics,
  type InterviewSubjectId,
} from '../../engine';
import { presentInterviewTranscript } from '../presenters/interviews';
import { useCaseStore } from '../store/caseStore';
import styles from './InterviewPanel.module.css';

export function InterviewPanel() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const dispatch = useCaseStore((s) => s.dispatch);
  const error = useCaseStore((s) => s.error);
  const [subjectId, setSubjectId] = useState<InterviewSubjectId>('dispatcher');
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);

  const subject = useMemo(
    () => INTERVIEW_SUBJECTS.find((s) => s.id === subjectId)!,
    [subjectId],
  );

  useEffect(() => {
    if (!state) {
      setActiveTranscript(null);
      return;
    }
    const held = subject.topics
      .map((t) => `interview.${subject.id}.${t.id}`)
      .find((id) => state.obtainedEvidenceIds.includes(id));
    setActiveTranscript(held ?? null);
  }, [subject, state]);

  if (!bundle || !state) {
    return <div className={styles.empty}>Start a case to open interviews.</div>;
  }

  const unlocked = unlockedTopics(subjectId, state.obtainedEvidenceIds);
  const baseHeld = state.obtainedEvidenceIds.includes(subject.baseEvidenceId);
  const groupActive = state.activeGroups.includes(subject.group);
  const transcriptId = activeTranscript;
  const transcript =
    transcriptId && state.obtainedEvidenceIds.includes(transcriptId)
      ? presentInterviewTranscript(transcriptId, state)
      : null;

  return (
    <section className={styles.panel} aria-label="Interview panel">
      <aside className={styles.side}>
        <p className={styles.eyebrow}>Subjects</p>
        {INTERVIEW_SUBJECTS.map((s) => {
          const available = bundle.evidence.some((e) => e.id === s.baseEvidenceId);
          if (!available) return null;
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.subBtn} ${subjectId === s.id ? styles.subBtnActive : ''}`}
              onClick={() => {
                setSubjectId(s.id);
                setActiveTranscript(null);
              }}
            >
              {s.displayName}
              <div className={styles.locked}>{s.role}</div>
            </button>
          );
        })}
      </aside>
      <div className={styles.main}>
        <p className={styles.eyebrow}>
          {subject.displayName} · topics
          {!groupActive ? ' · stand up group first' : ''}
          {!baseHeld ? ` · obtain ${subject.baseEvidenceId} first` : ''}
        </p>
        {error ? <p className={styles.empty}>{error}</p> : null}
        {subject.topics.map((topic) => {
          const eid = `interview.${subject.id}.${topic.id}`;
          const held = state.obtainedEvidenceIds.includes(eid);
          const open = unlocked.includes(topic.id);
          return (
            <div key={topic.id} className={styles.topicRow}>
              <div>
                <div>{topic.label}</div>
                {held ? (
                  <span className={styles.held}>TRANSCRIPT HELD</span>
                ) : open ? (
                  <span className={styles.held}>Unlocked · {topic.cost} inv-d</span>
                ) : (
                  <span className={styles.locked}>
                    Locked · needs {topic.unlockAnyOf.join(' or ') || 'base interview'}
                  </span>
                )}
              </div>
              <div>
                {held ? (
                  <button
                    type="button"
                    className={styles.btn}
                    onClick={() => setActiveTranscript(eid)}
                  >
                    Open transcript
                  </button>
                ) : open && groupActive && baseHeld ? (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => {
                      dispatch({
                        type: 'conductInterview',
                        subjectId: subject.id,
                        topicId: topic.id,
                      });
                      setActiveTranscript(eid);
                    }}
                  >
                    Conduct
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
        {transcript ? (
          <>
            <p className={styles.eyebrow}>{transcript.title}</p>
            <div className={styles.list}>
              {transcript.lines.map((line, i) => (
                <div key={`${line.speaker}-${i}`} className={styles.row}>
                  <span className={styles.spk}>{line.speaker}</span>
                  <span>{line.text}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.empty}>
            Conduct a topic to create a transcript evidence item in the docket.
          </p>
        )}
      </div>
    </section>
  );
}
