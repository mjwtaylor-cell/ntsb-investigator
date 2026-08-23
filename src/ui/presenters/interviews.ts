/** Interview transcript presentation — observational prose only. */

import {
  conductInterview,
  subjectById,
  transcriptEvidenceId,
  type InterviewSubjectId,
  type InterviewTranscript,
} from '../../engine';
import type { CaseState } from '../../engine';

/** Rebuild transcript lines for a held interview evidence id (deterministic). */
export function presentInterviewTranscript(
  evidenceId: string,
  state: CaseState,
): InterviewTranscript | null {
  const m = /^interview\.([^.]+)\.(.+)$/.exec(evidenceId);
  if (!m) return null;
  const subjectId = m[1] as InterviewSubjectId;
  const topicId = m[2]!;
  const subject = subjectById(subjectId);
  if (!subject) return null;
  const temp: CaseState = {
    ...state,
    obtainedEvidenceIds: state.obtainedEvidenceIds.filter((id) => id !== evidenceId),
    investigatorDaysRemaining: state.investigatorDaysRemaining + 1,
  };
  try {
    const { transcript } = conductInterview(temp, subjectId, topicId);
    return transcript;
  } catch {
    const topic = subject.topics.find((t) => t.id === topicId);
    return {
      evidenceId: transcriptEvidenceId(subjectId, topicId),
      subjectId,
      topicId,
      title: `${subject.displayName} — ${topic?.label ?? topicId}`,
      lines: [
        { speaker: 'IIC', text: 'Interview notes on file.' },
        {
          speaker: subject.displayName,
          text: 'Statement recorded in the factual package.',
        },
      ],
    };
  }
}

export function interviewEvidenceIds(obtained: string[]): string[] {
  return obtained.filter((id) => id.startsWith('interview.'));
}
