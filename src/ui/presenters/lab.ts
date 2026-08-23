/** Lab flow document bodies — observational, no truth-node text. */

import type { EvidenceItem, GeneratedCase } from '../../engine';

export function presentLabBody(item: EvidenceItem, bundle: GeneratedCase): string[] {
  const w = bundle.world;
  switch (item.id) {
    case 'lab.materials_fractography':
      return [
        'Materials laboratory fractography of recovered fracture surfaces.',
        'Optical and SEM review of selected fracture faces. Beach marks and overload dimples catalogued where present.',
        'No truth assignment is made in this package; correlate with structures field notes and teardown.',
      ];
    case 'powerplants.engine_teardown':
    case 'lab.fractography_fan_disk':
      return [
        `Powerplants teardown for ${w.archetypeId} family engines recovered from the field.`,
        'Disassembly progressed module by module. Rotating-group hardware photographed and tagged.',
        'Fracture surfaces forwarded to materials lab where indicated by the field exam.',
      ];
    case 'lab.performance_study':
    case 'perf.approach_energy_study':
      return [
        'Aircraft performance study reconstructing energy state on the final segment.',
        'Inputs: available recorder/ADS-B samples, weight estimate, and configuration from wreckage.',
        'Output: speed/altitude/configuration timeline suitable for simulator session planning.',
      ];
    case 'lab.simulator_session':
      return [
        'Simulator session flown against the reconstructed approach profile.',
        'Crew-not-causal: session used for handling qualities and configuration effects only.',
        'Session notes filed with the performance study; no probable-cause language in this package.',
      ];
    default:
      return [
        `${item.title}.`,
        'Laboratory package held for group chairman review.',
      ];
  }
}

export function presentPartyBody(item: EvidenceItem, bundle: GeneratedCase): string[] {
  const op = bundle.world.operator.name;
  switch (item.id) {
    case 'parties.operator_submission':
      return [
        `${op} party submission attributes the outcome primarily to crew failure to maintain airspeed on final.`,
        'Submission minimises maintenance deferral practice and dispatch weather annotation. Treat as advocacy, not fact.',
      ];
    case 'parties.manufacturer_submission':
      return [
        'Manufacturer party submission emphasises maintenance practices and in-service configuration over design.',
        'Submission cites AFM icing guidance and argues the airframe performed within certificated limits when configured as designed.',
        'Treat manufacturer findings as advocacy; verify against lab and recorder packages.',
      ];
    case 'parties.faa_submission':
      return [
        'FAA party submission emphasises operator compliance history and surveillance intervals.',
        'Oversight findings are framed as adequate given the approved program; gaps are characterised as isolated.',
        'Cross-check with MEL audit and training records before accepting oversight conclusions.',
      ];
    case 'parties.operator_schedule':
      return [
        `${op} schedule and rotation extracts for the accident crew pairing.`,
        'Turn times and late-day banks are tabulated without assigning causal weight in this package.',
      ];
    default:
      return [`${item.title}. Party paper on file.`];
  }
}
