/** Shared id and catalogue enums for the case engine. */

export type ArchetypeId = 'A1' | 'A2' | 'A3' | 'A4';

export type TemplateId =
  | 'T1'
  | 'T2'
  | 'T3'
  | 'T4'
  | 'T5'
  | 'T6'
  | 'T7'
  | 'T8'
  | 'T9'
  | 'T10'
  | 'T11'
  | 'T12';

export type Difficulty = 'standard' | 'senior';

/** Investigative groups the IIC can stand up (B2.11 / DOMAIN). */
export type InvestigativeGroup =
  | 'operations'
  | 'humanPerformance'
  | 'structures'
  | 'systems'
  | 'powerplants'
  | 'maintenanceRecords'
  | 'atc'
  | 'meteorology'
  | 'survivalFactors'
  | 'recorders'
  | 'witnesses'
  | 'parties'
  | 'process';

/** How an evidence item is rendered in the docket workspace. */
export type EvidenceRenderer =
  | 'document'
  | 'table'
  | 'trace'
  | 'map'
  | 'transcript'
  | 'photo-set'
  | 'dialogue';

export type OpsPart = '91' | '135' | '121';

export type CrewRole = 'pic' | 'sic' | 'cabin';

export type TimeOfDay = 'day' | 'night' | 'dawn' | 'dusk';

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';
