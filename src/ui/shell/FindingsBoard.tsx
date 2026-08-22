import styles from './FindingsBoard.module.css';

export function FindingsBoard() {
  return (
    <div className={styles.board}>
      <p className={styles.eyebrow}>Findings board</p>

      <div className={`${styles.card} ${styles.cardPc}`}>
        <p className={`${styles.tier} ${styles.tierPc}`}>Probable cause</p>
        <p className={styles.text}>
          Tailplane stall on flap extension with ice accretion — placeholder stub.
        </p>
        <p className={styles.cite}>cites: FDR · CVR · wreckage</p>
      </div>

      <div className={styles.card}>
        <p className={`${styles.tier} ${styles.tierContrib}`}>Contributing</p>
        <p className={styles.text}>Improper repeat MEL deferral of RH outboard de-ice boot.</p>
        <p className={styles.cite}>cites: MEL list · work orders</p>
      </div>

      <div className={styles.card}>
        <p className={`${styles.tier} ${styles.tierNote}`}>Notes</p>
        <p className={styles.text}>Fatigue present in 72-hour history — leave Not causal pending FDR review.</p>
      </div>

      <div className={styles.chain} aria-label="Causal chain canvas stub">
        <p className={styles.eyebrow}>Causal chain</p>
        <span className={styles.node}>MEL misuse</span>
        <span className={styles.arrow}>↓ led to</span>
        <span className={styles.node}>Dispatch into icing</span>
        <span className={styles.arrow}>↓ led to</span>
        <span className={`${styles.node} ${styles.nodePc}`}>Tailplane stall</span>
      </div>
    </div>
  );
}
