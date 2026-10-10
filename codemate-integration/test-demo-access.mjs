import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createHmac, webcrypto } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NOW = 1800000000000;
const SECRET = 'demo-test-secret';
const ACCESS = 'native-test-access';
const GRANT = { scope: 'demo', classroomId: 'demo-room', exp: NOW + 1800000 };

function sign(data = GRANT, secret = SECRET, prefix = 'codemate-demo:') {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  return `${payload}.${createHmac('sha256', secret)
    .update(prefix + payload)
    .digest('base64url')}`;
}
class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
  }
  static next() {
    return new Response('next');
  }
  static json(body, init) {
    return new Response(body, init);
  }
}
function request(pathname, method = 'GET', cookie = sign(), additionalCookies = {}) {
  const values = { openmaic_codemate_demo: cookie, ...additionalCookies };
  return {
    method,
    nextUrl: new URL(pathname, 'https://example.test'),
    cookies: { get: (name) => values[name] && { value: values[name] } },
  };
}
function compile(relative, imports = {}, overrides = {}) {
  const filename = path.join(ROOT, relative);
  const result = ts.transpileModule(readFileSync(filename, 'utf8'), {
    fileName: filename,
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  assert.equal(
    result.diagnostics?.filter((item) => item.category === ts.DiagnosticCategory.Error).length || 0,
    0,
  );
  const loaded = { exports: {} };
  class FixedDate extends Date {
    static now() {
      return NOW;
    }
  }
  vm.runInNewContext(
    result.outputText,
    {
      module: loaded,
      exports: loaded.exports,
      Uint8Array,
      ArrayBuffer,
      TextEncoder,
      TextDecoder,
      atob,
      crypto: webcrypto,
      Date: FixedDate,
      URL,
      process: {
        env: { ACCESS_CODE: ACCESS, CODEMATE_OPENMAIC_LAUNCH_SECRET: SECRET, ...overrides },
      },
      require: (name) => {
        if (name in imports) return imports[name];
        throw Error(`Unexpected dependency ${name}`);
      },
    },
    { filename },
  );
  return loaded.exports;
}
const helper = compile('lib/server/codemate-demo-access.ts');
const integration = compile('lib/config/codemate-integration.ts');
function middleware(overrides) {
  return compile(
    'middleware.ts',
    {
      'next/server': { NextResponse: Response },
      '@/lib/config/feature-flags': {
        isAgentRuntimeConfigured: () => false,
        isProWorkbenchEnabled: () => false,
      },
      '@/lib/server/codemate-demo-access': helper,
      '@/lib/config/codemate-integration': integration,
    },
    overrides,
  ).middleware;
}

test('signed grants are time-bound and reject tampering, wrong scope, wrong key and launch-token substitution', async () => {
  assert.equal((await helper.verifyDemoGrant(sign(), SECRET, NOW)).classroomId, 'demo-room');
  const candidates = [
    undefined,
    '',
    'a.b.c',
    sign(GRANT, 'wrong'),
    sign(GRANT, SECRET, ''),
    sign({ ...GRANT, scope: 'admin' }),
    sign({ ...GRANT, classroomId: '../other' }),
    sign({ ...GRANT, exp: NOW }),
    sign({ ...GRANT, exp: NOW + 1800001 }),
    sign({ ...GRANT, exp: String(NOW + 1000) }),
  ];
  const [payload, signature] = sign().split('.');
  candidates.push(`${payload}.${signature[0] === 'A' ? 'B' : 'A'}${signature.slice(1)}`);
  for (const token of candidates)
    assert.equal(await helper.verifyDemoGrant(token, SECRET, NOW), null);
  assert.equal(await helper.verifyDemoGrant(sign(), undefined, NOW), null);
  assert.equal(await helper.verifyDemoGrant(sign(), SECRET, GRANT.exp), null);
});

test('demo middleware allows only the target classroom, its media and read-only presentation configuration', async () => {
  const run = middleware();
  for (const url of [
    '/classroom/demo-room',
    '/api/classroom?id=demo-room',
    '/api/server-providers',
    '/api/classroom-media/demo-room/media/generated-123.mp3',
    '/avatars/teacher.png',
    '/fonts/ui.woff2',
  ]) {
    assert.equal((await run(request(url))).body, 'next', url);
  }
  for (const url of [
    '/classroom/other',
    '/',
    '/workbench',
    '/api/classroom?id=other',
    '/api/classroom',
    '/api/classroom?id=demo-room&id=other',
    '/api/classroom-media/other/media/generated-123.mp3',
    '/api/classroom-media/demo-room/media/secret.json',
    '/api/classroom-media/demo-room/media/%2e%2e/secret.mp3',
    '/api/generate',
    '/api/tts',
    '/api/settings',
    '/api/access-code/codemate-tts/audio/speech',
    '/api/access-code/verify',
  ]) {
    const response = await run(request(url));
    assert.ok(response.status >= 400, `${url}: ${response.status}`);
  }
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    for (const url of [
      '/api/classroom?id=demo-room',
      '/api/server-providers',
      '/api/access-code/status',
    ]) {
      assert.equal((await run(request(url, method))).status, 403, `${method} ${url}`);
    }
  }
});

test('demo cannot fall through to global access, even with a previous full-access cookie or no ACCESS_CODE', async () => {
  const timestamp = String(NOW);
  const full = `${timestamp}.${createHmac('sha256', ACCESS).update(timestamp).digest('hex')}`;
  assert.equal(
    (
      await middleware()(
        request('/api/classroom?id=other', 'GET', sign(), { openmaic_access: full }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await middleware()(
        request('/api/classroom?id=other', 'GET', 'invalid', { openmaic_access: full }),
      )
    ).status,
    401,
  );
  assert.equal(
    (await middleware({ ACCESS_CODE: '' })(request('/api/classroom?id=other'))).status,
    403,
  );
  assert.equal(
    (await middleware()(request('/api/classroom?id=other', 'GET', '', { openmaic_access: full })))
      .body,
    'next',
  );
  assert.equal((await middleware()(request('/api/classroom?id=other', 'GET', ''))).status, 401);
  for (const url of ['/api/access-code/codemate?token=replacement', '/api/access-code/status']) {
    assert.equal((await middleware()(request(url, 'GET', 'expired'))).body, 'next');
  }
});

test('status recognizes the scoped demo without implying global access; expired demos do not inherit full cookie auth', async () => {
  const getStatus = (token) =>
    compile('app/api/access-code/status/route.ts', {
      'next/headers': {
        cookies: async () => ({
          get: (name) => ({ value: name === 'openmaic_codemate_demo' ? token : 'global' }),
        }),
      },
      'next/server': { NextResponse: Response },
      '@/lib/server/access-token': { verifyAccessToken: () => true },
      '@/lib/server/codemate-demo-access': helper,
    })
      .GET()
      .then((response) => response.body);
  const valid = await getStatus(sign());
  assert.equal(valid.authenticated, true);
  assert.equal(valid.scope, 'demo');
  assert.equal(valid.classroomId, 'demo-room');
  const expired = await getStatus(sign({ ...GRANT, exp: NOW }));
  assert.equal(expired.authenticated, false);
});

test('AIOJ recovery allows only safe classroom GET shells while all data stays scoped', async () => {
  const run = middleware({ NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN: 'https://aioj.test' });
  for (const cookie of ['expired', sign(), '']) {
    assert.equal((await run(request('/classroom/other-room', 'GET', cookie))).body, 'next');
  }
  for (const pathname of [
    '/classroom/other-room/child',
    '/classroom/%2e%2e',
    '/api/classroom?id=other-room',
    '/api/classroom-media/other-room/audio/s.mp3',
    '/api/quiz-grade',
  ]) {
    assert.ok((await run(request(pathname, 'GET', 'expired'))).status >= 400, pathname);
  }
  assert.equal((await run(request('/classroom/other-room', 'POST', 'expired'))).status, 401);
  for (const origin of [
    '',
    'javascript:alert(1)',
    'https://user:pass@aioj.test',
    'https://aioj.test/path',
  ]) {
    assert.equal(
      (
        await middleware({ NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN: origin })(
          request('/classroom/other-room', 'GET', 'expired'),
        )
      ).status,
      401,
    );
  }
});

test('status matches classroom query, reports grant expiry and never caches auth state', async () => {
  const get = (token, query) =>
    compile('app/api/access-code/status/route.ts', {
      'next/headers': {
        cookies: async () => ({
          get: (name) => (name === 'openmaic_codemate_demo' ? { value: token } : undefined),
        }),
      },
      'next/server': { NextResponse: { json: (body, init) => ({ body, headers: init.headers }) } },
      '@/lib/server/access-token': { verifyAccessToken: () => true },
      '@/lib/server/codemate-demo-access': helper,
    }).GET({ nextUrl: new URL(`https://classroom.test/api/access-code/status${query}`) });
  const valid = await get(sign(), '?classroomId=demo-room');
  assert.equal(valid.body.authenticated, true);
  assert.equal(valid.body.expiresAt, GRANT.exp);
  assert.equal(valid.headers['Cache-Control'], 'no-store');
  for (const query of [
    '?classroomId=other',
    '?classroomId=../room',
    '?classroomId=a&classroomId=a',
    '?classroomId=',
  ]) {
    const result = await get(sign(), query);
    assert.equal(result.body.authenticated, false, query);
    assert.equal(result.body.expiresAt, null, query);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  }
  assert.equal(
    (await get(sign({ ...GRANT, exp: NOW }), '?classroomId=demo-room')).body.authenticated,
    false,
  );
});
