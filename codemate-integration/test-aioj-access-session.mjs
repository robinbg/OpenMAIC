import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
function compile(relative, imports = {}, globals = {}) {
  const filename = path.join(ROOT, relative);
  const compiled = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  assert.equal(
    compiled.diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error).length ||
      0,
    0,
  );
  const loaded = { exports: {} };
  vm.runInNewContext(
    compiled.outputText,
    {
      module: loaded,
      exports: loaded.exports,
      URL,
      URLSearchParams,
      AbortController,
      Date,
      ...globals,
      require: (name) => {
        if (name in imports) return imports[name];
        throw Error(`Unexpected dependency ${name}`);
      },
    },
    { filename },
  );
  return loaded.exports;
}
const config = compile('lib/config/codemate-integration.ts');
const sessions = compile('lib/classroom/aioj-access-session.ts', {
  '@/lib/config/codemate-integration': config,
});
const NOW = 1800000000000;
const tick = () => new Promise((resolve) => setImmediate(resolve));
function harness({
  embedded = false,
  value = { success: true, authenticated: false },
  storage = true,
  retryAt = null,
} = {}) {
  const state = {
    time: NOW,
    calls: [],
    timers: new Map(),
    notifications: [],
    replacements: [],
    statuses: [],
    retryAt,
    resume: null,
    value,
  };
  let timerId = 0;
  const browser = {
    now: () => state.time,
    fetchStatus: async (id, signal) => {
      state.calls.push({ id, signal });
      if (state.value instanceof Error) throw state.value;
      return state.value;
    },
    setTimer: (callback, delay) => {
      state.timers.set(++timerId, { callback, delay });
      return timerId;
    },
    clearTimer: (id) => state.timers.delete(id),
    onResume: (callback) => {
      state.resume = callback;
      return () => {
        state.resume = null;
      };
    },
    isEmbedded: embedded,
    notifyParent: (message, origin) => state.notifications.push({ message, origin }),
    readRetryAt: () => state.retryAt,
    writeRetryAt: (_id, at) => {
      if (storage) state.retryAt = at;
      return storage;
    },
    replace: (url) => state.replacements.push(url),
  };
  return {
    browser,
    state,
    start: () =>
      sessions.startAiojAccessSession(browser, 'https://aioj.test', 'demo-room', (value) =>
        state.statuses.push(value),
      ),
  };
}

test('only a fixed valid deployment origin and exact safe classroom path can produce AIOJ recovery links', () => {
  assert.equal(config.getAiojParentOrigin('https://aioj.test/'), 'https://aioj.test');
  assert.equal(
    config.getAiojParentOrigin('http://106.52.206.55:13000'),
    'http://106.52.206.55:13000',
  );
  for (const input of [
    undefined,
    '',
    'data:text/plain,x',
    'javascript:alert(1)',
    'https://user:pass@aioj.test',
    'https://aioj.test/path',
    'https://aioj.test/?return=evil',
    'https://aioj.test/#evil',
  ])
    assert.equal(config.getAiojParentOrigin(input), null);
  assert.equal(config.getAiojClassroomId('/classroom/demo-room'), 'demo-room');
  for (const input of [
    '/',
    '/settings',
    '/classroom/demo-room/child',
    '/classroom/%2e%2e',
    '/classroom/',
    `/classroom/${'x'.repeat(129)}`,
  ])
    assert.equal(config.getAiojClassroomId(input), null);
  assert.equal(
    config.getAiojClassroomLaunchUrl('https://aioj.test', 'demo-room'),
    'https://aioj.test/api/ai-correction/openmaic/launch?classroomId=demo-room',
  );
  assert.throws(() => config.getAiojClassroomLaunchUrl('https://evil.test/path', 'demo-room'));
  assert.throws(() => config.getAiojClassroomLaunchUrl('https://aioj.test', '../evil'));
});

test('direct classroom restores exactly once and a fresh mount cannot form a redirect loop', async () => {
  const h = harness();
  const stop = h.start();
  await tick();
  assert.equal(h.state.calls[0].id, 'demo-room');
  assert.equal(h.state.statuses[0].loading, true);
  assert.equal(h.state.statuses.at(-1).authenticated, false);
  assert.deepEqual(h.state.replacements, [
    'https://aioj.test/api/ai-correction/openmaic/launch?classroomId=demo-room',
  ]);
  h.state.resume();
  await tick();
  assert.equal(h.state.replacements.length, 1);
  stop();
  const stopAgain = h.start();
  await tick();
  assert.equal(h.state.replacements.length, 1);
  stopAgain();
});

