/** Interview subjects, topics, and knowledge models (P3). */

export type InterviewSubjectId =
  | 'dispatcher'
  | 'director_ops'
  | 'mechanic'
  | 'controller'
  | 'ground_witness'
  | 'chief_pilot';

export interface InterviewTopic {
  id: string;
  label: string;
  /** Evidence ids that unlock this topic (any one is enough if empty = always). */
  unlockAnyOf: string[];
  /** Investigator-day cost to conduct this topic. */
  cost: number;
}

export interface SubjectKnowledge {
  /** Phrase-bank keys this subject will admit under pressure. */
  admits: string[];
  /** Phrase-bank keys this subject deflects or minimises. */
  deflects: string[];
  /** Bias tag for presentation (never truth-node text). */
  bias: 'operator' | 'self' | 'neutral' | 'uncertain';
}

export interface InterviewSubject {
  id: InterviewSubjectId;
  displayName: string;
  role: string;
  /** Group that must be active to interview. */
  group: 'operations' | 'witnesses' | 'atc' | 'maintenanceRecords' | 'humanPerformance';
  /** Catalogue evidence id for the base interview package. */
  baseEvidenceId: string;
  knowledge: SubjectKnowledge;
  topics: InterviewTopic[];
}

/** Transcript line stored as observational prose. */
export interface InterviewLine {
  speaker: string;
  text: string;
}

export interface InterviewTranscript {
  evidenceId: string;
  subjectId: InterviewSubjectId;
  topicId: string;
  title: string;
  lines: InterviewLine[];
}
