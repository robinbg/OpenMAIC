#!/usr/bin/env node
'use strict';

// Run: TYPESCRIPT_PATH=/data/dev-codemate/aioj-core/node_modules/typescript node --test codemate-integration/test-launch.cjs
// Uses only node:test plus TypeScript to execute the real route with a small Next server API mock.
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

function findTypeScript() {
  const candidates = [process.env.TYPESCRIPT_PATH, 'typescript', '/data/dev-codemate/aioj-core/node_modules/typescript'].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
  }
  throw new Error('TypeScript was not found. Set TYPESCRIPT_PATH to the installed typescript package directory.');
}

const ts = findTypeScript();
const routePath = process.env.OPENMAIC_LAUNCH_ROUTE || path.resolve(__dirname, '../app/api/access-code/codemate/route.ts');
const source = readFileSync(routePath, 'utf8');
const compiled = ts.transpileModule(source, {
  fileName: routePath,
  reportDiagnostics: true,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});
const syntaxErrors = (compiled.diagnostics || []).filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
assert.equal(syntaxErrors.length, 0, ts.formatDiagnosticsWithColorAndContext(syntaxErrors, {
  getCanonicalFileName: (fileName) => fileName,
  getCurrentDirectory: () => __dirname,
  getNewLine: () => '\n',
}));

const NOW = 1800000000000;
const SECRET = 'test-only-launch-secret-not-a-production-credential';
const ACCESS_CODE = 'test-only-openmaic-access-code';
const PUBLIC_URL = 'https://classroom.example.test';
const BASE_ENV = {
  CODEMATE_OPENMAIC_LAUNCH_SECRET: SECRET,
  ACCESS_CODE,
  CODEMATE_OPENMAIC_PUBLIC_URL: PUBLIC_URL,
};

class MockNextRequest {
  constructor(url, { headers } = {}) {
    this.nextUrl = new URL(url);
    this.headers = new Headers(headers);
    const jar = new Map();
    for (const part of (this.headers.get('cookie') || '').split(';')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const index = trimmed.indexOf('=');
      if (index <= 0) continue;
      jar.set(trimmed.slice(0, index), trimmed.slice(index + 1));
    }
    this.cookies = { get: (name) => (jar.has(name) ? { name, value: jar.get(name) } : undefined) };
  }
}

class MockNextResponse {
  constructor(body, { status = 200, headers } = {}) {
    this.body = body;
    this.status = status;
    this.headers = new Headers(headers);
    const values = new Map();
    this.cookies = {
      set(name, value, options) { values.set(name, { name, value, ...options }); },
      get(name) { return values.get(name); },
      getAll() { return Array.from(values.values()); },
    };
  }

  static redirect(url, status = 307) {
    return new MockNextResponse(null, { status, headers: { Location: String(url) } });
  }
}

function loadRoute(overrides = {}) {
  const environment = { ...BASE_ENV, ...overrides };
  const module = { exports: {} };
  class FixedDate extends Date {
    static now() { return NOW; }
  }
  vm.runInNewContext(compiled.outputText, {
    module,
    exports: module.exports,
    process: { env: environment },
    Buffer,
    URL,
    Date: FixedDate,
    require(name) {
      if (name === 'next/server') return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
      if (name === 'node:crypto') return require(name);
      throw new Error(`Unexpected route dependency: ${name}`);
    },
  }, { filename: routePath });
  return module.exports.GET;
}

