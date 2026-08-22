import styles from './StripChart.module.css';

const ALT = [4200, 4153, 4105, 4058, 4010, 3963, 3915, 3868, 3820, 3773, 3725, 3678, 3631, 3583, 3536, 3488, 3441, 3393, 3346, 3298, 3251, 3203, 3156, 3108, 3061, 3014, 2966, 2919, 2871, 2824, 2776, 2729, 2681, 2634, 2586, 2539, 2492, 2444, 2397, 2349, 2302, 2254, 2207, 2159, 2112, 1400, 1336, 1271, 1207, 1143, 1079, 1014, 950, 886, 821, 757, 693, 629, 564, 500];
const IAS = [138.0, 137.8, 137.6, 137.4, 137.2, 137.0, 136.8, 136.6, 136.4, 136.2, 136.0, 135.8, 135.6, 135.4, 135.2, 134.9, 134.7, 134.5, 134.3, 134.1, 133.9, 133.7, 133.5, 133.3, 133.1, 132.9, 132.7, 132.5, 132.3, 132.1, 131.9, 131.7, 131.5, 131.3, 131.1, 130.9, 130.7, 130.5, 130.3, 130.1, 129.9, 129.7, 129.5, 129.3, 129.1, 126.0, 124.7, 123.4, 122.1, 120.9, 119.6, 118.3, 117.0, 115.7, 114.4, 113.1, 111.9, 110.6, 109.3, 108.0];

function seriesPath(
  values: number[],
  min: number,
  max: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
): string {
  return values
    .map((v, i) => {
      const x = x0 + (i / (values.length - 1)) * w;
      const y = y0 + h - ((v - min) / (max - min)) * h;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

export function StripChart() {
  const altPath = seriesPath(ALT, 400, 4400, 48, 24, 520, 100);
  const iasPath = seriesPath(IAS, 90, 150, 48, 150, 520, 100);
  const eventX = 48 + (45 / 59) * 520;

  return (
    <section className={styles.chart} aria-label="FDR strip chart placeholder">
      <div className={styles.header}>
        <p className={styles.eyebrow}>FDR · Lightweight · Placeholder</p>
        <span className={styles.cursorReadout}>T+00:04:12 · flap 35</span>
      </div>
      <div className={styles.svgWrap}>
        <svg className={styles.svg} viewBox="0 0 600 280" role="img" aria-label="Altitude and airspeed strips">
          <rect x="0" y="0" width="600" height="280" fill="var(--ink-900)" />
          {[24, 74, 124].map((y) => (
            <line key={y} x1="48" x2="568" y1={y} y2={y} stroke="var(--ink-600)" strokeOpacity="0.5" strokeWidth="1" />
          ))}
          {[150, 200, 250].map((y) => (
            <line key={y} x1="48" x2="568" y1={y} y2={y} stroke="var(--ink-600)" strokeOpacity="0.5" strokeWidth="1" />
          ))}
          <text x="8" y="30" fill="var(--ink-300)" fontFamily="var(--font-mono)" fontSize="10">
            ALT
          </text>
          <text x="8" y="156" fill="var(--ink-300)" fontFamily="var(--font-mono)" fontSize="10">
            IAS
          </text>
          <path d={altPath} fill="none" stroke="var(--series-1)" strokeWidth="1.5" />
          <path d={iasPath} fill="none" stroke="var(--series-2)" strokeWidth="1.5" strokeDasharray="4 3" />
          <line x1={eventX} x2={eventX} y1="16" y2="264" stroke="var(--orange-500)" strokeWidth="1" />
          <circle cx={eventX} cy="124" r="3" fill="var(--orange-500)" />
          <text x={eventX + 6} y="22" fill="var(--orange-500)" fontFamily="var(--font-mono)" fontSize="10">
            EVT
          </text>
        </svg>
      </div>
    </section>
  );
}
