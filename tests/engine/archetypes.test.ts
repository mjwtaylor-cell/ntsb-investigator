import { describe, it, expect } from 'vitest';
import {
  ARCHETYPE_IDS,
  ARCHETYPES,
  getArchetype,
  listArchetypes,
  A1_MERIDIAN,
  A2_KESTREL,
  A3_AURORA,
  A4_HALCYON,
} from '../../src/engine/archetypes';

describe('archetypes A1–A4', () => {
  it('registry loads all four fictional types', () => {
    expect(ARCHETYPE_IDS).toEqual(['A1', 'A2', 'A3', 'A4']);
    expect(listArchetypes()).toHaveLength(4);
    expect(getArchetype('A1').name).toBe('Meridian M-4');
    expect(getArchetype('A2').name).toBe('Kestrel 19');
    expect(getArchetype('A3').name).toBe('Aurora RJ-75');
    expect(getArchetype('A4').name).toBe('Halcyon 220');
  });

  it('A1 Meridian M-4: no FDR/CVR; NVM + portable GPS + ADS-B', () => {
    const r = A1_MERIDIAN.recorders;
    expect(r.fdr).toBe('none');
    expect(r.cvr).toBe(false);
    expect(r.engineMonitorNvm).toBe(true);
    expect(r.portableGps).toBe(true);
    expect(r.adsBOut).toBe(true);
    expect(r.qar).toBe(false);
    expect(r.acars).toBe(false);
    expect(A1_MERIDIAN.opsPart).toBe('91');
    expect(A1_MERIDIAN.crewFlight).toBe(1);
    expect(A1_MERIDIAN.systems.antiIce).toBe('carbHeat');
  });

  it('A2 Kestrel 19: CVR + lightweight FDR + ADS-B; boots', () => {
    const r = A2_KESTREL.recorders;
    expect(r.fdr).toBe('lightweight');
    expect(r.cvr).toBe(true);
    expect(r.adsBOut).toBe(true);
    expect(r.qar).toBe(false);
    expect(r.acars).toBe(false);
    expect(A2_KESTREL.opsPart).toBe('135');
    expect(A2_KESTREL.crewFlight).toBe(2);
    expect(A2_KESTREL.systems.antiIce).toBe('boots');
    expect(A2_KESTREL.seats).toBe(19);
  });

  it('A3 Aurora RJ-75: full FDR + CVR + ADS-B + QAR', () => {
    const r = A3_AURORA.recorders;
    expect(r.fdr).toBe('full');
    expect(r.cvr).toBe(true);
    expect(r.adsBOut).toBe(true);
    expect(r.qar).toBe(true);
    expect(r.acars).toBe(false);
    expect(A3_AURORA.opsPart).toBe('121');
    expect(A3_AURORA.crewFlight).toBe(2);
    expect(A3_AURORA.crewCabin).toBe(2);
    expect(A3_AURORA.seats).toBe(75);
  });

  it('A4 Halcyon 220: full FDR + CVR + ADS-B + QAR + ACARS', () => {
    const r = A4_HALCYON.recorders;
    expect(r.fdr).toBe('full');
    expect(r.cvr).toBe(true);
    expect(r.adsBOut).toBe(true);
    expect(r.qar).toBe(true);
    expect(r.acars).toBe(true);
    expect(A4_HALCYON.opsPart).toBe('121');
    expect(A4_HALCYON.crewFlight).toBe(2);
    expect(A4_HALCYON.crewCabin).toBe(4);
    expect(A4_HALCYON.seats).toBe(160);
  });

  it('every archetype exposes systems + performance envelope stubs', () => {
    for (const id of ARCHETYPE_IDS) {
      const a = ARCHETYPES[id];
      expect(a.systems.engines).toBeGreaterThan(0);
      expect(a.performance.cruiseSpeedKts).toBeGreaterThan(0);
      expect(a.performance.typicalRouteNm.min).toBeLessThanOrEqual(
        a.performance.typicalRouteNm.max,
      );
      expect(a.performance.serviceCeilingFt).toBeGreaterThan(0);
    }
  });
});
