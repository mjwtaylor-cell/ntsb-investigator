/** Lab flow evidence stubs: teardown, fractography, performance, sim. */

import type { EvidenceItem } from '../types';

export function buildLabItems(): EvidenceItem[] {
  return [
    {
      id: 'lab.materials_fractography',
      group: 'structures',
      title: 'Materials lab fractography',
      cost: 4,
      leadTime: 25,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'powerplants.engine_teardown',
      group: 'powerplants',
      title: 'Engine teardown and field-to-lab exam',
      cost: 5,
      leadTime: 30,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'lab.performance_study',
      group: 'operations',
      title: 'Aircraft performance study',
      cost: 4,
      leadTime: 20,
      prereqs: ['structures.wreckage_map'],
      reveals: [],
      renderer: 'document',
    },
    {
      id: 'lab.simulator_session',
      group: 'operations',
      title: 'Simulator session — reconstructed profile',
      cost: 3,
      leadTime: 14,
      prereqs: ['lab.performance_study'],
      reveals: [],
      renderer: 'document',
    },
  ];
}
