import { useState } from 'react';
import { daysUntilNextResult } from '../../engine/actions/queue';
import { GROUP_DAILY_BURN } from '../../engine';
import { GROUP_LABEL } from '../presenters/groups';
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
  const [urgentText, setUrgentText] = useState('');
  const [urgentRecipient, setUrgentRecipient] = useState<
    'faa' | 'manufacturer' | 'operator' | 'industry'
  >('faa');

  if (!bundle || !state) return null;

  const pressure = openPressure(bundle, state);
  const next = daysUntilNextResult(state);
  const burn = state.activeGroups.length * GROUP_DAILY_BURN;
  const perishable = bundle.evidence.filter(
    (e) =>
      e.decay !== undefined &&
      !state.obtainedEvidenceIds.includes(e.id) &&
      !state.decayedEvidenceIds.includes(e.id),
  );
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
            <p className={styles.eyebrow}>Go Team · burn {burn.toFixed(2)}/day</p>
            {state.activeGroups.length === 0 ? (
              <p className={styles.empty}>No groups standing. Use the docket rail.</p>
            ) : (
              <ul className={styles.list}>
                {state.activeGroups.map((g) => (
                  <li key={g}>
                    {GROUP_LABEL[g]}{' '}
                    <button
                      type="button"
                      className={styles.link}
                      onClick={() => dispatch({ type: 'standDownGroup', group: g })}
                    >
                      stand down
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              {Math.max(0, state.boardDeadlineDay - state.calendarDay)}d · confidence{' '}
              {Math.round(state.publicConfidence)}
            </p>
            <p className={styles.eyebrow}>Evidence decay</p>
            {perishable.length === 0 && state.decayedEvidenceIds.length === 0 ? (
              <p className={styles.empty}>No perishable items at risk.</p>
            ) : (
              <ul className={styles.list}>
                {perishable.slice(0, 4).map((e) => (
                  <li key={e.id}>
                    {e.title} · decays d{e.decay}{' '}
                    {!state.securedEvidenceIds.includes(e.id) ? (
                      <button
                        type="button"
                        className={styles.link}
                        onClick={() =>
                          dispatch({ type: 'secureEvidence', evidenceId: e.id })
                        }
                      >
                        secure
                      </button>
                    ) : (
                      <span className={styles.ok}>secured</span>
                    )}
                  </li>
                ))}
                {state.decayedEvidenceIds.slice(0, 3).map((id) => (
                  <li key={id} className={styles.decayed}>
                    LOST · {catalogueItem(bundle, id)?.title ?? id}
                  </li>
                ))}
              </ul>
            )}
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

          <div className={styles.col}>
            <p className={styles.eyebrow}>Parties · cooperation</p>
            {Object.entries(state.partyCooperation).map(([id, coop]) => (
              <div key={id} className={styles.partyRow}>
                <span>
                  {id} · {Math.round(coop)}
                </span>
                <button
                  type="button"
                  className={styles.btn}
                  onClick={() => dispatch({ type: 'subpoena', partyId: id })}
                >
                  Subpoena (−15)
                </button>
              </div>
            ))}
            <p className={styles.eyebrow}>Urgent recommendation</p>
            <input
              className={styles.input}
              value={urgentText}
              onChange={(e) => setUrgentText(e.target.value)}
              placeholder="Recommendation text"
              aria-label="Urgent recommendation text"
            />
            <select
              className={styles.input}
              value={urgentRecipient}
              onChange={(e) =>
                setUrgentRecipient(e.target.value as typeof urgentRecipient)
              }
              aria-label="Recipient"
            >
              <option value="faa">FAA</option>
              <option value="operator">Operator</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="industry">Industry</option>
            </select>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={!urgentText.trim()}
              onClick={() => {
                dispatch({
                  type: 'issueUrgentRec',
                  recommendation: {
                    id: `urgent.${state.recommendations.length + 1}`,
                    recipient: urgentRecipient,
                    text: urgentText.trim(),
                    urgent: true,
                  },
                });
                setUrgentText('');
              }}
            >
              Issue urgent rec
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
