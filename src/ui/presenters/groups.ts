import type { InvestigativeGroup } from '../../engine';

export const GROUP_ORDER: InvestigativeGroup[] = [
  'operations',
  'humanPerformance',
  'structures',
  'systems',
  'powerplants',
  'maintenanceRecords',
  'atc',
  'meteorology',
  'survivalFactors',
  'recorders',
  'witnesses',
  'parties',
];

export const GROUP_LABEL: Record<InvestigativeGroup, string> = {
  operations: 'Operations',
  humanPerformance: 'Human Performance',
  structures: 'Structures',
  systems: 'Systems',
  powerplants: 'Powerplants',
  maintenanceRecords: 'Maintenance Records',
  atc: 'ATC',
  meteorology: 'Meteorology',
  survivalFactors: 'Survival Factors',
  recorders: 'Recorders',
  witnesses: 'Witnesses',
  parties: 'Parties',
  process: 'Process',
};
