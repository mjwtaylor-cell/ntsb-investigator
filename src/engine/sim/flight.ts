/**
 * Phase-scripted kinematics at 1 Hz (not 6-DOF).
 * Phase durations derive from archetype performance + generated leg distance.
 * Target flight length 25–120 min (≤7200 samples); RTO/takeoff scripts are short
 * by design and omit climb.
 */

import { createRng } from '../rng';
import type { Archetype } from '../archetypes';
import type { FailureModeTemplate, FlightPhase } from '../templates';
import type { World } from '../types';
import { airportLatLon, integrateLatLon, type LatLon } from './track';

/** One 1 Hz sample using DOMAIN.md FDR key names. */
export interface FlightSample {
  t_s: number;
  phase: FlightPhase;
  pressureAltitude_ft: number;
  radioAltitude_ft: number;
  ias_kt: number;
  groundspeed_kt: number;
  heading_deg: number;
  track_deg: number;
  pitch_deg: number;
  roll_deg: number;
  verticalSpeed_fpm: number;
  nz_g: number;
  lat_deg: number;
  lon_deg: number;
  windDir_deg: number;
  windSpeed_kt: number;
  fuelFlow_pph: number;
  fuelQty_lb: number;
  flap_deg: number;
  gear: 'UP' | 'DOWN' | 'TRANSIT';
  /** Injected template event id, if any, at this second. */
  eventId?: string;
}

export interface FlightTrack {
  samples: FlightSample[];
  events: { t_s: number; eventId: string; description: string; phase: FlightPhase }[];
  impactIndex: number;
  /** Planned enroute distance used to size the profile (nm). */
  legNm: number;
}

interface PhasePlan {
  phase: FlightPhase;
  durationSec: number;
  altStart: number;
  altEnd: number;
  ias: number;
  vs: number;
  flap: number;
  gear: 'UP' | 'DOWN' | 'TRANSIT';
}

