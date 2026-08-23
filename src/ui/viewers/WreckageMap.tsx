import { useMemo, useState } from 'react';
import { presentWreckage, type DebrisPoint } from '../presenters/wreckage';
import { useCaseStore } from '../store/caseStore';
import styles from './WreckageMap.module.css';

const GROUP_COLOR: Record<DebrisPoint['group'], string> = {
  structures: 'var(--series-1)',
  systems: 'var(--series-2)',
  powerplants: 'var(--series-4)',
  recorders: 'var(--orange-500)',
  other: 'var(--ink-300)',
};

export function WreckageMap() {
  const bundle = useCaseStore((s) => s.bundle);
  const state = useCaseStore((s) => s.state);
  const [hover, setHover] = useState<DebrisPoint | null>(null);
  const model = useMemo(() => (bundle ? presentWreckage(bundle) : null), [bundle]);

  const unlocked = Boolean(state?.obtainedEvidenceIds.includes('structures.wreckage_map'));

  if (!bundle || !state || !model) {
    return <div className={styles.empty}>Start a case to view the wreckage map.</div>;
  }
  if (!unlocked) {
    return (
      <div className={styles.empty}>
        <p className={styles.eyebrow}>Wreckage map</p>
        <p className={styles.lock}>
          Request Structures → Wreckage distribution map and advance time to unlock.
        </p>
      </div>
    );
  }

  const contours = [18, 28, 38, 48, 58, 68, 78];

  return (
    <section className={styles.panel} aria-label="Wreckage distribution map">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Wreckage · {bundle.world.environment.airportName}</p>
        <span className={styles.meta}>
          {model.steep ? 'Steep / compact field' : 'Shallow field'} · scale {model.scaleFt} ft · hdg{' '}
          {model.heading.toFixed(0)}°
        </span>
      </div>
      <div className={styles.mapWrap} style={{ position: 'relative' }}>
        <svg className={styles.svg} viewBox="0 0 100 100" role="img" aria-label="Wreckage map">
          <rect width="100" height="100" fill="var(--ink-900)" />
          {contours.map((r) => (
            <ellipse
              key={r}
              cx="50"
              cy="55"
              rx={r}
              ry={r * 0.62}
              fill="none"
              stroke="var(--ink-700)"
              strokeWidth="0.4"
            />
          ))}
          <ellipse
            cx={model.fireZone.cx}
            cy={model.fireZone.cy}
            rx={model.fireZone.rx}
            ry={model.fireZone.ry}
            fill="var(--crit)"
            fillOpacity="0.25"
            stroke="var(--crit)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1"
          />
          {/* North arrow */}
          <g transform="translate(88,12)">
            <line x1="0" y1="8" x2="0" y2="-6" stroke="var(--ink-100)" strokeWidth="0.6" />
            <polygon points="0,-8 1.6,-4 -1.6,-4" fill="var(--ink-100)" />
            <text x="0" y="12" textAnchor="middle" fill="var(--ink-300)" fontSize="3" fontFamily="var(--font-mono)">
              N
            </text>
          </g>
          {/* Scale bar */}
          <g transform="translate(8,92)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="var(--ink-100)" strokeWidth="0.6" />
            <text x="0" y="-2" fill="var(--ink-300)" fontSize="2.8" fontFamily="var(--font-mono)">
              {Math.round(model.scaleFt / 4)} ft
            </text>
          </g>
          {/* PIP */}
          <circle cx={model.pip.x} cy={model.pip.y} r="1.4" fill="var(--orange-500)" />
          <text
            x={model.pip.x + 2}
            y={model.pip.y - 2}
            fill="var(--orange-300)"
            fontSize="2.8"
            fontFamily="var(--font-mono)"
          >
            PIP
          </text>
          {model.debris.map((d) => (
            <circle
              key={d.id}
              cx={d.x}
              cy={d.y}
              r="1.1"
              fill={GROUP_COLOR[d.group]}
              onMouseEnter={() => setHover(d)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: 'pointer' }}
            >
              <title>{d.label}</title>
            </circle>
          ))}
        </svg>
        {hover ? (
          <div className={styles.card} style={{ left: 12, bottom: 12 }}>
            <strong>{hover.label}</strong>
            <div>{hover.group}</div>
          </div>
        ) : null}
      </div>
      <div className={styles.legend}>
        {Object.entries(GROUP_COLOR).map(([g, c]) => (
          <span key={g}>
            <span className={styles.swatch} style={{ background: c }} />
            {g}
          </span>
        ))}
      </div>
    </section>
  );
}