test('iframe notifies only the configured parent with the exact classroom and never redirects itself', async () => {
  const h = harness({ embedded: true });
  const stop = h.start();
  await tick();
  assert.equal(h.state.notifications.length, 1);
  assert.equal(
    JSON.stringify(h.state.notifications[0]),
    JSON.stringify({
      message: { source: 'openmaic', type: 'access-required', classroomId: 'demo-room' },
      origin: 'https://aioj.test',
    }),
  );
  assert.equal(h.state.replacements.length, 0);
  h.state.resume();
  await tick();
  assert.equal(h.state.notifications.length, 1);
  stop();
});

test('authenticated class schedules expiry and resume rechecks fail closed, including a different active class grant', async () => {
  const h = harness({
    embedded: true,
    value: {
      success: true,
      enabled: true,
      authenticated: true,
      scope: 'demo',
      classroomId: 'demo-room',
      expiresAt: NOW + 1000,
    },
  });
  const stop = h.start();
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, true);
  const expiry = [...h.state.timers.values()][0];
  assert.equal(expiry.delay, 1025);
  h.state.time += 1025;
  h.state.value = {
    success: true,
    enabled: true,
    authenticated: false,
    scope: 'demo',
    expiresAt: null,
  };
  expiry.callback();
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, false);
  assert.equal(h.state.notifications.length, 1);
  h.state.value = {
    success: true,
    enabled: true,
    authenticated: true,
    scope: 'demo',
    classroomId: 'demo-room',
    expiresAt: NOW + 5000,
  };
  h.state.resume();
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, true);
  h.state.value = { ...h.state.value, classroomId: 'other-room' };
  h.state.resume();
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, false);
  assert.equal(h.state.notifications.length, 2);
  stop();
  assert.equal(h.state.resume, null);
  assert.equal(h.state.timers.size, 0);
});

test('fetch errors, malformed/expired status and unavailable retry storage provide denial without redirect loops', async () => {
  for (const value of [
    new Error('offline'),
    null,
    {},
    { success: true, authenticated: true, scope: 'demo', classroomId: 'demo-room', expiresAt: NOW },
    { success: true, authenticated: true, scope: 'demo', classroomId: 'demo-room' },
    { success: true, enabled: false, authenticated: true },
  ]) {
    const h = harness({ value, storage: false });
    const stop = h.start();
    await tick();
    assert.equal(h.state.statuses.at(-1).authenticated, false);
    assert.equal(h.state.replacements.length, 0);
    stop();
  }
  const h = harness({ retryAt: NOW + 1000 });
  const stop = h.start();
  await tick();
  assert.equal(h.state.replacements.length, 0);
  stop();
});

test('cleanup aborts outstanding status and discards late responses after route change', async () => {
  const h = harness();
  let resolve;
  h.browser.fetchStatus = (_id, signal) => {
    h.state.signal = signal;
    return new Promise((done) => {
      resolve = done;
    });
  };
  const stop = h.start();
  const queuedResume = h.state.resume;
  stop();
  assert.equal(h.state.signal.aborted, true);
  queuedResume();
  assert.equal(h.state.timers.size, 0);
  resolve({ success: true, authenticated: false });
  await tick();
  assert.equal(h.state.statuses.length, 1);
  assert.equal(h.state.replacements.length, 0);
});

test('a hung status request times out, hides the expired classroom and ignores its late success', async () => {
  const h = harness({
    embedded: true,
    value: {
      success: true,
      enabled: true,
      authenticated: true,
      scope: 'demo',
      classroomId: 'demo-room',
      expiresAt: NOW + 1000,
    },
  });
  const stop = h.start();
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, true);
  let resolve;
  h.browser.fetchStatus = (_id, signal) => {
    h.state.signal = signal;
    return new Promise((done) => {
      resolve = done;
    });
  };
  h.state.time += 1025;
  [...h.state.timers.values()][0].callback();
  assert.equal(h.state.statuses.at(-1).loading, true);
  assert.equal(h.state.statuses.at(-1).authenticated, false);
  const timeout = [...h.state.timers.values()].find((entry) => entry.delay === 10000);
  assert.ok(timeout);
  timeout.callback();
  assert.equal(h.state.signal.aborted, true);
  assert.equal(h.state.statuses.at(-1).loading, false);
  resolve({
    success: true,
    enabled: true,
    authenticated: true,
    scope: 'demo',
    classroomId: 'demo-room',
    expiresAt: NOW + 50000,
  });
  await tick();
  assert.equal(h.state.statuses.at(-1).authenticated, false);
  assert.equal(h.state.notifications.length, 1);
  stop();
});

