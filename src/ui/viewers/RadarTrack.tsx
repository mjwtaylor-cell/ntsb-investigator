import { useMemo } from 'react';
import { useCaseStore } from '../store/caseStore';
import { formatSeconds } from '../presenters/format';
import styles from './RadarTrack.module.css';

export function RadarTrack() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const cursorT = useCaseStore((s) => s.fdrCursorT);

  const unlocked = Boolean(
    state &&
      (state.obtainedEvidenceIds.includes('adsb.track') ||
        state.obtainedEvidenceIds.includes('radar.asr_extract')),
  );

  const samples = useMemo(() => {
    if (!bundle) return [];
    // ASR ~4.6s; ADS-B denser — show every 5th sample for map
    return bundle.flight.samples.filter((_, i) => i % 5 === 0);
  }, [bundle]);

  if (!bundle || !state) {
    return <div className={styles.empty}>Start a case to view radar / ADS-B.</div>;
  }
  if (!unlocked) {
    return (
      <div className={styles.empty}>
        <p className={styles.eyebrow}>Radar / ADS-B</p>
        <p className={styles.lock}>Request ADS-B track or ASR extract and advance time to unlock.</p>
      </div>
    );
  }

  const lats = samples.map((s) => s.lat_deg);
  const lons = samples.map((s) => s.lon_deg);
  const alts = samples.map((s) => s.pressureAltitude_ft);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minAlt = Math.min(...alts);
  const maxAlt = Math.max(...alts);

  const pts = samples.map((s) => {
    const x = ((s.lon_deg - minLon) / (maxLon - minLon || 1)) * 760 + 20;
    const y = 380 - ((s.lat_deg - minLat) / (maxLat - minLat || 1)) * 340;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const ribbon = samples.map((s, i) => {
    const x = 20 + (i / Math.max(1, samples.length - 1)) * 760;
    const y = 90 - ((s.pressureAltitude_ft - minAlt) / (maxAlt - minAlt || 1)) * 70;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const nearest = samples.reduce(
    (best, s) => (Math.abs(s.t_s - cursorT) < Math.abs(best.t_s - cursorT) ? s : best),
    samples[0]!,
  );

  return (
    <section className={styles.panel} aria-label="Radar and ADS-B track">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Radar / ADS-B · {bundle.world.environment.airportName}</p>
        <span className={styles.meta}>
          T+{formatSeconds(nearest.t_s)} · ALT {nearest.pressureAltitude_ft.toFixed(0)} ft · GS{' '}
          {nearest.groundspeed_kt.toFixed(0)} kt
        </span>
      </div>
      <div className={styles.grid}>
        <div className={styles.map}>
          <svg className={styles.svg} viewBox="0 0 800 400" role="img">
            <rect width="800" height="400" fill="var(--ink-900)" />
            {[1, 2, 3].map((i) => (
              <circle
                key={i}
                cx="400"
                cy="200"
                r={40 * i}
                fill="none"
                stroke="var(--ink-700)"
                strokeWidth="1"
              />
            ))}
            <polyline fill="none" stroke="var(--series-1)" strokeWidth="1.5" points={pts.join(' ')} />
            <circle
              cx={((nearest.lon_deg - minLon) / (maxLon - minLon || 1)) * 760 + 20}
              cy={380 - ((nearest.lat_deg - minLat) / (maxLat - minLat || 1)) * 340}
              r="4"
              fill="var(--orange-500)"
            />
          </svg>
        </div>
        <div className={styles.ribbon}>
          <svg className={styles.svg} viewBox="0 0 800 100" aria-label="Altitude ribbon">
            <rect width="800" height="100" fill="var(--ink-900)" />
            <text x="8" y="14" fill="var(--ink-300)" fontFamily="var(--font-mono)" fontSize="10">
              ALT
            </text>
            <polyline fill="none" stroke="var(--series-2)" strokeWidth="1.5" points={ribbon.join(' ')} />
          </svg>
        </div>
      </div>
    </section>
  );
}
