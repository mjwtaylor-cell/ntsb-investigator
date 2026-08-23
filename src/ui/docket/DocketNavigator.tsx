import type { EvidenceItem, InvestigativeGroup } from '../../engine';
import { GROUP_LABEL, GROUP_ORDER } from '../presenters/groups';
import { formatInvDays } from '../presenters/format';
import { useCaseStore } from '../store/caseStore';
import styles from './DocketNavigator.module.css';

function statusOf(
  item: EvidenceItem,
  obtained: string[],
  queued: string[],
  decayed: string[],
): 'held' | 'queued' | 'decayed' | 'available' {
  if (decayed.includes(item.id)) return 'decayed';
  if (obtained.includes(item.id)) return 'held';
  if (queued.includes(item.id)) return 'queued';
  return 'available';
}

export function DocketNavigator() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const selectedGroup = useCaseStore((s) => s.selectedGroup);
  const selectedEvidenceId = useCaseStore((s) => s.selectedEvidenceId);
  const selectGroup = useCaseStore((s) => s.selectGroup);
  const selectEvidence = useCaseStore((s) => s.selectEvidence);
  const dispatch = useCaseStore((s) => s.dispatch);

  if (!bundle || !state) {
    return (
      <nav className={styles.nav} aria-label="Docket navigator">
        <p className={styles.eyebrow}>Docket</p>
        <p className={styles.hint}>Enter a seed to open a case.</p>
      </nav>
    );
  }

  const queuedIds = state.queue
    .filter((q) => q.source.type === 'requestEvidence')
    .map((q) => (q.source.type === 'requestEvidence' ? q.source.evidenceId : ''));

  const byGroup = (g: InvestigativeGroup) => bundle.evidence.filter((e) => e.group === g);

  const active = selectedGroup ?? 'operations';
  const items = byGroup(active);

  return (
    <nav className={styles.nav} aria-label="Docket navigator">
      <p className={styles.eyebrow}>Docket</p>
      <ul className={styles.groupList}>
        {GROUP_ORDER.map((g) => {
          const groupItems = byGroup(g);
          if (groupItems.length === 0) return null;
          const newCount = groupItems.filter((e) => state.obtainedEvidenceIds.includes(e.id)).length;
          const standing = state.activeGroups.includes(g);
          return (
            <li key={g}>
              <button
                type="button"
                className={`${styles.groupBtn} ${active === g ? styles.groupBtnActive : ''} ${
                  standing ? styles.groupBtnStanding : ''
                }`}
                onClick={() => selectGroup(g)}
              >
                <span>{GROUP_LABEL[g]}</span>
                {newCount > 0 ? <span className={styles.badge}>{newCount} held</span> : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.detail}>
        <p className={styles.detailTitle}>{GROUP_LABEL[active]}</p>
        {!state.activeGroups.includes(active) ? (
          <button
            type="button"
            className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
            onClick={() => dispatch({ type: 'standUpGroup', group: active })}
          >
            Stand up group
          </button>
        ) : (
          <button
            type="button"
            className={styles.smallBtn}
            onClick={() => dispatch({ type: 'standDownGroup', group: active })}
          >
            Stand down
          </button>
        )}
        <p className={styles.hint}>Active groups burn 0.35 inv-d each calendar day.</p>
        {items.map((item) => {
          const st = statusOf(item, state.obtainedEvidenceIds, queuedIds, state.decayedEvidenceIds);
          const prereqOk = item.prereqs.every((p) => state.obtainedEvidenceIds.includes(p));
          const canRequest =
            st === 'available' &&
            prereqOk &&
            state.investigatorDaysRemaining >= item.cost &&
            state.activeGroups.includes(active);
          return (
            <div
              key={item.id}
              className={`${styles.row} ${selectedEvidenceId === item.id ? styles.rowActive : ''}`}
            >
              <button
                type="button"
                className={styles.rowTitle}
                style={{ background: 'transparent', border: 'none', padding: 0, textAlign: 'left' }}
                onClick={() => selectEvidence(item.id)}
              >
                {item.title}
              </button>
              <p className={styles.rowMeta}>
                <span
                  className={
                    st === 'held'
                      ? styles.statusHeld
                      : st === 'queued'
                        ? styles.statusQueued
                        : st === 'decayed'
                          ? styles.statusDecayed
                          : undefined
                  }
                >
                  {st.toUpperCase()}
                </span>
                {' · '}
                {formatInvDays(item.cost)} · lead {item.leadTime}d
                {item.decay !== undefined ? ` · decay d${item.decay}` : ''}
                {!prereqOk ? ` · needs ${item.prereqs.join(', ')}` : ''}
              </p>
              <div className={styles.rowActions}>
                {canRequest ? (
                  <button
                    type="button"
                    className={`${styles.smallBtn} ${styles.smallBtnPrimary}`}
                    onClick={() => dispatch({ type: 'requestEvidence', evidenceId: item.id })}
                  >
                    Request
                  </button>
                ) : null}
                {st === 'available' &&
                item.decay !== undefined &&
                !state.securedEvidenceIds.includes(item.id) ? (
                  <button
                    type="button"
                    className={styles.smallBtn}
                    onClick={() => dispatch({ type: 'secureEvidence', evidenceId: item.id })}
                  >
                    Secure
                  </button>
                ) : null}
                {st === 'held' ? (
                  <button
                    type="button"
                    className={styles.smallBtn}
                    onClick={() => selectEvidence(item.id)}
                  >
                    Open
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