test('real browser adapter requests only scoped uncached status and subscribes to focus, visible and bfcache resumes', async () => {
  const events = new Map();
  const docEvents = new Map();
  const calls = [];
  const messages = [];
  const storage = new Map();
  const window = {
    addEventListener: (name, callback) => events.set(name, callback),
    removeEventListener: (name) => events.delete(name),
    setTimeout: () => 1,
    clearTimeout: () => {},
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    location: { replace: (url) => calls.push(url) },
  };
  window.parent = { postMessage: (...args) => messages.push(args) };
  const document = {
    visibilityState: 'hidden',
    addEventListener: (name, callback) => docEvents.set(name, callback),
    removeEventListener: (name) => docEvents.delete(name),
  };
  const mod = compile(
    'lib/classroom/aioj-access-session.ts',
    { '@/lib/config/codemate-integration': config },
    {
      window,
      document,
      fetch: async (...args) => {
        calls.push(args);
        return { ok: true, json: async () => ({ success: true }) };
      },
    },
  );
  const adapter = mod.createAiojAccessBrowser();
  const controller = new AbortController();
  await adapter.fetchStatus('demo-room', controller.signal);
  assert.equal(calls[0][0], '/api/access-code/status?classroomId=demo-room');
  assert.equal(calls[0][1].cache, 'no-store');
  assert.equal(calls[0][1].signal, controller.signal);
  let resumed = 0;
  const remove = adapter.onResume(() => resumed++);
  events.get('focus')();
  events.get('pageshow')();
  docEvents.get('visibilitychange')();
  assert.equal(resumed, 2);
  document.visibilityState = 'visible';
  docEvents.get('visibilitychange')();
  assert.equal(resumed, 3);
  remove();
  assert.equal(events.size + docEvents.size, 0);
  assert.equal(adapter.isEmbedded, true);
  adapter.notifyParent(
    { source: 'openmaic', type: 'access-required', classroomId: 'demo-room' },
    'https://aioj.test',
  );
  assert.equal(messages[0][1], 'https://aioj.test');
  assert.equal(adapter.readRetryAt('demo-room'), null);
  assert.equal(adapter.writeRetryAt('demo-room', NOW), true);
  assert.equal(adapter.readRetryAt('demo-room'), NOW);
});

test('integration guard hides cached classroom children until authorization and never renders native access-code modal', () => {
  const element = (type, props) => ({ type, props });
  let status = null;
  let parentOrigin;
  let pathname = '/classroom/demo-room';
  let nativeStatus = null;
  const NativeModal = function NativeModal() {};
  const guard = compile('components/access-code-guard.tsx', {
    react: {
      useEffect: () => {},
      useState: (initial) => [initial === null ? status : (nativeStatus ?? initial), () => {}],
    },
    'react/jsx-runtime': { jsx: element, jsxs: element, Fragment: 'fragment' },
    'next/navigation': { usePathname: () => pathname },
    '@/components/access-code-modal': { AccessCodeModal: NativeModal },
    '@/lib/store/settings': { useSettingsStore: {} },
    '@/lib/config/codemate-integration': config,
    '@/lib/classroom/aioj-access-session': sessions,
  }).AccessCodeGuard;
  parentOrigin = 'https://aioj.test';
  const pending = guard({ children: 'CACHED_CLASSROOM', parentOrigin });
  assert.equal(JSON.stringify(pending).includes('CACHED_CLASSROOM'), false);
  status = { classroomId: 'other-room', authenticated: true, loading: false };
  assert.equal(
    JSON.stringify(guard({ children: 'CACHED_CLASSROOM', parentOrigin })).includes(
      'CACHED_CLASSROOM',
    ),
    false,
  );
  status = { classroomId: 'demo-room', authenticated: false, loading: false };
  const denied = guard({ children: 'CACHED_CLASSROOM', parentOrigin });
  assert.equal(JSON.stringify(denied).includes('CACHED_CLASSROOM'), false);
  assert.equal(JSON.stringify(denied).includes('AccessCodeModal'), false);
  assert.equal(JSON.stringify(denied).includes('返回 AIOJ 继续课堂'), true);
  status = { classroomId: 'demo-room', authenticated: true, loading: false };
  assert.equal(
    guard({ children: 'CACHED_CLASSROOM', parentOrigin }).props.children,
    'CACHED_CLASSROOM',
  );
  assert.equal(guard({ children: 'NATIVE_CLASSROOM' }).props.children[1], 'NATIVE_CLASSROOM');
  nativeStatus = { enabled: true, authenticated: false, loading: false };
  assert.equal(guard({ children: 'NATIVE_CLASSROOM' }).props.children[0].type, NativeModal);
  for (const path of ['/', '/settings', '/classroom/%2e%2e']) {
    pathname = path;
    const doorway = guard({ children: 'NATIVE_SYSTEM', parentOrigin });
    assert.equal(JSON.stringify(doorway).includes('NATIVE_SYSTEM'), false);
    assert.equal(JSON.stringify(doorway).includes('https://aioj.test'), true);
  }
});
