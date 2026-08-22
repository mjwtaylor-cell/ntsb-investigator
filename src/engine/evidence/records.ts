/** Maintenance / ops records evidence stubs. */

import type { CaseTruth, EvidenceItem } from '../types';

export function buildRecordsItems(truth: CaseTruth): EvidenceItem[] {
  const items: EvidenceItem[] = [
    {
      id: 'ops.training_records',
      group: 'operations',
      title: 'Crew training and proficiency records',
      cost: 1,
      leadTime: 3,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'hp.72hour_history',
      group: 'humanPerformance',
      title: '72-hour history worksheet',
      cost: 2,
      leadTime: 3,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'maint.mel_deferred_list',
      group: 'maintenanceRecords',
      title: 'MEL / deferred-items list',
      cost: 1,
      leadTime: 2,
      prereqs: [],
      reveals: [],
      renderer: 'table',
    },
  ];

  if (truth.templateId === 'T6') {
    items.push({
      id: 'maint.sb_ad_compliance_audit',
      group: 'maintenanceRecords',
      title: 'AD/SB compliance audit (engine)',
      cost: 2,
      leadTime: 5,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    });
  }
  if (truth.templateId === 'T4') {
    items.push({
      id: 'maint.work_orders_boots',
      group: 'maintenanceRecords',
      title: 'Work orders — de-ice boot deferrals',
      cost: 2,
      leadTime: 3,
      prereqs: [],
      reveals: [],
      renderer: 'document',
    });
  }
  return items;
}
