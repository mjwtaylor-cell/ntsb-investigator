import type { EvidenceItem, GeneratedCase } from '../../engine';
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

function crewLine(bundle: GeneratedCase): string {
  return bundle.world.crew
    .map((c) => `${c.displayName} (${c.role.toUpperCase()}, ${c.totalHours} TT / ${c.typeHours} type)`)
    .join('; ');
}

export function presentDocument(
  item: EvidenceItem,
  bundle: GeneratedCase,
  calendarDay: number,
): PaperContent {
  const w = bundle.world;
  const eyebrow = `${GROUP_LABEL[item.group]} · ${item.id}`;
  const meta = `SEED ${bundle.truth.seed} · DAY ${calendarDay} · GROUP: ${GROUP_LABEL[item.group].toUpperCase()}`;
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
          `Operator ${w.operator.name} (Part ${w.operator.opsPart}). Aircraft ${bundle.truth.archetypeId} fleet unit under review.`,
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
          `General records for ${w.operator.name}. SOP quality index ${w.operator.sopQuality.toFixed(2)}; schedule pressure ${w.operator.schedulePressure.toFixed(2)}; maintenance culture ${w.operator.maintenanceCulture.toFixed(2)}.`,
          `Occupants: ${w.occupants.passengers} pax + ${w.occupants.crewFlight + w.occupants.crewCabin} crew · fatal ${w.occupants.fatalities} · serious ${w.occupants.seriousInjuries} · minor ${w.occupants.minorInjuries}.`,
        ],
        meta,
      };
    case 'hp.72hour_history':
      return {
        eyebrow,
        title: item.title,
        stamp: 'RECOVERED',
        body: [
          '72-hour history worksheets for flight crew.',
          ...w.crew
            .filter((c) => c.role !== 'cabin')
            .map(
              (c) =>
                `${c.displayName}: recency ${c.recencyDays} d; CRM index ${c.crmQuality.toFixed(2)}; fatigue indicators present but not conclusive from paperwork alone.`,
            ),
          'Correlate with FDR/CVR before assigning causal weight to fatigue.',
        ],
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
          item.title + '.',
          `Catalogue cost ${item.cost} inv-d · lead ${item.leadTime} d` +
            (item.decay !== undefined ? ` · decays day ${item.decay}` : '') +
            '.',
          item.reveals.length > 0
            ? `Potential reveals: ${item.reveals.map((r) => r.nodeId).join(', ')}.`
            : 'No direct causal reveals annotated on this stub; use with complementary evidence.',
          w.maintenance.flags.length
            ? `Maintenance flags: ${w.maintenance.flags.join('; ')}.`
            : 'No additional maintenance flags.',
        ],
        meta,
      };
  }
}
