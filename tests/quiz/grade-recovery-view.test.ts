/**
 * Render the production recovery branch with the real React element runtime,
 * then inspect its saved-answer controls and execute the explicit retry.
 */
import { readFileSync } from 'node:fs';
import * as React from 'react';
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
let branch: ts.Expression | undefined;
function walk(node: ts.Node) {
  if (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken &&
    node.left.getText(tree) === "phase === 'grading_failed'"
  )
    branch = node.right;
  ts.forEachChild(node, walk);
}
walk(tree);
if (!branch) throw new Error('Production grading recovery branch was not found');
const compiled = ts.transpileModule('function render() { return ' + branch.getText(tree) + '; }', {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.React,
  },
}).outputText;

function collect(node: React.ReactNode): React.ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(collect);
  if (!React.isValidElement<Record<string, unknown>>(node)) return [];
  return [node, ...collect(node.props.children as React.ReactNode)];
}

it('shows every saved answer read-only without fabricating grades', () => {
  const questions = [
    { id: 'single', type: 'single', question: 'Single', points: 1 },
    { id: 'multiple', type: 'multiple', question: 'Multiple', points: 2 },
    { id: 'short', type: 'short_answer', question: 'Short', points: 3 },
  ];
  const answers = { single: 'A', multiple: ['B', 'C'], short: 'saved answer' };
  const snapshot = structuredClone(answers);
  const setPhase = vi.fn();
  const env = {
    React,
    phase: 'grading_failed',
    questions,
    answers,
    locale: 'zh-CN',
    setPhase,
    motion: { div: 'section' },
    SingleChoiceQuestion: () => null,
    MultipleChoiceQuestion: () => null,
    ShortAnswerQuestion: () => null,
  };
  const node = new Function(...Object.keys(env), compiled + '; return render();')(
    ...Object.values(env),
  );
  const elements = collect(node);
  const answerTypes = [
    env.SingleChoiceQuestion,
    env.MultipleChoiceQuestion,
    env.ShortAnswerQuestion,
  ];
  const answerElements = elements.filter((element) =>
    answerTypes.some((type) => element.type === type),
  );

  expect(answerElements).toHaveLength(3);
  answerElements.forEach((element, index) => {
    const question = questions[index];
    expect(element.type).toBe(answerTypes[index]);
    expect(element.props.question).toBe(question);
    expect(element.props.value).toEqual(answers[question.id as keyof typeof answers]);
    expect(element.props.disabled).toBe(true);
    expect(element.props).not.toHaveProperty('result');
    (element.props.onChange as (value: string) => void)('edited answer');
  });
  expect(answers).toEqual(snapshot);
  expect(setPhase).not.toHaveBeenCalled();

  const retry = elements.find((element) => element.type === 'button');
  expect(retry).toBeDefined();
  (retry!.props.onClick as () => void)();
  expect(setPhase).toHaveBeenCalledExactlyOnceWith('grading');
  expect(answers).toEqual(snapshot);
  expect(elements.filter((element) => element.props.role === 'alert')).toHaveLength(1);
});
