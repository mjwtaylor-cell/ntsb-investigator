/** Pure interview conduct → transcript evidence id + lines. */

import type { CaseState, EvidenceItem } from '../types';
import { INTERVIEW_SUBJECTS, subjectById } from './subjects';
import { pickAdmission, pickDeflection, topicOpener } from './phrases';
import type {
  InterviewSubjectId,
  InterviewTranscript,
  InterviewLine,
} from './types';

/** Catalogue id for a topic transcript. */
export function transcriptEvidenceId(
  subjectId: InterviewSubjectId,
  topicId: string,
): string {
  return `interview.${subjectId}.${topicId}`;
}

export function buildInterviewCatalogueItems(): EvidenceItem[] {
  const items: EvidenceItem[] = [];
  for (const sub of INTERVIEW_SUBJECTS) {
    for (const topic of sub.topics) {
      items.push({
        id: transcriptEvidenceId(sub.id, topic.id),
        group: sub.group,
        title: `Interview transcript — ${sub.displayName}: ${topic.label}`,
        cost: topic.cost,
        leadTime: 0,
        prereqs: [sub.baseEvidenceId],
        reveals: [],
        renderer: 'dialogue',
      });
    }
  }
  return items;
}

export interface ConductResult {
  state: CaseState;
  transcript: InterviewTranscript;
  evidenceId: string;
}

/**
 * Conduct a topic interview: charges cost, appends transcript evidence id.
 * Topic must be unlocked; base interview evidence must be held; group active.
 */
export function conductInterview(
  state: CaseState,
  subjectId: InterviewSubjectId,
  topicId: string,
): ConductResult {
  const subject = subjectById(subjectId);
  if (!subject) throw new Error(`Unknown interview subject: ${subjectId}`);
  const topic = subject.topics.find((t) => t.id === topicId);
  if (!topic) throw new Error(`Unknown topic: ${topicId}`);

  if (!state.activeGroups.includes(subject.group)) {
    throw new Error(`Group not active: ${subject.group}`);
  }
  if (!state.obtainedEvidenceIds.includes(subject.baseEvidenceId)) {
    throw new Error(`Base interview not obtained: ${subject.baseEvidenceId}`);
  }
  if (
    topic.unlockAnyOf.length > 0 &&
    !topic.unlockAnyOf.some((id) => state.obtainedEvidenceIds.includes(id))
  ) {
    throw new Error(`Topic locked: ${topicId}`);
  }

  const evidenceId = transcriptEvidenceId(subjectId, topicId);
  if (state.obtainedEvidenceIds.includes(evidenceId)) {
    throw new Error(`Transcript already held: ${evidenceId}`);
  }
  if (state.investigatorDaysRemaining < topic.cost) {
    throw new Error('Insufficient investigator-days for interview');
  }

  const lines = buildLines(
    subjectId,
    topicId,
    subject.displayName,
    subject.knowledge,
  );
  const transcript: InterviewTranscript = {
    evidenceId,
    subjectId,
    topicId,
    title: `${subject.displayName} — ${topic.label}`,
    lines,
  };

  const next: CaseState = {
    ...state,
    investigatorDaysRemaining: state.investigatorDaysRemaining - topic.cost,
    investigatorDaysSpent: state.investigatorDaysSpent + topic.cost,
    obtainedEvidenceIds: [...state.obtainedEvidenceIds, evidenceId].sort(),
    actionLog: [
      ...state.actionLog,
      { type: 'conductInterview', subjectId, topicId },
    ],
  };

  return { state: next, transcript, evidenceId };
}

function buildLines(
  subjectId: InterviewSubjectId,
  topicId: string,
  displayName: string,
  knowledge: { admits: string[]; deflects: string[]; bias: string },
): InterviewLine[] {
  const lines: InterviewLine[] = [
    { speaker: 'IIC', text: topicOpener(topicId) },
  ];
  for (const key of knowledge.admits.slice(0, 2)) {
    lines.push({
      speaker: displayName,
      text: pickAdmission(key, subjectId, topicId),
    });
  }
  for (const key of knowledge.deflects.slice(0, 1)) {
    lines.push({
      speaker: displayName,
      text: pickDeflection(key, subjectId, topicId),
    });
  }
  if (knowledge.bias === 'uncertain') {
    lines.push({
      speaker: displayName,
      text: 'I am not certain about the timing; it happened fast.',
    });
  }
  return lines;
}

/** Topics currently unlocked for a subject given held evidence. */
export function unlockedTopics(
  subjectId: InterviewSubjectId,
  obtained: string[],
): string[] {
  const subject = subjectById(subjectId);
  if (!subject) return [];
  if (!obtained.includes(subject.baseEvidenceId)) return [];
  return subject.topics
    .filter(
      (t) =>
        t.unlockAnyOf.length === 0 ||
        t.unlockAnyOf.some((id) => obtained.includes(id)),
    )
    .map((t) => t.id);
}
