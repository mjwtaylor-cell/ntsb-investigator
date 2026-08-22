/** A3 — Aurora RJ-75: fictional regional jet (Part 121). */

import type { Archetype } from './schema';

export const A3_AURORA: Archetype = {
  id: 'A3',
  name: 'Aurora RJ-75',
  summary: 'Regional jet, 75 seats — Part 121 scheduled service.',
  seats: 75,
  opsPart: '121',
  crewFlight: 2,
  crewCabin: 2,
  systems: {
    antiIce: 'bleedWing',
    pressurization: true,
    autopilotLevel: 3,
    egpwsTaws: true,
    retractableGear: true,
    propellers: 0,
    engines: 2,
    engineKind: 'turbofan',
  },
  performance: {
    vSpeeds: {
      vs0: 105,
      vs1: 118,
      vRef: 128,
      vMo: 320,
    },
    climbRateFpm: { typical: 2500, max: 4000 },
    descentRateFpm: { typical: 1800, max: 3500 },
    fuelBurnPerHour: 3200,
    fuelBurnUnit: 'pph',
    cruiseSpeedKts: 420,
    typicalRouteNm: { min: 200, max: 1200 },
    serviceCeilingFt: 37000,
  },
  recorders: {
    fdr: 'full',
    cvr: true,
    adsBOut: true,
    qar: true,
    acars: false,
    engineMonitorNvm: false,
    portableGps: false,
  },
};
