/** Party submission evidence stubs (biased advocacy papers). */

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
    {
      id: 'parties.manufacturer_submission',
      group: 'parties',
      title: 'Manufacturer party submission',
      cost: 1,
      leadTime: 35,
      prereqs: [],
      partyCooperationMin: 35,
      partyId: 'manufacturer',
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'parties.faa_submission',
      group: 'parties',
      title: 'FAA party submission',
      cost: 1,
      leadTime: 40,
      prereqs: [],
      partyCooperationMin: 30,
      partyId: 'faa',
      reveals: [],
      renderer: 'document',
    },
  ];
}
