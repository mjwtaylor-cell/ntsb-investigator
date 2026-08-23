/** Interview subject registry with knowledge models. */

import type { InterviewSubject } from './types';

export const INTERVIEW_SUBJECTS: InterviewSubject[] = [
  {
    id: 'dispatcher',
    displayName: 'Dispatcher',
    role: 'Flight release / dispatch',
    group: 'operations',
    baseEvidenceId: 'ops.dispatcher_interview',
    knowledge: {
      admits: ['weather_on_release', 'no_icing_remark', 'mel_awareness'],
      deflects: ['crew_decision', 'company_policy'],
      bias: 'operator',
    },
    topics: [
      {
        id: 'release_weather',
        label: 'Weather on the release',
        unlockAnyOf: [],
        cost: 0.5,
      },
      {
        id: 'deferred_boot',
        label: 'Deferred de-ice boot item',
        unlockAnyOf: ['maint.mel_deferred_list', 'maint.mel_procedures_audit'],
        cost: 0.5,
      },
      {
        id: 'company_icing_policy',
        label: 'Company icing dispatch policy',
        unlockAnyOf: ['ops.dispatch_release'],
        cost: 0.5,
      },
    ],
  },
  {
    id: 'director_ops',
    displayName: 'Director of Operations',
    role: 'Operator DO',
    group: 'operations',
    baseEvidenceId: 'ops.records_general',
    knowledge: {
      admits: ['schedule_pressure'],
      deflects: ['maintenance_culture', 'crew_decision', 'mel_process'],
      bias: 'operator',
    },
    topics: [
      {
        id: 'schedule',
        label: 'Schedule and turn times',
        unlockAnyOf: [],
        cost: 0.5,
      },
      {
        id: 'mel_oversight',
        label: 'MEL oversight responsibility',
        unlockAnyOf: ['maint.mel_deferred_list', 'maint.work_orders_boots'],
        cost: 1,
      },
    ],
  },
  {
    id: 'mechanic',
    displayName: 'Line mechanic',
    role: 'Maintenance',
    group: 'maintenanceRecords',
    baseEvidenceId: 'maint.work_orders_boots',
    knowledge: {
      admits: ['parts_delay', 'repeat_deferral_paperwork'],
      deflects: ['management_direction'],
      bias: 'self',
    },
    topics: [
      {
        id: 'boot_deferral',
        label: 'Boot deferral paperwork',
        unlockAnyOf: ['maint.mel_deferred_list'],
        cost: 0.5,
      },
      {
        id: 'parts_status',
        label: 'Parts and functional check',
        unlockAnyOf: ['maint.work_orders_boots'],
        cost: 0.5,
      },
    ],
  },
  {
    id: 'controller',
    displayName: 'Approach controller',
    role: 'ATC',
    group: 'atc',
    baseEvidenceId: 'atc.tower_transcript',
    knowledge: {
      admits: ['radio_calls', 'no_emergency_declared'],
      deflects: [],
      bias: 'neutral',
    },
    topics: [
      {
        id: 'final_calls',
        label: 'Calls on final',
        unlockAnyOf: [],
        cost: 0.5,
      },
    ],
  },
  {
    id: 'ground_witness',
    displayName: 'Ground observer',
    role: 'Witness',
    group: 'witnesses',
    baseEvidenceId: 'witness.ground_observers',
    knowledge: {
      admits: ['sound_description', 'lights_seen'],
      deflects: [],
      bias: 'uncertain',
    },
    topics: [
      {
        id: 'what_heard',
        label: 'What you heard',
        unlockAnyOf: [],
        cost: 0.5,
      },
      {
        id: 'what_seen',
        label: 'What you saw',
        unlockAnyOf: ['witness.ground_observers'],
        cost: 0.5,
      },
    ],
  },
  {
    id: 'chief_pilot',
    displayName: 'Chief pilot',
    role: 'Training / standards',
    group: 'humanPerformance',
    baseEvidenceId: 'ops.training_records',
    knowledge: {
      admits: ['syllabus_gap'],
      deflects: ['crew_decision'],
      bias: 'operator',
    },
    topics: [
      {
        id: 'icing_training',
        label: 'Icing recognition training',
        unlockAnyOf: ['ops.training_records'],
        cost: 0.5,
      },
      {
        id: 'approach_standards',
        label: 'Unstabilised approach standards',
        unlockAnyOf: ['cvr.transcript', 'fdr.readout'],
        cost: 0.5,
      },
    ],
  },
];

export function subjectById(id: string): InterviewSubject | undefined {
  return INTERVIEW_SUBJECTS.find((s) => s.id === id);
}
