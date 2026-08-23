import type { EvidenceItem, GeneratedCase } from '../../engine';
import { createRng } from '../../engine/rng';
import { witnessStatements } from '../../engine/evidence/witnesses';
import { GROUP_LABEL } from './groups';

export interface PaperContent {
  eyebrow: string;
  title: string;
  body: string[];
  stamp?: string;
  meta: string;
  watermark?: string;
}

/** NTSB-style docket id from seed + accident state (never expose seed in footer). */
export function docketNumber(bundle: GeneratedCase): string {
  const state = bundle.world.environment.state.toUpperCase();
  const regionByState: Record<string, string> = {
    TX: 'CEN',
    OK: 'CEN',
    KS: 'CEN',
    NE: 'CEN',
    SD: 'CEN',
    ND: 'CEN',
    MN: 'CEN',
    IA: 'CEN',
    MO: 'CEN',
    AR: 'CEN',
    LA: 'CEN',
    IL: 'CEN',
    WI: 'CEN',
    CO: 'CEN',
    NM: 'CEN',
    WY: 'CEN',
    MT: 'CEN',
    CA: 'WPR',
    OR: 'WPR',
    WA: 'WPR',
    NV: 'WPR',
    AZ: 'WPR',
    UT: 'WPR',
    ID: 'WPR',
    HI: 'WPR',
    AK: 'ANC',
    NY: 'ERA',
    NJ: 'ERA',
    PA: 'ERA',
    MA: 'ERA',
    CT: 'ERA',
    RI: 'ERA',
    NH: 'ERA',
    VT: 'ERA',
    ME: 'ERA',
    MD: 'ERA',
    DE: 'ERA',
    VA: 'ERA',
    WV: 'ERA',
    DC: 'ERA',
    FL: 'ASO',
    GA: 'ASO',
    AL: 'ASO',
    MS: 'ASO',
    SC: 'ASO',
    NC: 'ASO',
    TN: 'ASO',
    KY: 'ASO',
    PR: 'ASO',
  };
  const region = regionByState[state] ?? 'CEN';
  const rng = createRng(bundle.truth.seed).fork('docket');
  const seq = rng.nextInt(100, 999);
  // 26 = investigation year band for this build era; FA = fatal/serious aviation.
  return `${region}26FA${seq}`;
}

function paperMeta(bundle: GeneratedCase, item: EvidenceItem, calendarDay: number): string {
  return `${docketNumber(bundle)} · DAY ${calendarDay} · GROUP: ${GROUP_LABEL[item.group].toUpperCase()}`;
}

function crewLine(bundle: GeneratedCase): string {
  return bundle.world.crew
    .map((c) => `${c.displayName} (${c.role.toUpperCase()}, ${c.totalHours} TT / ${c.typeHours} type)`)
    .join('; ');
}

/** Deterministic 72-hour sleep/duty/wake table — no CRM or fatigue indices. */
function seventyTwoHourTable(bundle: GeneratedCase): string[] {
  const lines: string[] = [
    '72-hour history worksheets for flight crew (local times, day before accident = D−1).',
    'Name | Role | D−3 wake | D−3 duty | D−2 sleep | D−1 wake | D−1 duty end | Accident-day report',
  ];
  const flightCrew = bundle.world.crew.filter((c) => c.role !== 'cabin');
  for (const c of flightCrew) {
    const rng = createRng(bundle.truth.seed).fork(`hp72:${c.id}`);
    const wakeH = rng.nextInt(5, 8);
    const dutyStart = wakeH + 1;
    const dutyEnd = dutyStart + rng.nextInt(8, 12);
    const sleepH = rng.nextInt(21, 24);
    const reportH = rng.nextInt(5, 7);
    const pad = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;
    lines.push(
      `${c.displayName} | ${c.role.toUpperCase()} | ${pad(wakeH)} | ${pad(dutyStart)}–${pad(Math.min(dutyEnd, 23))} | ${pad(sleepH)} | ${pad(wakeH)} | ${pad(Math.min(dutyEnd, 23))} | ${pad(reportH)}`,
    );
  }
  lines.push(
    'Self-reported sleep quality: adequate to fair. No medication or illness entries on the worksheets.',
  );
  lines.push('Correlate with FDR/CVR and operator duty records before assigning causal weight to fatigue.');
  return lines;
}

