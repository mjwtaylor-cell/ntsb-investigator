/** A4 — Halcyon 220: fictional narrowbody (Part 121). */

import type { Archetype } from './schema';

export const A4_HALCYON: Archetype = {
  id: 'A4',
  name: 'Halcyon 220',
  summary: 'Narrowbody, 160 seats — Part 121 mainline / high-density regional.',
  seats: 160,
  opsPart: '121',
  crewFlight: 2,
  crewCabin: 4,
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
      vs0: 115,
      vs1: 128,
      vRef: 138,
      vMo: 340,
    },
    climbRateFpm: { typical: 2800, max: 4500 },
    descentRateFpm: { typical: 2000, max: 4000 },
    fuelBurnPerHour: 5200,
    fuelBurnUnit: 'pph',
    cruiseSpeedKts: 450,
    typicalRouteNm: { min: 300, max: 2500 },
    serviceCeilingFt: 41000,
  },
  recorders: {
    fdr: 'full',
    cvr: true,
    adsBOut: true,
    qar: true,
    acars: true,
    engineMonitorNvm: false,
    portableGps: false,
  },
};
