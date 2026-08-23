import { useEffect, useState } from 'react';
import { lastSeedFromSettings, useCaseStore } from '../store/caseStore';
import styles from './SeedEntry.module.css';

export function SeedEntry() {
  const startCase = useCaseStore((s) => s.startCase);
  const resumeIfSaved = useCaseStore((s) => s.resumeIfSaved);
  const error = useCaseStore((s) => s.error);
  const [seed, setSeed] = useState('1174');
  const [difficulty, setDifficulty] = useState<'standard' | 'senior'>('standard');

  useEffect(() => {
    const last = lastSeedFromSettings();
    if (last) setSeed(last);
  }, []);

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <p className={styles.brand}>NTSB Investigator</p>
        <h1 className={styles.title}>Endless mode</h1>
        <p className={styles.blurb}>
          Enter a seed to generate a deterministic case. Same seed always yields the same truth,
          evidence catalogue, and flight. Autosave resumes from local storage.
        </p>
        <label className={styles.label} htmlFor="seed-input">
          Seed
        </label>
        <input
          id="seed-input"
          className={styles.input}
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') startCase(seed, difficulty);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.btn} ${difficulty === 'standard' ? styles.btnPrimary : ''}`}
            onClick={() => setDifficulty('standard')}
          >
            Standard
          </button>
          <button
            type="button"
            className={`${styles.btn} ${difficulty === 'senior' ? styles.btnPrimary : ''}`}
            onClick={() => setDifficulty('senior')}
          >
            Senior
          </button>
        </div>
        <div className={styles.row}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => startCase(seed, difficulty)}
          >
            Open docket
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => {
              if (!resumeIfSaved(seed.trim())) startCase(seed, difficulty);
            }}
          >
            Resume if saved
          </button>
          <button type="button" className={styles.btn} onClick={() => startCase('1174', 'standard')}>
            Play 1174
          </button>
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <p className={styles.hint}>
          Tip: seed 1174 is the curated Kestrel 19 / T4 icing walkthrough from the design doc.
        </p>
      </div>
    </div>
  );
}
