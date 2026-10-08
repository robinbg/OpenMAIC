import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { QuizQuestion } from '@/lib/types/stage';
vi.mock('@/lib/utils/model-config', () => ({
  getCurrentModelConfig: () => ({ modelString: 'server:model', apiKey: '' }),
}));
import { gradeShortAnswerQuestion } from '@/lib/quiz/short-answer';
const q = { id: 'short', type: 'short_answer', question: '1+1', points: 10 } as QuizQuestion;
const context = { classroomId: 'owned-classroom', sceneId: 'quiz-scene' };
const fetcher = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetcher);
});
afterEach(() => vi.unstubAllGlobals());

it('submits the exact classroom/scene/question identity and accepts a real grade', async () => {
  fetcher.mockResolvedValue(Response.json({ success: true, score: 10, comment: '正确' }));
  const result = await gradeShortAnswerQuestion(q, '2', 'zh-CN', context);
  expect(result).toEqual({
    questionId: 'short',
    correct: true,
    status: 'correct',
    earned: 10,
    aiComment: '正确',
  });
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({
    ...context,
    questionId: 'short',
    userAnswer: '2',
  });
  expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
});
it.each([403, 429, 500])('HTTP %s rejects without assigning base credit', async (status) => {
  fetcher.mockResolvedValue(new Response('unavailable', { status }));
  await expect(gradeShortAnswerQuestion(q, '2', 'zh-CN', context)).rejects.toThrow(
    'Grading service unavailable',
  );
});
it.each([
  { score: 5, comment: 'missing success' },
  { success: false, score: 5, comment: 'failed' },
  { success: true, score: null, comment: 'bad score' },
  { success: true, score: 11, comment: 'out of range' },
  { success: true, score: 5, comment: '' },
])('malformed response rejects without creating a QuestionResult', async (value) => {
  fetcher.mockResolvedValue(Response.json(value));
  await expect(gradeShortAnswerQuestion(q, '2', 'zh-CN', context)).rejects.toThrow(
    'Invalid grading response',
  );
});
it('network failure remains a failure and parent cancellation reaches the request', async () => {
  const controller = new AbortController();
  fetcher.mockImplementation(
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener('abort', () =>
          reject(new DOMException('aborted', 'AbortError')),
        );
      }),
  );
  const pending = gradeShortAnswerQuestion(q, '2', 'zh-CN', context, controller.signal);
  controller.abort();
  await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
});
