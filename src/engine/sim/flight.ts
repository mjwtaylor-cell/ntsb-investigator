/**
 * Phase-scripted kinematics at 1 Hz (not 6-DOF).
 * Injects template FlightScriptHook events into the sample stream.
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

function buildPhasePlan(
  archetype: Archetype,
  template: FailureModeTemplate,
  elevFt: number,
): PhasePlan[] {
  const cruise = archetype.performance.cruiseSpeedKts;
  const climb = archetype.performance.climbRateFpm.typical;
  const cruiseAlt = Math.min(
    elevFt + 6000,
    archetype.performance.serviceCeilingFt - 2000,
  );

  // Shorten / reshape by template family
  const isTakeoffFail = template.id === 'T6';
  const isApproachFail = template.id === 'T4' || template.id === 'T1';

  if (isTakeoffFail) {
    return [
      { phase: 'preflight', durationSec: 30, altStart: elevFt, altEnd: elevFt, ias: 0, vs: 0, flap: 0, gear: 'DOWN' },
      { phase: 'taxi', durationSec: 40, altStart: elevFt, altEnd: elevFt, ias: 15, vs: 0, flap: 0, gear: 'DOWN' },
      { phase: 'takeoff', durationSec: 45, altStart: elevFt, altEnd: elevFt + 400, ias: 140, vs: 1200, flap: 5, gear: 'TRANSIT' },
      { phase: 'climb', durationSec: 25, altStart: elevFt + 400, altEnd: elevFt + 800, ias: 160, vs: 800, flap: 0, gear: 'UP' },
    ];
  }

  const plans: PhasePlan[] = [
    { phase: 'preflight', durationSec: 20, altStart: elevFt, altEnd: elevFt, ias: 0, vs: 0, flap: 0, gear: 'DOWN' },
    { phase: 'taxi', durationSec: 30, altStart: elevFt, altEnd: elevFt, ias: 12, vs: 0, flap: 0, gear: 'DOWN' },
    { phase: 'takeoff', durationSec: 50, altStart: elevFt, altEnd: elevFt + 800, ias: Math.min(120, cruise * 0.7), vs: climb, flap: 10, gear: 'TRANSIT' },
    { phase: 'climb', durationSec: 180, altStart: elevFt + 800, altEnd: cruiseAlt, ias: cruise * 0.85, vs: climb, flap: 0, gear: 'UP' },
    { phase: 'cruise', durationSec: isApproachFail ? 240 : 300, altStart: cruiseAlt, altEnd: cruiseAlt, ias: cruise, vs: 0, flap: 0, gear: 'UP' },
    { phase: 'descent', durationSec: 150, altStart: cruiseAlt, altEnd: elevFt + 2500, ias: cruise * 0.9, vs: -archetype.performance.descentRateFpm.typical, flap: 0, gear: 'UP' },
    { phase: 'approach', durationSec: 120, altStart: elevFt + 2500, altEnd: elevFt + 400, ias: archetype.performance.vSpeeds.vRef ?? 90, vs: -600, flap: 25, gear: 'DOWN' },
    { phase: 'landing', durationSec: 20, altStart: elevFt + 400, altEnd: elevFt, ias: (archetype.performance.vSpeeds.vRef ?? 90) - 5, vs: -400, flap: 35, gear: 'DOWN' },
  ];
  return plans;
}

function eventMap(template: FailureModeTemplate): Map<string, { eventId: string; description: string; atSeconds: number }[]> {
  const map = new Map<string, { eventId: string; description: string; atSeconds: number }[]>();
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
  const plans = buildPhasePlan(archetype, template, elev);
  const hooks = eventMap(template);
  const windDir = rng.nextInt(0, 359);
  const windSpeed = rng.nextInt(3, 22);

  let pos: LatLon = airportLatLon(world.environment.airportId);
  // Offset slightly so taxi isn't exactly on the pin
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
      const alt =
        plan.altStart + (plan.altEnd - plan.altStart) * frac;
      const vs = plan.vs;
      let roll = (rng.next() - 0.5) * 2;
      let pitch = vs > 100 ? 8 : vs < -100 ? -4 : 2;
      let ias = plan.ias;
      let eventId: string | undefined;

      for (const h of phaseHooks) {
        if (s === Math.min(h.atSeconds, plan.durationSec - 1)) {
          eventId = h.eventId;
          events.push({
            t_s: t,
            eventId: h.eventId,
            description: h.description,
            phase: plan.phase,
          });
          // Kinematic reactions to named events
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
      if (t >= 7200) break;
      if (impactIndex >= 0 && t > impactIndex + 2) break;
    }
    if (t >= 7200 || (impactIndex >= 0 && t > impactIndex + 2)) break;
  }

  if (impactIndex < 0) impactIndex = Math.max(0, samples.length - 1);
  return { samples, events, impactIndex };
}