function signRaw(raw, secret = SECRET) {
  const payload = Buffer.from(raw).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(payload).digest('base64url')}`;
}

function sign(data = { classroomId: 'classroom_-01', exp: NOW + 60000 }, secret = SECRET) {
  return signRaw(JSON.stringify(data), secret);
}

function makeRequest(token, origin = PUBLIC_URL, query = {}, extraHeaders = {}) {
  const url = new URL('/api/access-code/codemate', origin);
  if (token !== undefined) url.searchParams.set('token', token);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  return new MockNextRequest(url.href, {
    headers: { host: 'attacker.invalid', 'x-forwarded-host': 'attacker.invalid', 'x-forwarded-proto': 'http', ...extraHeaders },
  });
}

function assertDenied(response) {
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.equal(response.cookies.getAll().length, 0);
}

function mintDemoGrant(classroomId, exp = NOW + 1800000, secret = SECRET) {
  const payload = Buffer.from(JSON.stringify({ scope: 'demo', classroomId, exp })).toString('base64url');
  return `${payload}.${createHmac('sha256', secret).update(`codemate-demo:${payload}`).digest('base64url')}`;
}

test('valid signed launch redirects to the configured classroom and mints the native access cookie', async () => {
  const response = await loadRoute()(makeRequest(sign()));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), `${PUBLIC_URL}/classroom/classroom_-01`);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  const cookie = response.cookies.get('openmaic_access');
  assert.ok(cookie);
  assert.equal(cookie.value, `${NOW}.${createHmac('sha256', ACCESS_CODE).update(String(NOW)).digest('hex')}`);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.sameSite, 'lax');
  assert.equal(cookie.path, '/');
  assert.equal(cookie.maxAge, 1800);
  assert.equal(cookie.domain, undefined, 'cookie must remain host-only');
  assert.equal(response.cookies.getAll().length, 2);
  assert.equal(response.cookies.get('openmaic_codemate_demo').maxAge, 0);
});

test('demo launch only issues a signed classroom-scoped expiring grant, never a global access cookie', async () => {
  const response = await loadRoute()(makeRequest(sign({ scope: 'demo', classroomId: 'demo-room', exp: NOW + 60000 })));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), `${PUBLIC_URL}/classroom/demo-room`);
  assert.equal(response.cookies.get('openmaic_access'), undefined);
  assert.equal(response.cookies.getAll().length, 1);
  const cookie = response.cookies.get('openmaic_codemate_demo');
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.secure, true);
  assert.equal(cookie.maxAge, 1800);
  const [payload, signature] = cookie.value.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url')), { scope: 'demo', classroomId: 'demo-room', exp: NOW + 1800000 });
  assert.equal(signature, createHmac('sha256', SECRET).update(`codemate-demo:${payload}`).digest('base64url'));
  assert.notEqual(signature, createHmac('sha256', SECRET).update(payload).digest('base64url'), 'demo cookie must not be reusable as a launch token');
});

test('signed classroom scope stays read-only even when the embed query is removed or altered', async () => {
  const token = sign({ scope: 'classroom', classroomId: 'student-room', exp: NOW + 60000 });
  const route = loadRoute();
  for (const query of [{}, { codemateEmbed: '1' }, { codemateEmbed: '0' }, { codemateEmbed: 'true' }]) {
    const response = await route(makeRequest(token, PUBLIC_URL, query));
    assert.equal(response.status, 303);
    assert.equal(response.cookies.get('openmaic_access'), undefined);
    assert.equal(response.cookies.getAll().length, 1);
    const grantCookie = response.cookies.get('openmaic_codemate_demo');
    assert.equal(grantCookie.maxAge, 1800);
    const [payload, signature] = grantCookie.value.split('.');
    assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url')), {
      scope: 'demo', classroomId: 'student-room', exp: NOW + 1800000,
    });
    assert.equal(signature, createHmac('sha256', SECRET).update(`codemate-demo:${payload}`).digest('base64url'));
  }
  const [payload, signature] = token.split('.');
  const unsignedUpgrade = Buffer.from(JSON.stringify({ classroomId: 'student-room', exp: NOW + 60000 })).toString('base64url');
  assertDenied(await route(makeRequest(`${unsignedUpgrade}.${signature}`)));
  assert.ok(payload);
});

test('embedded launch rejects old unscoped tokens while ordinary standalone access remains compatible', async () => {
  const route = loadRoute();
  assertDenied(await route(makeRequest(sign(), PUBLIC_URL, { codemateEmbed: '1' })));
  const standalone = await route(makeRequest(sign()));
  assert.equal(standalone.status, 303);
  assert.ok(standalone.cookies.get('openmaic_access'));
});

test('unknown launch scopes fail closed', async () => {
  for (const scope of ['admin', 'readonly', '', null, {}, 1]) {
    assertDenied(await loadRoute()(makeRequest(sign({ scope, classroomId: 'room', exp: NOW + 60000 }))));
  }
});

test('embedded launch preserves only the presentation flag and safe scene identifier through the 303', async () => {
  const route = loadRoute();
  const scoped = sign({ scope: 'classroom', classroomId: 'classroom_-01', exp: NOW + 60000 });
  const embedded = await route(makeRequest(scoped, PUBLIC_URL, { codemateEmbed: '1', sceneId: 'scene_two-1', parentOrigin: 'https://evil.test' }));
  assert.equal(embedded.headers.get('location'), `${PUBLIC_URL}/classroom/classroom_-01?codemateEmbed=1&sceneId=scene_two-1`);
  for (const sceneId of ['../secret', '//evil.test', 'room?secret=x', 'a'.repeat(129)]) {
    const response = await route(makeRequest(scoped, PUBLIC_URL, { codemateEmbed: '1', sceneId }));
    assert.equal(response.headers.get('location'), `${PUBLIC_URL}/classroom/classroom_-01?codemateEmbed=1`);
  }
  const ordinary = await route(makeRequest(sign(), PUBLIC_URL, { codemateEmbed: 'true', sceneId: 'scene_two-1' }));
  assert.equal(ordinary.headers.get('location'), `${PUBLIC_URL}/classroom/classroom_-01`);
});

test('signature verification rejects the wrong secret, tampered payload and tampered signature', async () => {
  const original = sign();
  const [payload, signature] = original.split('.');
  const changedPayload = Buffer.from(JSON.stringify({ classroomId: 'different-room', exp: NOW + 60000 })).toString('base64url');
  const changedSignature = `${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`;
  const candidates = [sign(undefined, 'wrong-secret'), `${changedPayload}.${signature}`, `${payload}.${changedSignature}`, `${payload}.short`];
  const route = loadRoute();
  for (const candidate of candidates) assertDenied(await route(makeRequest(candidate)));
});

test('expired and excessively future-dated launches are denied, including expiry at the current instant', async () => {
  const route = loadRoute();
  const invalidExpiry = [NOW - 1, NOW, NOW + 90001, String(NOW + 60000), null, 1.5, Number.MAX_SAFE_INTEGER + 1];
  for (const exp of invalidExpiry) assertDenied(await route(makeRequest(sign({ classroomId: 'room', exp }))));
  assertDenied(await route(makeRequest(sign({ classroomId: 'room' }))));
  for (const exp of [NOW + 1, NOW + 60000, NOW + 90000]) {
    assert.equal((await route(makeRequest(sign({ classroomId: 'room', exp })))).status, 303);
  }
});

test('expired launch replays redeem through a still-valid demo grant for the same classroom', async () => {
  const route = loadRoute();
  const cookie = { cookie: `${'openmaic_codemate_demo'}=${mintDemoGrant('replay-room')}` };
  const embedded = await route(makeRequest(
    sign({ scope: 'classroom', classroomId: 'replay-room', exp: NOW - 1 }),
    PUBLIC_URL, { codemateEmbed: '1', sceneId: 'scene_two-1' }, cookie,
  ));
  assert.equal(embedded.status, 303);
  assert.equal(embedded.headers.get('location'), `${PUBLIC_URL}/classroom/replay-room?codemateEmbed=1&sceneId=scene_two-1`);
  assert.equal(embedded.cookies.get('openmaic_access'), undefined);
  assert.equal(embedded.cookies.getAll().length, 1);
  const refreshed = embedded.cookies.get('openmaic_codemate_demo');
  assert.equal(refreshed.maxAge, 1800);
  const [payload, signature] = refreshed.value.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(payload, 'base64url')), { scope: 'demo', classroomId: 'replay-room', exp: NOW + 1800000 });
  assert.equal(signature, createHmac('sha256', SECRET).update(`codemate-demo:${payload}`).digest('base64url'));

  const unscopedReplay = await route(makeRequest(
    sign({ classroomId: 'replay-room', exp: NOW - 1 }), PUBLIC_URL, {}, cookie,
  ));
  assert.equal(unscopedReplay.status, 303);
  assert.equal(unscopedReplay.headers.get('location'), `${PUBLIC_URL}/classroom/replay-room`);
  assert.equal(unscopedReplay.cookies.get('openmaic_access'), undefined, 'redemption must stay read-only');
  assert.ok(unscopedReplay.cookies.get('openmaic_codemate_demo'));
});

test('expired launch redemption fails closed without a valid matching demo grant', async () => {
  const route = loadRoute();
  const token = sign({ scope: 'classroom', classroomId: 'replay-room', exp: NOW - 1 });
  assertDenied(await route(makeRequest(token)));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_codemate_demo=${mintDemoGrant('other-room')}` })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_codemate_demo=${mintDemoGrant('replay-room', NOW)}` })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_codemate_demo=${mintDemoGrant('replay-room', NOW + 1800001)}` })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_codemate_demo=${mintDemoGrant('replay-room', NOW + 1800000, 'wrong-secret')}` })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_codemate_demo=tampered.${mintDemoGrant('replay-room').split('.')[1]}` })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: 'openmaic_codemate_demo=' })));
  assertDenied(await route(makeRequest(token, PUBLIC_URL, {}, { cookie: `openmaic_access=${NOW}.${createHmac('sha256', ACCESS_CODE).update(String(NOW)).digest('hex')}` })));
});

