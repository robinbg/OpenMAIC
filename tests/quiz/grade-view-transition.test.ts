/** Execute the production grading effect with isolated state/persistence seams. */
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { expect, it, vi } from 'vitest';

const source = readFileSync(
  new URL('../../components/scene-renderers/quiz-view.tsx', import.meta.url),
  'utf8',
);
const tree = ts.createSourceFile(
  'quiz-view.tsx',
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
let effect: ts.Node | undefined;
function walk(node: ts.Node) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(tree) === 'useEffect' &&
    node.arguments[0]?.getText(tree).includes("phase !== 'grading'")
  )
    effect = node.arguments[0];
  ts.forEachChild(node, walk);
}
walk(tree);
if (!effect) throw new Error('Production grading effect was not found');
const compiled = ts.transpileModule(`const run = ${effect.getText(tree)};`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const results = [
  { questionId: 'short', correct: true, status: 'correct', earned: 10, aiComment: 'correct' },
];
function setup(grade = vi.fn().mockResolvedValue(results[0])) {
  const env = {
    phase: 'grading',
    questions: [{ id: 'short', type: 'short_answer' }],
    answers: { short: '2' },
    locale: 'zh-CN',
    sceneId: 'quiz-scene',
    stageId: 'owned-classroom',
    attemptId: 'attempt',
    runtimeWriter: {},
    gradeChoiceQuestions: vi.fn().mockReturnValue([]),
    isShortAnswer: () => true,
    gradeShortAnswerQuestion: grade,
    persistQuizReview: vi.fn().mockResolvedValue(undefined),
    setResults: vi.fn(),
    setPhase: vi.fn(),
    setRuntimeGate: vi.fn(),
    log: { warn: vi.fn() },
  };
  const run = new Function(...Object.keys(env), `${compiled}; return run;`)(...Object.values(env));
  return { env, cleanup: run() };
}

it('failed grading preserves the attempt without recording or displaying invented results', async () => {
  const { env } = setup(vi.fn().mockRejectedValue(new Error('provider down')));
  await vi.waitFor(() => expect(env.setPhase).toHaveBeenCalledWith('grading_failed'));
  expect(env.persistQuizReview).not.toHaveBeenCalled();
  expect(env.setResults).not.toHaveBeenCalled();
  expect(env.answers).toEqual({ short: '2' });
});

it('successful retry records real grades before displaying the report', async () => {
  const { env } = setup();
  await vi.waitFor(() => expect(env.setPhase).toHaveBeenCalledWith('reviewing'));
  expect(env.persistQuizReview).toHaveBeenCalledWith(
    expect.objectContaining({ answers: env.answers, results }),
    env.runtimeWriter,
  );
  expect(env.setResults).toHaveBeenCalledWith(results);
  expect(env.gradeShortAnswerQuestion).toHaveBeenCalledWith(
    env.questions[0],
    '2',
    'zh-CN',
    { classroomId: 'owned-classroom', sceneId: 'quiz-scene' },
    expect.any(AbortSignal),
  );
});

it('unmounted or changed-scene grading cannot publish a delayed result', async () => {
  let resolve!: (value: unknown) => void;
  const grade = vi.fn().mockImplementation(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const { env, cleanup } = setup(grade);
  cleanup();
  expect(grade.mock.calls[0][4].aborted).toBe(true);
  resolve(results[0]);
  await new Promise((r) => setTimeout(r, 0));
  expect(env.persistQuizReview).not.toHaveBeenCalled();
  expect(env.setResults).not.toHaveBeenCalled();
  expect(env.setPhase).not.toHaveBeenCalled();
});
