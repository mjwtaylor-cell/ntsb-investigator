import { useMemo, useRef, useCallback } from 'react';
import { presentFdr } from '../presenters/fdr';
import { presentCvr, formatTranscriptStamp } from '../presenters/transcripts';
import { formatSeconds } from '../presenters/format';
import { useCaseStore } from '../store/caseStore';
import styles from './FdrStrips.module.css';

function pathFor(
  values: number[],
  min: number,
  max: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
): string {
  if (values.length === 0) return '';
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = x0 + (i / Math.max(1, values.length - 1)) * w;
      const y = y0 + h - ((v - min) / span) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
}

export function FdrStrips() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const cursorT = useCaseStore((s) => s.fdrCursorT);
  const setFdrCursor = useCaseStore((s) => s.setFdrCursor);
  const svgRef = useRef<SVGSVGElement>(null);

  const unlocked = Boolean(
    state &&
      (state.obtainedEvidenceIds.includes('fdr.readout') ||
        state.obtainedEvidenceIds.includes('nvm.engine_monitor')),
  );

  const series = useMemo(() => (bundle ? presentFdr(bundle) : null), [bundle]);
  const cvr = useMemo(() => (bundle ? presentCvr(bundle) : []), [bundle]);

  const onScrub = useCallback(
    (clientX: number) => {
      if (!series || !svgRef.current || series.t_s.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const x0 = 56;
      const x1 = 760;
      const rel = ((clientX - rect.left) / rect.width) * 800;
      const u = Math.max(0, Math.min(1, (rel - x0) / (x1 - x0)));
      const idx = Math.round(u * (series.t_s.length - 1));
      const t = series.t_s[idx];
      if (t !== undefined) setFdrCursor(t);
    },
    [series, setFdrCursor],
  );

  if (!bundle || !state || !series) {
    return <div className={styles.empty}>Start a case to view FDR strips.</div>;
  }

  if (!unlocked) {
    return (
      <div className={styles.empty}>
        <p className={styles.eyebrow}>FDR strips</p>
        <p className={styles.lock}>
          Lightweight FDR readout not yet obtained. Recover recorders, request the readout, and
          advance time to unlock strips.
        </p>
      </div>
    );
  }

  const W = 800;
  const H = 420;
  const lanes = [
    { key: 'ALT', values: series.altitude_ft, color: 'var(--series-1)', dash: undefined as string | undefined },
    { key: 'IAS', values: series.ias_kt, color: 'var(--series-2)', dash: '4 3' },
    { key: 'PITCH', values: series.pitch_deg, color: 'var(--series-3)', dash: undefined },
    { key: 'FLAP', values: series.flap_deg, color: 'var(--series-4)', dash: '2 2' },
  ];
  const laneH = 88;
  const x0 = 56;
  const plotW = 704;

  const t0 = series.t_s[0] ?? 0;
  const t1 = series.t_s[series.t_s.length - 1] ?? 1;
  const cursorU = (cursorT - t0) / (t1 - t0 || 1);
  const cursorX = x0 + Math.max(0, Math.min(1, cursorU)) * plotW;

  const cursorIdx = series.t_s.reduce(
    (best, t, i) => (Math.abs(t - cursorT) < Math.abs(series.t_s[best]! - cursorT) ? i : best),
    0,
  );
  const alt = series.altitude_ft[cursorIdx];
  const ias = series.ias_kt[cursorIdx];
  const pitch = series.pitch_deg[cursorIdx];
  const flap = series.flap_deg[cursorIdx];

  const trackPts = bundle.flight.samples.filter((_, i) => i % 20 === 0);
  const lats = trackPts.map((s) => s.lat_deg);
  const lons = trackPts.map((s) => s.lon_deg);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);

  return (
    <section className={styles.panel} aria-label="FDR strip charts">
      <div className={styles.header}>
        <p className={styles.eyebrow}>FDR · Lightweight · Seed {bundle.truth.seed}</p>
        <span className={styles.readout}>
          T+{formatSeconds(cursorT)} · ALT {alt?.toFixed(0)} ft · IAS {ias?.toFixed(0)} kt · PITCH{' '}
          {pitch?.toFixed(1)}° · FLAP {flap?.toFixed(0)}°
        </span>
      </div>
      <div className={styles.body}>
        <div
          className={styles.strips}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            onScrub(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons === 1) onScrub(e.clientX);
          }}
          role="slider"
          aria-valuemin={t0}
          aria-valuemax={t1}
          aria-valuenow={cursorT}
          aria-label="FDR time cursor"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setFdrCursor(Math.max(t0, cursorT - 1));
            if (e.key === 'ArrowRight') setFdrCursor(Math.min(t1, cursorT + 1));
          }}
        >
          <svg ref={svgRef} className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img">
            <rect x="0" y="0" width={W} height={H} fill="var(--ink-900)" />
            {lanes.map((lane, li) => {
              const y0 = 16 + li * (laneH + 12);
              const vals = lane.values;
              const min = Math.min(...vals);
              const max = Math.max(...vals);
              const pad = (max - min) * 0.08 || 1;
              return (
                <g key={lane.key}>
                  {[0, 0.5, 1].map((f) => (
                    <line
                      key={f}
                      x1={x0}
                      x2={x0 + plotW}
                      y1={y0 + laneH * f}
                      y2={y0 + laneH * f}
                      stroke="var(--ink-600)"
                      strokeOpacity="0.5"
                      strokeWidth="1"
                    />
                  ))}
                  <text
                    x="8"
                    y={y0 + 12}
                    fill="var(--ink-300)"
                    fontFamily="var(--font-mono)"
                    fontSize="10"
                  >
                    {lane.key}
                  </text>
                  <path
                    d={pathFor(vals, min - pad, max + pad, x0, y0, plotW, laneH)}
                    fill="none"
                    stroke={lane.color}
                    strokeWidth="1.5"
                    strokeDasharray={lane.dash}
                  />
                </g>
              );
            })}
            {series.events.map((ev) => {
              const u = (ev.t_s - t0) / (t1 - t0 || 1);
              const x = x0 + u * plotW;
              return (
                <g key={`${ev.eventId}-${ev.t_s}`}>
                  <line x1={x} x2={x} y1="8" y2={H - 8} stroke="var(--orange-500)" strokeWidth="1" />
                  <text
                    x={x + 4}
                    y="14"
                    fill="var(--orange-500)"
                    fontFamily="var(--font-mono)"
                    fontSize="9"
                  >
                    {ev.eventId}
                  </text>
                </g>
              );
            })}
            <line x1={cursorX} x2={cursorX} y1="4" y2={H - 4} stroke="var(--ink-100)" strokeWidth="1" />
          </svg>
        </div>
        <aside className={styles.side}>
          <div className={styles.sideBlock}>
            <p className={styles.sideTitle}>CVR (synced)</p>
            {cvr.map((line) => (
              <p
                key={`${line.t_s}-${line.text}`}
                className={`${styles.line} ${line.kind === 'sound' ? styles.sound : ''} ${
                  Math.abs(line.t_s - cursorT) < 2 ? styles.sound : ''
                }`}
              >
                {formatTranscriptStamp(line.t_s)} {line.speaker}: {line.text}
              </p>
            ))}
          </div>
          <div className={styles.sideBlock}>
            <p className={styles.sideTitle}>Track</p>
            <svg className={styles.trackSvg} viewBox="0 0 260 120" aria-hidden="true">
              <rect width="260" height="120" fill="var(--ink-800)" />
              <polyline
                fill="none"
                stroke="var(--series-1)"
                strokeWidth="1.5"
                points={trackPts
                  .map((s) => {
                    const x = ((s.lon_deg - minLon) / (maxLon - minLon || 1)) * 240 + 10;
                    const y = 110 - ((s.lat_deg - minLat) / (maxLat - minLat || 1)) * 100;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ')}
              />
            </svg>
          </div>
        </aside>
      </div>
    </section>
  );
}