export function presentDocument(
  item: EvidenceItem,
  bundle: GeneratedCase,
  calendarDay: number,
): PaperContent {
  const w = bundle.world;
  const eyebrow = `${GROUP_LABEL[item.group]} · ${item.title}`;
  const meta = paperMeta(bundle, item, calendarDay);
  const mel = w.maintenance.melItems;

  switch (item.id) {
    case 'maint.mel_deferred_list':
    case 'maint.mel_procedures_audit': {
      const lines =
        mel.length === 0
          ? ['No open MEL items listed for this aircraft.']
          : mel.map((m) => {
              const flag = m.improperRepeat ? ' IMPROPER REPEAT flagged.' : '';
              return `${m.description}. Category ${m.category}, deferred day ${m.deferredDay} of allowable window.${flag}`;
            });
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          `Operator ${w.operator.name} (Part ${w.operator.opsPart}). Aircraft under review.`,
          ...lines,
          item.id === 'maint.mel_procedures_audit'
            ? 'Audit note: compare work-order dates against MEL entry dates for reuse or overlapping deferrals.'
            : 'Dispatch must verify icing capability against open deferred items before release into known icing.',
        ],
        meta,
      };
    }
    case 'maint.work_orders_boots': {
      const boot = mel.find((m) => m.id.includes('boot')) ?? mel[0];
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          boot
            ? `Work order chain for ${boot.description}. First deferral entered; a subsequent entry reuses overlapping paperwork.`
            : 'Work orders for pneumatic de-ice boot repairs.',
          'Technician remarks cite parts delay. Second deferral date field matches the first entry.',
          'No functional check flight annotated after the second deferral.',
        ],
        meta,
      };
    }
    case 'ops.dispatch_release':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          `Release for ${w.operator.name} into ${w.environment.airportName}, ${w.environment.state}.`,
          `Weather on release: ${w.environment.weatherSummary}. Time of day: ${w.environment.timeOfDay}.`,
          mel.some((m) => m.description.toLowerCase().includes('boot') || m.description.toLowerCase().includes('ice'))
            ? 'Icing remark on release: none. Open de-ice deferred item was not annotated on the release package.'
            : 'No open anti-ice MEL items annotated.',
          `Crew: ${crewLine(bundle)}.`,
        ],
        meta,
      };
    case 'ops.training_records':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          `Crew training package for ${w.operator.name}.`,
          crewLine(bundle),
          'Syllabus review: icing recognition module present for Part 135; tailplane-icing recognition not explicitly checked off for this crew in the last 12 months.',
        ],
        meta,
      };
    case 'ops.records_general':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          `General records for ${w.operator.name} (Part ${w.operator.opsPart}).`,
          w.operator.schedulePressure > 0.65
            ? 'Schedule notes show repeated late-day rotations and short turn times in the prior 30 days.'
            : 'Schedule notes show routine turn times without unusual late-day pressure.',
          w.operator.maintenanceCulture < 0.45
            ? 'Maintenance correspondence references parts delays and deferred write-ups awaiting materials.'
            : 'Maintenance correspondence is routine; no systemic backlog called out in the sampled month.',
          `Occupants: ${w.occupants.passengers} pax + ${w.occupants.crewFlight + w.occupants.crewCabin} crew · fatal ${w.occupants.fatalities} · serious ${w.occupants.seriousInjuries} · minor ${w.occupants.minorInjuries}.`,
        ],
        meta,
      };
    case 'hp.72hour_history':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: seventyTwoHourTable(bundle),
        meta,
      };
    case 'wx.metar_taf_package':
    case 'wx.icing_airmet_pirep':
      return {
        eyebrow,
        title: item.title,
        stamp: 'OBTAINED',
        body: [
          `Site ${w.environment.airportName} (${w.environment.state}), elevation ${w.environment.elevationFt} ft, runway ${w.environment.runway}.`,
          `Observed: ${w.environment.weatherSummary}. Terrain: ${w.environment.terrain}.`,
          bundle.truth.templateId === 'T4'
            ? 'Icing band indicated approximately 2,000–6,000 ft MSL along the arrival. Freezing drizzle reported in the terminal area.'
            : 'Upper-air and surface package attached; no singular icing signature required by this template.',
        ],
        meta,
      };
    case 'parties.operator_submission':
      return {
        eyebrow,
        title: item.title,
        stamp: 'PARTY',
        watermark: 'PARTY SUBMISSION',
        body: [
          `${w.operator.name} party submission attributes the outcome primarily to crew failure to maintain airspeed on final.`,
          'Submission minimises maintenance deferral practice and dispatch weather annotation. Treat as advocacy, not fact.',
        ],
        meta,
      };
    case 'recorders.recovery':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          'Recorders recovered from the wreckage field and transferred under chain of custody.',
          'CVR and lightweight FDR (where equipped) show impact damage consistent with a steep, compact field. Readout pending lab.',
        ],
        meta,
      };
    case 'witness.ground_observers': {
      const statements = witnessStatements(bundle.truth.seed);
      return {
        eyebrow,
        title: item.title,
        stamp: 'CANVASS',
        body: [
          'Ground observer canvass near the arrival path.',
          ...statements.map((s, i) => `Witness ${i + 1}: "${s}"`),
          'Reliability varies; acoustic descriptions may reflect prop surge rather than engine failure.',
        ],
        meta,
      };
    }
    default:
      return {
        eyebrow,
        title: item.title,
        stamp: 'HELD',
        body: [
          `${item.title}.`,
          'Factual package held pending group chairman review. Cross-check with complementary docket items before drawing conclusions.',
          w.maintenance.flags.length
            ? `Maintenance flags noted in related records: ${w.maintenance.flags.join('; ')}.`
            : 'No additional maintenance flags on the stub sheet.',
        ],
        meta,
      };
  }
}