const MIN_FLIGHT_SEC = 25 * 60;
const MAX_FLIGHT_SEC = 120 * 60;
const HARD_CAP_SAMPLES = 7200;

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
function buildPhasePlan(
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

function eventMap(
  template: FailureModeTemplate,
): Map<string, { eventId: string; description: string; atSeconds: number }[]> {
  const map = new Map<
    string,
    { eventId: string; description: string; atSeconds: number }[]
  >();
  for (const h of template.flightScriptHooks) {
    const list = map.get(h.phase) ?? [];
    list.push({
      eventId: h.eventId,
      description: h.description,
      atSeconds: h.atSeconds ?? 0,
    });
    map.set(h.phase, list);
  }
  return map;
}

/**
 * Simulate a full flight track at 1 Hz from archetype + template hooks.
 * Caps at 7200 samples per DESIGN B2.5.
 */
export function simulateFlight(
  seed: string,
  world: World,
  archetype: Archetype,
  template: FailureModeTemplate,
): FlightTrack {
  const rng = createRng(seed).fork('flight');
  const elev = world.environment.elevationFt;
  const { min, max } = archetype.performance.typicalRouteNm;
  const legNm = min + rng.next() * Math.max(0, max - min);
  const plans = buildPhasePlan(archetype, template, elev, legNm);
  const hooks = eventMap(template);
  const windDir = rng.nextInt(0, 359);
  const windSpeed = rng.nextInt(3, 22);

  let pos: LatLon = airportLatLon(world.environment.airportId);
  pos = {
    lat_deg: pos.lat_deg + (rng.next() - 0.5) * 0.01,
    lon_deg: pos.lon_deg + (rng.next() - 0.5) * 0.01,
  };

  const heading0 = rng.nextInt(0, 359);
  let heading = heading0;
  let fuelQty =
    archetype.performance.fuelBurnPerHour *
    (archetype.performance.fuelBurnUnit === 'gph' ? 6 : 1) *
    rng.nextInt(2, 5);

  const samples: FlightSample[] = [];
  const events: FlightTrack['events'] = [];
  let t = 0;
  let impactIndex = -1;

  for (const plan of plans) {
    const phaseHooks = hooks.get(plan.phase) ?? [];
    for (let s = 0; s < plan.durationSec; s++) {
      const frac = plan.durationSec <= 1 ? 1 : s / (plan.durationSec - 1);
      const alt = plan.altStart + (plan.altEnd - plan.altStart) * frac;
      const vs = plan.vs;
      let roll = (rng.next() - 0.5) * 2;
      let pitch = vs > 100 ? 8 : vs < -100 ? -4 : 2;
      let ias = plan.ias;
      let eventId: string | undefined;

      for (const h of phaseHooks) {
        const fireAt = Math.min(h.atSeconds, plan.durationSec - 1);
        if (s === fireAt) {
          eventId = h.eventId;
          events.push({
            t_s: t,
            eventId: h.eventId,
            description: h.description,
            phase: plan.phase,
          });
          if (h.eventId.includes('spiral') || h.eventId.includes('disorient')) {
            roll = 45 + rng.next() * 40;
            pitch = -15 - rng.next() * 20;
            ias = plan.ias + 40 + rng.next() * 60;
          } else if (h.eventId.includes('stall') || h.eventId.includes('tailplane')) {
            pitch = -18;
            roll = (rng.next() - 0.5) * 30;
            ias = Math.max(60, plan.ias - 25);
          } else if (h.eventId.includes('power_loss') || h.eventId.includes('fuel')) {
            ias = Math.max(70, plan.ias - 30);
            pitch = -6;
          } else if (
            h.eventId.includes('uncontained') ||
            h.eventId.includes('engine_fail') ||
            h.eventId.includes('disk')
          ) {
            heading = (heading + 20) % 360;
            roll = 15 + rng.next() * 20;
            ias = plan.ias - 10;
          } else if (h.eventId.includes('impact') || h.eventId.includes('overrun')) {
            impactIndex = t;
            ias = Math.max(0, ias - 20);
            pitch = -20;
          }
        }
      }

      const track = heading + (rng.next() - 0.5) * 0.5;
      const gs = Math.max(0, ias - windSpeed * 0.2);
      if (gs > 5) {
        pos = integrateLatLon(pos, gs, track, 1);
        heading = (heading + (rng.next() - 0.5) * 0.3 + 360) % 360;
      }

      const burnPerSec =
        (archetype.performance.fuelBurnPerHour *
          (archetype.performance.fuelBurnUnit === 'gph' ? 6 : 1)) /
        3600;
      fuelQty = Math.max(0, fuelQty - burnPerSec);

      samples.push({
        t_s: t,
        phase: plan.phase,
        pressureAltitude_ft: Math.round(alt),
        radioAltitude_ft: Math.max(0, Math.round(alt - elev)),
        ias_kt: Math.round(ias * 10) / 10,
        groundspeed_kt: Math.round(gs * 10) / 10,
        heading_deg: Math.round(heading * 10) / 10,
        track_deg: Math.round(track * 10) / 10,
        pitch_deg: Math.round(pitch * 10) / 10,
        roll_deg: Math.round(roll * 10) / 10,
        verticalSpeed_fpm: Math.round(vs),
        nz_g: Math.round((1 + Math.abs(roll) / 90 + Math.abs(pitch) / 60) * 100) / 100,
        lat_deg: pos.lat_deg,
        lon_deg: pos.lon_deg,
        windDir_deg: windDir,
        windSpeed_kt: windSpeed,
        fuelFlow_pph: Math.round(burnPerSec * 3600 * 10) / 10,
        fuelQty_lb: Math.round(fuelQty * 10) / 10,
        flap_deg: plan.flap,
        gear: plan.gear,
        eventId,
      });

      t += 1;
      if (t >= HARD_CAP_SAMPLES) break;
      if (impactIndex >= 0 && t > impactIndex + 2) break;
    }
    if (t >= HARD_CAP_SAMPLES || (impactIndex >= 0 && t > impactIndex + 2)) break;
  }

  if (impactIndex < 0) impactIndex = Math.max(0, samples.length - 1);
  return { samples, events, impactIndex, legNm: Math.round(legNm * 10) / 10 };
}
