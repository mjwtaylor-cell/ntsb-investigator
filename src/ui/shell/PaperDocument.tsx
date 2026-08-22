import styles from './PaperDocument.module.css';

export function PaperDocument() {
  return (
    <article className={styles.paper} aria-label="Preliminary factual report excerpt">
      <div className={styles.stamp}>Recovered</div>
      <p className={styles.eyebrow}>Maintenance Records · MEL Item</p>
      <h2 className={styles.title}>Deferred Item — De-ice Boots, Outboard RH</h2>
      <p className={styles.body}>
        Category C deferral entered on the night of departure. The work order date on the second
        deferral matches the first entry. Dispatch release carries no icing remark. This document is
        placeholder content for the Docket visual identity; the engine will supply real derived text
        in a later phase.
      </p>
      <p className={styles.meta}>CASE PLACEHOLDER · DAY 9 · GROUP: MAINTENANCE RECORDS</p>
    </article>
  );
}
