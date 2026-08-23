/**
 * Phase-scripted kinematics at 1 Hz (not 6-DOF).
 */

import { createRng } from '../rng';
import type { Archetype } from '../archetypes';
import type { FailureModeTemplate } from '../templates';
import type { World } from '../types';
import { airportLatLon, integrateLatLon, type LatLon } from './track';
import { HARD_CAP_SAMPLES, type FlightSample, type FlightTrack } from './flightTypes';
import { buildPhasePlan } from './phasePlan';

export type { FlightSample, FlightTrack } from './flightTypes';

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
