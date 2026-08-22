/** A2 — Kestrel 19: fictional twin turboprop commuter (Part 135). */

import type { Archetype } from './schema';

export const A2_KESTREL: Archetype = {
  id: 'A2',
  name: 'Kestrel 19',
  summary: 'Twin turboprop commuter, 19 seats, pneumatic de-ice boots — Part 135.',
  seats: 19,
  opsPart: '135',
  crewFlight: 2,
  crewCabin: 0,
  systems: {
    antiIce: 'boots',
    pressurization: true,
    autopilotLevel: 2,
    egpwsTaws: true,
    retractableGear: true,
    propellers: 2,
    engines: 2,
    engineKind: 'turboprop',
  },
  performance: {
    vSpeeds: {
      vs0: 78,
      vs1: 88,
      vx: 105,
      vy: 120,
      vRef: 105,
      vFe: 155,
      vMo: 245,
    },
    climbRateFpm: { typical: 1600, max: 2200 },
    descentRateFpm: { typical: 1000, max: 2500 },
    fuelBurnPerHour: 650,
    fuelBurnUnit: 'pph',
    cruiseSpeedKts: 255,
    typicalRouteNm: { min: 120, max: 650 },
    serviceCeilingFt: 25000,
  },
  recorders: {
    fdr: 'lightweight',
    cvr: true,
    adsBOut: true,
    qar: false,
    acars: false,
    engineMonitorNvm: false,
    portableGps: false,
  },
};
