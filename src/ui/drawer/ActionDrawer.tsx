import { daysUntilNextResult } from '../../engine/actions/queue';
import { useCaseStore, openPressure, catalogueItem } from '../store/caseStore';
import styles from './ActionDrawer.module.css';

export function ActionDrawer() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const drawerOpen = useCaseStore((s) => s.drawerOpen);
  const setDrawerOpen = useCaseStore((s) => s.setDrawerOpen);
  const advance = useCaseStore((s) => s.advance);
  const dispatch = useCaseStore((s) => s.dispatch);
  const error = useCaseStore((s) => s.error);
  const clearError = useCaseStore((s) => s.clearError);

  if (!bundle || !state) return null;

  const pressure = openPressure(bundle, state);
  const next = daysUntilNextResult(state);

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-expanded={drawerOpen}
      >
        {drawerOpen ? 'Hide actions' : 'Actions'}
      </button>
      {drawerOpen ? (
        <div className={styles.drawer} aria-label="Action drawer">
          {error ? (
            <p className={styles.error} role="alert">
              {error}{' '}
              <button type="button" className={styles.btn} onClick={clearError}>
                Dismiss
              </button>
            </p>
          ) : null}
          <div className={styles.col}>
            <p className={styles.eyebrow}>Queue</p>
            {state.queue.length === 0 ? (
              <p className={styles.empty}>No work in flight.</p>
            ) : (
              state.queue.map((q) => {
                const eid =
                  q.source.type === 'requestEvidence' ? q.source.evidenceId : q.id;
                const item =
                  q.source.type === 'requestEvidence'
                    ? catalogueItem(bundle, q.source.evidenceId)
                    : undefined;
                return (
                  <div key={q.id} className={styles.queueItem}>
                    <span>{item?.title ?? eid}</span>
                    <span className={styles.eta}>
                      ETA day {q.etaDay} · {q.costCharged} inv-d
                    </span>
                  </div>
                );
              })
            )}
          </div>
          <div className={styles.col}>
            <p className={styles.eyebrow}>Advance time</p>
            <div className={styles.advanceRow}>
              {[1, 3, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  className={styles.btn}
                  onClick={() => advance(d)}
                >
                  +{d}d
                </button>
              ))}
              {next !== null && next > 0 ? (
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => advance(next)}
                >
                  Next result (+{next}d)
                </button>
              ) : null}
            </div>
            <p className={styles.empty}>
              Calendar day {state.calendarDay} · board in{' '}
              {Math.max(0, state.boardDeadlineDay - state.calendarDay)}d
            </p>
          </div>
          <div className={styles.col}>
            <p className={styles.eyebrow}>Pressure</p>
            {pressure.length === 0 ? (
              <p className={styles.empty}>No active pressure events.</p>
            ) : (
              pressure.map((ev) => (
                <div key={ev.id} className={styles.card}>
                  <p className={styles.cardTitle}>{ev.title}</p>
                  <p className={styles.cardBody}>{ev.body}</p>
                  <div className={styles.choices}>
                    {ev.choices.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={styles.btn}
                        onClick={() =>
                          dispatch({
                            type: 'respondPressure',
                            eventId: ev.id,
                            choiceId: c.id,
                          })
                        }
                      >
                        {c.label}
                        {c.cost ? ` (${c.cost}d)` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
