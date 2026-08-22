/** Party submission evidence stubs. */

import type { EvidenceItem } from '../types';

export function buildPartyItems(): EvidenceItem[] {
  return [
    {
      id: 'parties.operator_submission',
      group: 'parties',
      title: 'Operator party submission',
      cost: 1,
      leadTime: 30,
      prereqs: [],
      partyCooperationMin: 40,
      partyId: 'operator',
      reveals: [],
      renderer: 'document',
    },
  ];
}
