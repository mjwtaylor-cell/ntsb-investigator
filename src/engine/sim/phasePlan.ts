/**
 * Phase durations derive from archetype performance + generated leg distance.
 * Target flight length 25–120 min (≤7200 samples); RTO/takeoff scripts are short
 * by design and omit climb.
 */

import type { Archetype } from '../archetypes';
import type { FailureModeTemplate, FlightPhase } from '../templates';
import {
  HARD_CAP_SAMPLES,
  MAX_FLIGHT_SEC,
  MIN_FLIGHT_SEC,
  type PhasePlan,
} from './flightTypes';

function maxHookAt(template: FailureModeTemplate, phase: FlightPhase): number {
  let max = 0;
  for (const h of template.flightScriptHooks) {
    if (h.phase === phase) max = Math.max(max, h.atSeconds ?? 0);
  }
  return max;
}

function phaseFloor(template: FailureModeTemplate, phase: FlightPhase, fallback: number): number {
  return Math.max(fallback, maxHookAt(template, phase) + 1);
}

/** Rejected-takeoff / high-power takeoff failure: short, no climb. */
function isRtoScript(template: FailureModeTemplate): boolean {
  return template.id === 'T6';
}

/**
 * Derive a leg distance (nm) from the archetype envelope, then size phases so
 * total airborne/scripted time lands in 25–120 min (RTO excepted).
 */
export function buildPhasePlan(
  archetype: Archetype,
  template: FailureModeTemplate,
  elevFt: number,
  legNm: number,
): PhasePlan[] {
  const cruise = archetype.performance.cruiseSpeedKts;
  const climbFpm = archetype.performance.climbRateFpm.typical;
  const descentFpm = archetype.performance.descentRateFpm.typical;
  const cruiseAlt = Math.min(
    elevFt + Math.max(4000, Math.round(legNm * 8)),
    archetype.performance.serviceCeilingFt - 2000,
  );
  const vRef = archetype.performance.vSpeeds.vRef ?? 90;

  if (isRtoScript(template)) {
    const takeoffDur = phaseFloor(template, 'takeoff', 40);
    const landingDur = phaseFloor(template, 'landing', 25);
    return [
      {
        phase: 'preflight',
        durationSec: phaseFloor(template, 'preflight', 45),
        altStart: elevFt,
        altEnd: elevFt,
        ias: 0,
        vs: 0,
        flap: 0,
        gear: 'DOWN',
      },
      {
        phase: 'taxi',
        durationSec: phaseFloor(template, 'taxi', 60),
        altStart: elevFt,
        altEnd: elevFt,
        ias: 15,
        vs: 0,
        flap: 5,
        gear: 'DOWN',
      },
      {
        phase: 'takeoff',
        durationSec: takeoffDur,
        altStart: elevFt,
        altEnd: elevFt + 80,
        ias: Math.min(160, cruise * 0.75),
        vs: 200,
        flap: 5,
        gear: 'DOWN',
      },
      // RTO: no climb — abort rolls straight into stop / overrun (landing phase).
      {
        phase: 'landing',
        durationSec: landingDur,
        altStart: elevFt + 80,
        altEnd: elevFt,
        ias: 80,
        vs: -100,
        flap: 15,
        gear: 'DOWN',
      },
    ];
  }

  const climbAlt = Math.max(500, cruiseAlt - elevFt);
  const climbSec = phaseFloor(
    template,
    'climb',
    Math.max(180, Math.round((climbAlt / climbFpm) * 60)),
  );
  const descentAlt = Math.max(500, cruiseAlt - (elevFt + 2500));
  const descentSec = phaseFloor(
    template,
    'descent',
    Math.max(120, Math.round((descentAlt / descentFpm) * 60)),
  );

  const climbNm = (cruise * 0.85 * climbSec) / 3600;
  const descentNm = (cruise * 0.9 * descentSec) / 3600;
  const cruiseNm = Math.max(15, legNm - climbNm - descentNm);
  let cruiseSec = phaseFloor(
    template,
    'cruise',
    Math.round((cruiseNm / cruise) * 3600),
  );

  const preflight = phaseFloor(template, 'preflight', 60);
  const taxi = phaseFloor(template, 'taxi', 90);
  const takeoff = phaseFloor(template, 'takeoff', 50);
  const approach = phaseFloor(template, 'approach', 150);
  const landing = phaseFloor(template, 'landing', 30);

  let total =
    preflight + taxi + takeoff + climbSec + cruiseSec + descentSec + approach + landing;

  // Stretch cruise (then approach) to hit the 25-minute floor.
  if (total < MIN_FLIGHT_SEC) {
    cruiseSec += MIN_FLIGHT_SEC - total;
    total = MIN_FLIGHT_SEC;
  }

  // Trim cruise if over 120 min or hard sample cap.
  const maxTotal = Math.min(MAX_FLIGHT_SEC, HARD_CAP_SAMPLES);
  if (total > maxTotal) {
    const over = total - maxTotal;
    const reducible = Math.max(0, cruiseSec - phaseFloor(template, 'cruise', 60));
    const cut = Math.min(over, reducible);
    cruiseSec -= cut;
    total -= cut;
  }

  return [
    {
      phase: 'preflight',
      durationSec: preflight,
      altStart: elevFt,
      altEnd: elevFt,
      ias: 0,
      vs: 0,
      flap: 0,
      gear: 'DOWN',
    },
    {
      phase: 'taxi',
      durationSec: taxi,
      altStart: elevFt,
      altEnd: elevFt,
      ias: 12,
      vs: 0,
      flap: 0,
      gear: 'DOWN',
    },
    {
      phase: 'takeoff',
      durationSec: takeoff,
      altStart: elevFt,
      altEnd: elevFt + 800,
      ias: Math.min(120, cruise * 0.7),
      vs: climbFpm,
      flap: 10,
      gear: 'TRANSIT',
    },
    {
      phase: 'climb',
      durationSec: climbSec,
      altStart: elevFt + 800,
      altEnd: cruiseAlt,
      ias: cruise * 0.85,
      vs: climbFpm,
      flap: 0,
      gear: 'UP',
    },
    {
      phase: 'cruise',
      durationSec: cruiseSec,
      altStart: cruiseAlt,
      altEnd: cruiseAlt,
      ias: cruise,
      vs: 0,
      flap: 0,
      gear: 'UP',
    },
    {
      phase: 'descent',
      durationSec: descentSec,
      altStart: cruiseAlt,
      altEnd: elevFt + 2500,
      ias: cruise * 0.9,
      vs: -descentFpm,
      flap: 0,
      gear: 'UP',
    },
    {
      phase: 'approach',
      durationSec: approach,
      altStart: elevFt + 2500,
      altEnd: elevFt + 400,
      ias: vRef,
      vs: -600,
      flap: 25,
      gear: 'DOWN',
    },
    {
      phase: 'landing',
      durationSec: landing,
      altStart: elevFt + 400,
      altEnd: elevFt,
      ias: vRef - 5,
      vs: -400,
      flap: 35,
      gear: 'DOWN',
    },
  ];
}
