/** Records / maintenance evidence supplements. */

import type { CaseTruth, EvidenceItem } from '../types';

export function buildRecordsItems(truth: CaseTruth): EvidenceItem[] {
  const items: EvidenceItem[] = [
    {
      id: 'ops.records_general',
      group: 'operations',
      title: 'General operator / crew records package',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    },
  ];
  // Surface MEL-related noise when icing / maintenance templates are in play
  if (truth.templateId === 'T4' || truth.nodes.some((n) => n.id.includes('mel'))) {
    items.push({
      id: 'maint.records_index',
      group: 'maintenanceRecords',
      title: 'Maintenance records index',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      reveals: [],
      renderer: 'table',
    });
  }
  return items;
}
