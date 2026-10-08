const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require(process.env.TYPESCRIPT_PATH || 'typescript');
const filename = path.resolve(__dirname, '../lib/classroom/codemate-embed-protocol.ts');
const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
  fileName: filename, reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
assert.equal(compiled.diagnostics?.filter((d) => d.category === ts.DiagnosticCategory.Error).length || 0, 0);
const target = { exports: {} };
vm.runInNewContext(compiled.outputText, { module: target, exports: target.exports, URL });
const { isCodeMateParentMessage, resolveCodeMateParentOrigin, parseCodeMateVisualCommand } = target.exports;

test('only the actual parent window at the configured origin may send commands', () => {
  const parent = {};
  const childWidget = {};
  assert.equal(isCodeMateParentMessage(parent, 'https://codemate.test', parent, 'https://codemate.test'), true);
  assert.equal(isCodeMateParentMessage(childWidget, 'https://codemate.test', parent, 'https://codemate.test'), false);
  assert.equal(isCodeMateParentMessage(parent, 'https://evil.test', parent, 'https://codemate.test'), false);
  assert.equal(isCodeMateParentMessage(parent, 'null', parent, 'https://codemate.test'), false);
  assert.equal(isCodeMateParentMessage(parent, 'https://codemate.test', parent, null), false);
});

test('embedded React sources parse as TypeScript without syntax errors', () => {
  for (const relative of ['components/stage.tsx', 'components/edit/PlaybackChromeRoot.tsx',
    'components/classroom/ClassroomSurface.tsx', 'app/classroom/[id]/page.tsx',
    'lib/classroom/use-codemate-embed-mode.ts', 'lib/classroom/use-codemate-visual-bridge.ts']) {
    const result = ts.transpileModule(readFileSync(path.resolve(__dirname, '..', relative), 'utf8'), {
      fileName: relative, reportDiagnostics: true,
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    });
    const errors = (result.diagnostics || []).filter((d) => d.category === ts.DiagnosticCategory.Error);
    assert.equal(errors.length, 0, `${relative}: ${errors.map((d) => d.messageText).join('; ')}`);
  }
});

test('configured parent origin takes precedence and invalid configuration fails closed', () => {
  assert.equal(resolveCodeMateParentOrigin('http://106.52.206.55:13000', 'https://evil.test/'), 'http://106.52.206.55:13000');
  assert.equal(resolveCodeMateParentOrigin(undefined, 'https://codemate.test/path'), 'https://codemate.test');
  for (const value of ['javascript:alert(1)', 'data:text/html,x', 'null', 'https://user:secret@codemate.test']) {
    assert.equal(resolveCodeMateParentOrigin(value, 'https://fallback.test'), null);
  }
  assert.equal(resolveCodeMateParentOrigin(undefined, ''), null);
});

test('presentation commands accept only current-classroom scene identifiers and supported actions', () => {
  const base = { source: 'codemate', type: 'visual-command' };
  const parse = (data) => parseCodeMateVisualCommand(data, 'classroom-a', ['scene-one', 'scene-two']);
  for (const action of ['show', 'play', 'pause']) {
    assert.equal(parse({ ...base, action, sceneId: 'scene-one' }).sceneId, 'scene-one');
    assert.equal(parse({ ...base, action }).action, action);
  }
  for (const data of [null, [], 'play', { ...base, action: 'eval', code: 'alert(1)' },
    { ...base, action: 'play', sceneId: 'foreign-scene' }, { ...base, action: 'play', sceneId: 42 },
    { ...base, action: 'show', sceneId: 'scene-one', classroomId: 'another-classroom' },
    { ...base, action: 'play', source: 'evil' }, { ...base, action: 'play', type: 'execute' }]) {
    assert.equal(parse(data), null);
  }
  assert.equal(parse({ ...base, action: 'play', html: '<script>alert(1)</script>' }).html, undefined);
});
