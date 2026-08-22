/** Barrel for failure-mode templates. */

export type {
  FlightPhase,
  TemplateParameter,
  FlightScriptHook,
  EvidenceHook,
  RedHerringSlot,
  ParCostStub,
  FailureModeTemplate,
} from './schema';

export type { TemplateValidationIssue } from './validate';
export { validateTemplate, assertValidTemplate } from './validate';

export { T1_VFR_IMC } from './t1-vfr-imc';
export { T2_FUEL } from './t2-fuel';

export {
  TEMPLATES,
  TEMPLATE_IDS,
  getTemplate,
  listTemplates,
  templatesForArchetype,
} from './registry';
