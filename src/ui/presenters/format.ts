/** Shared UI formatting helpers (no engine imports of DOM). */

export function formatDay(day: number): string {
  return `Day ${day}`;
}

export function formatBudgetPct(remaining: number, total: number): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
}

export function formatSeconds(t: number): string {
  const s = Math.max(0, Math.floor(t));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function formatInvDays(n: number): string {
  return `${n.toFixed(1)} inv-d`;
}
