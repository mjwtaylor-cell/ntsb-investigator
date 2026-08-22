/** Party submission stubs. */

import type { EvidenceItem } from '../types';

export function buildPartyItems(): EvidenceItem[] {
  return [
    {
      id: 'parties.manufacturer_submission',
      group: 'parties',
      title: 'Manufacturer party submission',
      cost: 1,
      leadTime: 45,
      prereqs: [],
      partyCooperationMin: 35,
      partyId: 'manufacturer',
      reveals: [],
      renderer: 'document',
    },
  ];
}
