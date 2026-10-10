import type { QuizQuestion } from '@/lib/types/stage';
import type { QuestionResult } from '@/lib/quiz/grading';
import { getCurrentModelConfig } from '@/lib/utils/model-config';

/** A failed request is not a grade. The view preserves answers and offers retry. */
export async function gradeShortAnswerQuestion(
  q: QuizQuestion,
  userAnswer: string,
  language: string,
  context: { classroomId: string; sceneId: string },
  signal?: AbortSignal,
): Promise<QuestionResult> {
  const pts = q.points ?? 1;
  const modelConfig = getCurrentModelConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-model': modelConfig.modelString,
    'x-api-key': modelConfig.apiKey,
  };
  if (modelConfig.baseUrl) headers['x-base-url'] = modelConfig.baseUrl;
  if (modelConfig.providerType) headers['x-provider-type'] = modelConfig.providerType;
  const timeout = AbortSignal.timeout(65000);
  const res = await fetch('/api/quiz-grade', {
    method: 'POST',
    headers,
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    body: JSON.stringify({
      question: q.question,
      userAnswer,
      points: pts,
      commentPrompt: q.commentPrompt,
      language,
      ...context,
      questionId: q.id,
    }),
  });
  if (!res.ok) throw new Error('Grading service unavailable');
  const data = await res.json();
  if (
    data.success !== true ||
    !Number.isFinite(data.score) ||
    data.score < 0 ||
    data.score > pts ||
    typeof data.comment !== 'string' ||
    !data.comment.trim()
  )
    throw new Error('Invalid grading response');
  return {
    questionId: q.id,
    correct: data.score >= pts * 0.8,
    status: data.score >= pts * 0.8 ? 'correct' : 'incorrect',
    earned: data.score,
    aiComment: data.comment,
  };
}
