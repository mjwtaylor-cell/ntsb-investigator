import { describe, it, expect } from 'vitest';
import {
  NODE_TIER_WEIGHT,
  type Action,
  type ArchetypeId,
  type CaseBundle,
  type CaseState,
  type CaseTruth,
  type CausalNode,
  type Difficulty,
  type EvidenceItem,
  type Par,
  type ScoreReport,
  type TemplateId,
  type World,
} from '../../src/engine/types';

const ARCHETYPES: ArchetypeId[] = ['A1', 'A2', 'A3', 'A4'];
const TEMPLATES: TemplateId[] = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
];
const DIFFICULTIES: Difficulty[] = ['standard', 'senior'];

function sampleNode(): CausalNode {
  return {
    id: 'latent.example',
    kind: 'latentCondition',
    tier: 'contributing',
    text: 'Maintenance control allowed an improper repeat deferral.',
    revealedBy: [
      { evidenceId: 'records.mel_list', strength: 0.9 },
      { evidenceId: 'records.work_orders', strength: 0.7 },
    ],
  };
}

function sampleEvidence(): EvidenceItem {
  return {
    id: 'records.mel_list',
    group: 'maintenanceRecords',
    title: 'MEL / deferred-items list',
    cost: 1,
    leadTime: 2,
    prereqs: [],
    reveals: [{ nodeId: 'latent.example', strength: 0.9 }],
    decay: undefined,
    renderer: 'document',
  };
}

function sampleWorld(): World {
  return {
    seed: 'smoke',
    archetypeId: 'A2',
    operator: {
      id: 'op.northline',
      name: 'Northline Commuter',
      opsPart: '135',
      sopQuality: 0.6,
      schedulePressure: 0.7,
      maintenanceCulture: 0.45,
    },
    crew: [
      {
        id: 'crew.pic',
        role: 'pic',
        displayName: 'Capt. R. Hale',
        certificates: ['ATP', 'type.Kestrel19'],
        totalHours: 6200,
        typeHours: 1100,
        recencyDays: 4,
        crmQuality: 0.7,
        survived: false,
      },
    ],
    maintenance: {
      recentWorkOrders: ['wo-441'],
      adSbComplianceNotes: [],
      melItems: [
        {
          id: 'mel.boots_rh',
          description: 'De-ice boots, outboard RH',
          category: 'C',
          deferredDay: 9,
          improperRepeat: true,
        },
      ],
      flags: [],
    },
    environment: {
      airportId: 'KFXN',
      airportName: 'Foxpine Field',
      state: 'Montana',
      terrain: 'rolling hills',
      runway: '13/31',
      elevationFt: 4120,
      timeOfDay: 'night',
      weatherSummary: 'Freezing drizzle, icing band 2,000–6,000 ft',
    },
    occupants: {
      crewFlight: 2,
      crewCabin: 0,
      passengers: 11,
      fatalities: 9,
      seriousInjuries: 2,
      minorInjuries: 0,
    },
  };
}

function sampleTruth(): CaseTruth {
  return {
    seed: 'smoke',
    archetypeId: 'A2',
    templateId: 'T4',
    difficulty: 'standard',
    nodes: [sampleNode()],
    edges: [],
  };
}

function samplePar(): Par {
  return {
    investigatorDays: 40,
    calendarDays: 120,
    evidenceSet: ['records.mel_list', 'recorders.cvr'],
    expectedBurnPerDay: 1.75,
    evidenceCostSum: 10,
  };
}

function sampleState(): CaseState {
  return {
    seed: 'smoke',
    calendarDay: 0,
    boardDeadlineDay: 270,
    investigatorDaysRemaining: 60,
    investigatorDaysSpent: 0,
    publicConfidence: 70,
    partyCooperation: { operator: 80, manufacturer: 75, faa: 90 },
    activeGroups: ['operations', 'recorders'],
    obtainedEvidenceIds: [],
    securedEvidenceIds: [],
    decayedEvidenceIds: [],
    queue: [],
    actionLog: [],
    findings: [],
    findingEdges: [],
    recommendations: [],
    pressureResolvedIds: [],
    submitted: false,
  };
}

function sampleScore(): ScoreReport {
  return {
    total: 88,
    grade: 'A',
    coverage: 0.9,
    precisionPenalty: 0,
    statement: 16,
    recommendations: 10,
    efficiency: 7,
  };
}

describe('engine types smoke', () => {
  it('exports id unions used by generation', () => {
    expect(ARCHETYPES).toHaveLength(4);
    expect(TEMPLATES).toHaveLength(12);
    expect(DIFFICULTIES).toEqual(['standard', 'senior']);
  });

  it('NODE_TIER_WEIGHT matches B2.9 scoring weights', () => {
    expect(NODE_TIER_WEIGHT.probableCause).toBe(3);
    expect(NODE_TIER_WEIGHT.contributing).toBe(1.5);
    expect(NODE_TIER_WEIGHT.precondition).toBe(1);
    expect(NODE_TIER_WEIGHT.nonCausal).toBe(0);
  });

  it('CaseBundle / EvidenceItem expose cost, leadTime, prereqs, decay, revealedBy', () => {
    const evidence = [sampleEvidence()];
    const perishable: EvidenceItem = {
      ...sampleEvidence(),
      id: 'onscene.security_video',
      group: 'witnesses',
      title: 'Security / doorbell video',
      cost: 0.5,
      leadTime: 1,
      prereqs: ['onscene.witness_canvass'],
      decay: 7,
      reveals: [],
      renderer: 'photo-set',
    };
    evidence.push(perishable);

    const bundle: CaseBundle = {
      truth: sampleTruth(),
      world: sampleWorld(),
      evidence,
      par: samplePar(),
    };

    expect(bundle.truth.nodes[0]?.revealedBy).toHaveLength(2);
    expect(bundle.evidence[0]?.cost).toBe(1);
    expect(bundle.evidence[0]?.leadTime).toBe(2);
    expect(bundle.evidence[0]?.prereqs).toEqual([]);
    expect(bundle.evidence[1]?.decay).toBe(7);
    expect(bundle.par.evidenceSet.length).toBeGreaterThan(0);
  });

  it('Action and CaseState shapes accept core investigation moves', () => {
    const state = sampleState();
    const actions: Action[] = [
      { type: 'standUpGroup', group: 'meteorology' },
      { type: 'requestEvidence', evidenceId: 'records.mel_list' },
      { type: 'secureEvidence', evidenceId: 'onscene.security_video' },
      { type: 'advanceTime', days: 1 },
      { type: 'submitReport' },
    ];
    state.actionLog = actions;
    expect(state.actionLog).toHaveLength(5);
    expect(sampleScore().grade).toBe('A');
  });
});
