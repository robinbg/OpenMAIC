#!/usr/bin/env node
'use strict';

// Run: TYPESCRIPT_PATH=/data/dev-codemate/aioj-core/node_modules/typescript node --test codemate-integration/test-tts.cjs
// Executes the actual route with mocked fetch; no real Noiz requests or charges.
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

function findTypeScript() {
  for (const candidate of [process.env.TYPESCRIPT_PATH, 'typescript', '/data/dev-codemate/aioj-core/node_modules/typescript'].filter(Boolean)) {
    try { return require(candidate); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }
  }
  throw new Error('Set TYPESCRIPT_PATH to the installed typescript package directory.');
}
const ts = findTypeScript();
const routePath = process.env.OPENMAIC_TTS_ROUTE || path.resolve(__dirname, '../app/api/access-code/codemate-tts/audio/speech/route.ts');
const compiled = ts.transpileModule(readFileSync(routePath, 'utf8'), {
  fileName: routePath, reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
assert.deepEqual((compiled.diagnostics || []).filter((item) => item.category === ts.DiagnosticCategory.Error), []);

const SECRET = 'test-only-private-tts-secret';
const ENV = {
  CODEMATE_OPENMAIC_TTS_SECRET: SECRET,
  NOIZ_BASE_URL: 'https://noiz.example.test/v1/',
  NOIZ_API_KEY: 'test-only-noiz-key',
  NOIZ_VOICE_ID: 'server-selected-voice',
};
const FRAME = Buffer.from([0xff, 0xfb, 0x90, 0x00, 1, 2, 3, 4]);
const TAG = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 3, 9, 8, 7]);
function mp3(tag = true) { return new Response(tag ? Buffer.concat([TAG, FRAME]) : FRAME, { headers: { 'Content-Type': 'audio/mpeg' } }); }
function loadRoute(fetchMock, options = {}) {
  const module = { exports: {} };
  vm.runInNewContext(compiled.outputText, {
    module, exports: module.exports, require, Buffer, URL, Request, Response, Headers, FormData,
    ReadableStream, AbortController, AbortSignal, TextEncoder,
    process: { env: { ...ENV, ...options.env } }, fetch: fetchMock,
    setTimeout: options.setTimeout || setTimeout, clearTimeout,
  }, { filename: routePath });
  return module.exports;
}
function request(body = { input: '观察变量变化。' }, options = {}) {
  return new Request('http://localhost:13010/api/access-code/codemate-tts/audio/speech', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}`, ...options.headers },
    body: options.raw === undefined ? JSON.stringify(body) : options.raw,
    ...(options.signal ? { signal: options.signal } : {}),
  });
}

test('requires an independent bearer credential before any provider request', async () => {
  let calls = 0;
  const route = loadRoute(async () => { calls++; return mp3(); });
  for (const authorization of ['', 'Bearer wrong-secret', `Basic ${SECRET}`, `Bearer ${SECRET} extra`]) {
    assert.equal((await route.POST(request(undefined, { headers: { Authorization: authorization } }))).status, 401);
  }
  assert.equal((await loadRoute(async () => { calls++; }, { env: { CODEMATE_OPENMAIC_TTS_SECRET: '' } }).POST(request())).status, 401);
  assert.equal(calls, 0);
});

test('rejects invalid or excessive input and non-mp3 requests before billing', async () => {
  let calls = 0;
  const route = loadRoute(async () => { calls++; return mp3(); });
  for (const body of [null, [], {}, { input: ' ' }, { input: 10 }, { input: '中'.repeat(2001) }, { input: 'hello', response_format: 'wav' }]) {
    assert.equal((await route.POST(request(body))).status, 400);
  }
  assert.equal((await route.POST(request(undefined, { raw: '{' }))).status, 400);
  assert.equal((await route.POST(request(undefined, { headers: { 'Content-Type': 'text/plain' } }))).status, 400);
  assert.equal((await route.POST(request(undefined, { raw: ' '.repeat(16385) }))).status, 413);
  assert.equal(calls, 0);
});

test('uses server voice and raw Noiz authorization, ignoring caller model and voice', async () => {
  const calls = [];
  const route = loadRoute(async (url, options) => { calls.push({ url, options }); return mp3(); });
  const response = await route.POST(request({ input: '你好。', voice: 'untrusted-voice', model: 'untrusted-model', response_format: 'mp3' }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Content-Type'), 'audio/mpeg');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.concat([TAG, FRAME]));
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://noiz.example.test/v1/text-to-speech');
  assert.equal(calls[0].options.headers.Authorization, ENV.NOIZ_API_KEY);
  assert.equal(calls[0].options.redirect, 'error');
  assert.deepEqual(Array.from(calls[0].options.body.entries()), [['text', '你好。'], ['voice_id', ENV.NOIZ_VOICE_ID], ['output_format', 'mp3']]);
});

test('splits at sentence boundaries, caps Unicode chunks at 130 and strips repeated ID3 tags', async () => {
  const chunks = [];
  const input = '甲'.repeat(79) + '。' + '乙'.repeat(79) + '。' + '😀'.repeat(131);
  const route = loadRoute(async (_url, options) => { chunks.push(options.body.get('text')); return mp3(); });
  const response = await route.POST(request({ input }));
  assert.equal(response.status, 200);
  assert.equal(chunks.join(''), input);
  assert.equal(chunks[0], '甲'.repeat(79) + '。');
  assert.ok(chunks.every((chunk) => Array.from(chunk).length <= 130));
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), Buffer.concat([TAG, ...chunks.map(() => FRAME)]));
});

test('rejects provider failures and malformed audio without leaking details or retrying', async () => {
  const providers = [
    () => new Response('private-provider-message test-only-noiz-key', { status: 429 }),
    () => new Response('{"private":"provider-error"}', { headers: { 'Content-Type': 'application/json' } }),
    () => new Response('<html>bad</html>', { headers: { 'Content-Type': 'audio/mpeg' } }),
    () => new Response(Buffer.from('ID3invalid'), { headers: { 'Content-Type': 'audio/mpeg' } }),
    () => { throw new Error('private-provider-message'); },
  ];
  for (const provider of providers) {
    let calls = 0;
    const route = loadRoute(async () => { calls++; return provider(); });
    const response = await route.POST(request({ input: 'hello' }));
    assert.equal(response.status, 502);
    assert.doesNotMatch(await response.text(), /private|noiz-key|provider-error/);
    assert.equal(calls, 1);
  }
});

test('serializes requests and releases its slot after an upstream failure', async () => {
  let unblock;
  const blocker = new Promise((resolve) => { unblock = resolve; });
  let enter;
  const entered = new Promise((resolve) => { enter = resolve; });
  let calls = 0;
  let inFlight = 0;
  let maximum = 0;
  const route = loadRoute(async () => {
    calls++; inFlight++; maximum = Math.max(maximum, inFlight);
    if (calls === 1) { enter(); await blocker; inFlight--; throw new Error('first failed'); }
    inFlight--; return mp3(false);
  });
  const first = route.POST(request());
  await entered;
  const second = route.POST(request());
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  unblock();
  assert.equal((await first).status, 502);
  assert.equal((await second).status, 200);
  assert.equal(maximum, 1);
});

test('aborted queued requests never reach the paid upstream', async () => {
  let unblock, enter;
  const blocker = new Promise((resolve) => { unblock = resolve; });
  const entered = new Promise((resolve) => { enter = resolve; });
  let calls = 0;
  const route = loadRoute(async () => { calls++; enter(); await blocker; return mp3(); });
  const first = route.POST(request());
  await entered;
  const controller = new AbortController();
  const second = route.POST(request(undefined, { signal: controller.signal }));
  await new Promise((resolve) => setImmediate(resolve));
  controller.abort();
  assert.equal((await second).status, 504);
  unblock();
  assert.equal((await first).status, 200);
  assert.equal(calls, 1);
});

test('enforces its total deadline including a stalled provider stream', async () => {
  let calls = 0;
  const route = loadRoute(async () => {
    calls++;
    return new Response(new ReadableStream({ start() {} }), { headers: { 'Content-Type': 'audio/mpeg' } });
  }, { setTimeout: (callback, ms) => setTimeout(callback, ms === 150000 ? 20 : ms) });
  const response = await route.POST(request());
  assert.equal(response.status, 504);
  assert.equal(calls, 1);
});

test('missing server voice is unavailable without touching the upstream', async () => {
  let calls = 0;
  const route = loadRoute(async () => { calls++; return mp3(); }, { env: { NOIZ_VOICE_ID: '' } });
  assert.equal((await route.POST(request())).status, 503);
  assert.equal(calls, 0);
});
