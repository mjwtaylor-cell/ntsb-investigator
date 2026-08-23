import { useMemo } from 'react';
import { presentWeather } from '../presenters/weather';
import { useCaseStore } from '../store/caseStore';
import styles from './WeatherPanel.module.css';

export function WeatherPanel() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const wx = useMemo(() => (bundle ? presentWeather(bundle) : null), [bundle]);
  const unlocked = Boolean(
    state &&
      (state.obtainedEvidenceIds.includes('wx.metar_taf_package') ||
        state.obtainedEvidenceIds.includes('wx.icing_airmet_pirep')),
  );

  if (!bundle || !state || !wx) {
    return <div className={styles.empty}>Start a case to view weather.</div>;
  }
  if (!unlocked) {
    return (
      <div className={styles.empty}>
        <p className={styles.eyebrow}>Weather</p>
        <p className={styles.lock}>
          Request the METAR/TAF package (or icing AIRMET) and advance time to unlock.
        </p>
      </div>
    );
  }

  return (
    <section className={styles.panel} aria-label="Weather panel">
      <p className={styles.eyebrow}>Meteorology · {bundle.world.environment.airportName}</p>
      <div className={styles.block}>
        <p className={styles.title}>Decoded</p>
        <p className={styles.body}>{wx.summary}</p>
      </div>
      {wx.icingBand ? <div className={styles.band}>{wx.icingBand}</div> : null}
      <div className={styles.block}>
        <p className={styles.title}>METAR (raw)</p>
        <pre className={styles.raw}>{wx.metar}</pre>
      </div>
      <div className={styles.block}>
        <p className={styles.title}>TAF (raw)</p>
        <pre className={styles.raw}>{wx.taf}</pre>
      </div>
      <div className={styles.block}>
        <p className={styles.title}>Sounding</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ALT ft</th>
              <th>TEMP C</th>
              <th>DEW C</th>
              <th>WIND kt</th>
            </tr>
          </thead>
          <tbody>
            {wx.sounding.map((r) => (
              <tr key={r.altFt}>
                <td>{r.altFt}</td>
                <td>{r.tempC}</td>
                <td>{r.dewC}</td>
                <td>{r.windKt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
