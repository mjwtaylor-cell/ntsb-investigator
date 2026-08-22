import { describe, it, expect } from 'vitest';
import { generateWorld, generateTruth } from '../../src/engine/generate';
import { simulateFlight, integrateLatLon } from '../../src/engine/sim';

describe('flight sim + track', () => {
  it('integrates lat/lon forward', () => {
    const a = { lat_deg: 40, lon_deg: -100 };
    const b = integrateLatLon(a, 120, 90, 3600);
    expect(b.lon_deg).toBeGreaterThan(a.lon_deg);
    expect(Math.abs(b.lat_deg - a.lat_deg)).toBeLessThan(1);
  });

  it('seed 1174 produces 1 Hz samples with template events', () => {
    const { world, archetype } = generateWorld('1174');
    const { template } = generateTruth('1174', archetype, 'standard');
    const track = simulateFlight('1174', world, archetype, template);
    expect(track.samples.length).toBeGreaterThan(50);
    expect(track.samples.length).toBeLessThanOrEqual(7200);
    expect(track.events.length).toBeGreaterThan(0);
    // 1 Hz: consecutive t_s differ by 1
    expect(track.samples[1]!.t_s - track.samples[0]!.t_s).toBe(1);
    expect(track.samples[0]).toHaveProperty('pressureAltitude_ft');
    expect(track.samples[0]).toHaveProperty('lat_deg');
  });

  it('same seed → identical track', () => {
    const { world, archetype } = generateWorld('55');
    const { template } = generateTruth('55', archetype, 'standard');
    const a = simulateFlight('55', world, archetype, template);
    const b = simulateFlight('55', world, archetype, template);
    expect(a).toEqual(b);
  });
});