test('invalid classroom identifiers cannot become paths, URLs, query strings or response headers', async () => {
  const route = loadRoute();
  const identifiers = ['', '../secret', '..', '//attacker.invalid', 'https://attacker.invalid', 'room/a', '%2e%2e', 'room?token=x', 'room#x', 'room\\x', 'room\r\nSet-Cookie:x', 'room x', '课堂', 'a'.repeat(129), 123, null, {}];
  for (const classroomId of identifiers) assertDenied(await route(makeRequest(sign({ classroomId, exp: NOW + 60000 }))));
  assertDenied(await route(makeRequest(sign({ exp: NOW + 60000 }))));
  assert.equal((await route(makeRequest(sign({ classroomId: 'a'.repeat(128), exp: NOW + 60000 })))).status, 303);
});

test('malformed token shapes, non-JSON payloads and oversized tokens fail closed without cookies', async () => {
  const route = loadRoute();
  for (const token of [undefined, '', 'one', 'one.two.three', '.two', 'one.', 'one.two=', 'one+.two', 'a'.repeat(2049)]) {
    assertDenied(await route(makeRequest(token)));
  }
  for (const raw of ['not json', '{', 'null', '42', '"text"', '[]']) {
    assertDenied(await route(makeRequest(signRaw(raw))));
  }
  assertDenied(await route(makeRequest(sign({ classroomId: 'room', exp: NOW + 60000, filler: 'x'.repeat(2048) }))));
});

