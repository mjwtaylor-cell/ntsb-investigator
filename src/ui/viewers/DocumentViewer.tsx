import { presentDocument } from '../presenters/documents';
import { useCaseStore, catalogueItem } from '../store/caseStore';
import styles from './DocumentViewer.module.css';

export function DocumentViewer() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const selectedEvidenceId = useCaseStore((s) => s.selectedEvidenceId);

  if (!bundle || !state) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Document</p>
        <p>Start a case to open the docket.</p>
      </div>
    );
  }

  const obtained = state.obtainedEvidenceIds;
  const id =
    selectedEvidenceId && obtained.includes(selectedEvidenceId)
      ? selectedEvidenceId
      : obtained.find((eid) => {
          const it = catalogueItem(bundle, eid);
          return it?.renderer === 'document' || it?.renderer === 'table';
        }) ??
        obtained[0] ??
        null;

  if (!id) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Document</p>
        <p>
          No evidence held yet. Stand up groups and request items from the docket; advance time to
          receive results.
        </p>
      </div>
    );
  }

  const item = catalogueItem(bundle, id);
  if (!item) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>Document</p>
        <p>Unknown evidence id.</p>
      </div>
    );
  }

  if (!obtained.includes(id)) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{item.title}</p>
        <p>This item is not yet in hand. Request it and advance time to the ETA.</p>
      </div>
    );
  }

  const paper = presentDocument(item, bundle, state.calendarDay);
  const party = Boolean(paper.watermark) || paper.stamp === 'PARTY';

  return (
    <div className={styles.wrap}>
      <article className={styles.paper} aria-label={paper.title}>
        {paper.stamp ? (
          <div className={`${styles.stamp} ${party ? styles.stampParty : ''}`}>{paper.stamp}</div>
        ) : null}
        {paper.watermark ? <div className={styles.watermark}>{paper.watermark}</div> : null}
        <p className={styles.eyebrow}>{paper.eyebrow}</p>
        <h2 className={styles.title}>{paper.title}</h2>
        {paper.body.map((para) => (
          <p key={para.slice(0, 48)} className={styles.body}>
            {para}
          </p>
        ))}
        <p className={styles.meta}>{paper.meta}</p>
      </article>
    </div>
  );
}
