import styles from './HandbookPanel.module.css';

/** Compact IIC handbook — process cues only (no case truth). */
export function HandbookPanel() {
  return (
    <section className={styles.panel} aria-label="IIC handbook">
      <p className={styles.eyebrow}>IIC handbook</p>
      <h2 className={styles.title}>Go Team field card</h2>
      <p className={styles.p}>
        You are the Investigator-in-Charge. Stand up only the groups you need — each active group
        burns investigator-days every calendar day.
      </p>
      <h3 className={styles.h}>On-scene</h3>
      <ul className={styles.ul}>
        <li>Document wreckage and recover recorders / NVM before weather moves the site.</li>
        <li>Secure perishable evidence (weather package, security video, witness canvass).</li>
        <li>Interview while memories are fresh; topics unlock as records arrive.</li>
      </ul>
      <h3 className={styles.h}>Analysis</h3>
      <ul className={styles.ul}>
        <li>Lab flows: teardown → fractography; performance study → simulator session.</li>
        <li>Party submissions are advocacy. Subpoena speeds records but lowers cooperation.</li>
        <li>Pressure cards are not optional forever — respond before silence erodes confidence.</li>
      </ul>
      <h3 className={styles.h}>Urgent recommendations</h3>
      <p className={styles.p}>
        Issue an urgent rec only when a latent condition or precondition is supported by held
        evidence. Wrong urgent recs damage public confidence.
      </p>
      <h3 className={styles.h}>Board meeting</h3>
      <p className={styles.p}>
        Findings, causal chain, and recommendations ship in a later phase. Until then, build the
        docket and keep the confidence meter honest.
      </p>
    </section>
  );
}