test('missing signing secret, access code or public URL disables launch', async () => {
  for (const key of Object.keys(BASE_ENV)) {
    for (const value of ['', undefined]) assertDenied(await loadRoute({ [key]: value })(makeRequest(sign())));
  }
});

test('invalid public URL configuration cannot create unsafe redirects or cookies', async () => {
  const invalidOrigins = ['not-a-url', '//attacker.invalid', 'javascript:alert(1)', 'data:text/html,unsafe', 'file:///tmp/room', 'ftp://classroom.example.test', 'https://user:pass@classroom.example.test', 'https://user@classroom.example.test'];
  for (const origin of invalidOrigins) {
    assertDenied(await loadRoute({ CODEMATE_OPENMAIC_PUBLIC_URL: origin })(makeRequest(sign())));
  }
});

test('configured public origin is the redirect allowlist; inbound host and arbitrary redirect fields are ignored', async () => {
  const token = sign({
    classroomId: 'room', exp: NOW + 60000, redirect: 'https://attacker.invalid', url: 'https://attacker.invalid',
  });
  const response = await loadRoute({ CODEMATE_OPENMAIC_PUBLIC_URL: `${PUBLIC_URL}:8443/ignored?url=unsafe#fragment` })(
    makeRequest(token, 'https://attacker.invalid', { redirect: 'https://attacker.invalid', next: '//attacker.invalid' })
  );
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'https://classroom.example.test:8443/classroom/room');
  assert.equal(response.cookies.get('openmaic_access').secure, true, 'forwarded headers must not downgrade secure cookies');
});

test('HTTP development origin uses a host-only non-Secure cookie while preserving HttpOnly, expiry and target port', async () => {
  const response = await loadRoute({ CODEMATE_OPENMAIC_PUBLIC_URL: 'http://127.0.0.1:3030' })(makeRequest(sign()));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), 'http://127.0.0.1:3030/classroom/classroom_-01');
  const cookie = response.cookies.get('openmaic_access');
  assert.equal(cookie.secure, false);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, 'lax');
  assert.equal(cookie.maxAge, 1800);
  assert.equal(cookie.domain, undefined);
});
