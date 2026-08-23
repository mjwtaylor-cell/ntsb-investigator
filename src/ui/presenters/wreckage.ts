import type { GeneratedCase } from '../../engine';
import { createRng } from '../../engine';

export interface DebrisPoint {
  id: string;
  x: number;
  y: number;
  group: 'structures' | 'systems' | 'powerplants' | 'recorders' | 'other';
  label: string;
}

export interface WreckageModel {
  pip: { x: number; y: number };
  fireZone: { cx: number; cy: number; rx: number; ry: number };
  debris: DebrisPoint[];
  separation: { x: number; y: number; label: string }[];
  scaleFt: number;
  heading: number;
  steep: boolean;
}

export function presentWreckage(bundle: GeneratedCase): WreckageModel {
  const rng = createRng(bundle.truth.seed).fork('wreckage-ui');
  const impact = bundle.flight.samples[bundle.flight.impactIndex];
  const heading = impact?.heading_deg ?? 180;
  const steep = (impact?.verticalSpeed_fpm ?? -2000) < -1500;
  const pip = { x: 50, y: steep ? 58 : 52 };

  const debris: DebrisPoint[] = [];
  const labels: { group: DebrisPoint['group']; label: string }[] = [
    { group: 'powerplants', label: 'LH prop / engine' },
    { group: 'powerplants', label: 'RH prop / engine' },
    { group: 'structures', label: 'Cockpit section' },
    { group: 'structures', label: 'Empennage' },
    { group: 'systems', label: 'Flap jackscrew (LH)' },
    { group: 'systems', label: 'Flap jackscrew (RH)' },
    { group: 'recorders', label: 'CVR/FDR bay' },
    { group: 'other', label: 'Cabin debris' },
  ];
  for (const L of labels) {
    const angle = rng.next() * Math.PI * 2;
    const dist = steep ? 4 + rng.next() * 14 : 8 + rng.next() * 28;
    debris.push({
      id: L.label,
      x: pip.x + Math.cos(angle) * dist,
      y: pip.y + Math.sin(angle) * dist * 0.7,
      group: L.group,
      label: L.label,
    });
  }

  return {
    pip,
    fireZone: { cx: pip.x + 2, cy: pip.y - 1, rx: steep ? 10 : 16, ry: steep ? 7 : 11 },
    debris,
    separation: steep
      ? []
      : [{ x: pip.x - 18, y: pip.y - 12, label: 'In-flight separation (none indicated)' }],
    scaleFt: steep ? 120 : 240,
    heading,
    steep,
  };
}
