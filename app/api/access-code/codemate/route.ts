/** CodeMate authenticated launch. All classroom generation and playback stay in OpenMAIC. */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEMO_COOKIE = 'openmaic_codemate_demo';
const DEMO_MAX_AGE_MS = 30 * 60 * 1000;

/** Mirrors verifyDemoGrant from lib/server/codemate-demo-access.ts on the Node runtime. */
function readDemoGrant(cookie: string | undefined, secret: string, now: number): { classroomId: string } | null {
  if (!cookie || cookie.length > 2048) return null;
  const parts = cookie.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
  try {
    const [payload, signature] = parts;
    const expected = createHmac('sha256', secret).update(`codemate-demo:${payload}`).digest('base64url');
    if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data || data.scope !== 'demo'
      || typeof data.classroomId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(data.classroomId)
      || !Number.isSafeInteger(data.exp) || data.exp <= now || data.exp > now + DEMO_MAX_AGE_MS) return null;
    return { classroomId: data.classroomId };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const secret = process.env.CODEMATE_OPENMAIC_LAUNCH_SECRET;
  const accessCode = process.env.ACCESS_CODE;
  const publicUrl = process.env.CODEMATE_OPENMAIC_PUBLIC_URL;
  const deny = () => new NextResponse('课堂入口已过期，请返回 CodeMate 重新打开课堂。', {
    status: 401,
    headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
  });
  if (!secret || !accessCode || !publicUrl) return deny();
  const token = request.nextUrl.searchParams.get('token') || '';
  if (token.length > 2048) return deny();
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return deny();
  const [payload, signature] = parts;
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return deny();
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const now = Date.now();
    if (!Number.isSafeInteger(data.exp) || data.exp > now + 90000
      || typeof data.classroomId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(data.classroomId)) return deny();
    if (data.scope !== undefined && data.scope !== 'demo' && data.scope !== 'classroom') return deny();
    if (data.exp <= now) {
      // Browsers replay the iframe src on tab restore, so a validly signed but
      // expired link arrives long after the initial redirect. Redeem it only
      // against a still-valid read-only demo grant for the same classroom:
      // this grants nothing the visitor did not already hold.
      const grant = readDemoGrant(request.cookies?.get(DEMO_COOKIE)?.value, secret, now);
      if (!grant || grant.classroomId !== data.classroomId) return deny();
      data.scope = 'demo';
    }
    const embedded = request.nextUrl.searchParams.get('codemateEmbed') === '1';
    // Scope is signed: removing the presentation query must never turn a
    // student classroom grant into instance-wide native access.
    const classroomReadOnly = data.scope === 'demo' || data.scope === 'classroom';
    if (embedded && !classroomReadOnly) return deny();
    const origin = new URL(publicUrl);
    if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password) return deny();
    const destination = new URL(`/classroom/${data.classroomId}`, origin.origin);
    if (embedded) {
      destination.searchParams.set('codemateEmbed', '1');
      const sceneId = request.nextUrl.searchParams.get('sceneId');
      if (sceneId && /^[A-Za-z0-9_-]{1,128}$/.test(sceneId)) destination.searchParams.set('sceneId', sceneId);
    }
    const response = NextResponse.redirect(destination, 303);
    const options = { httpOnly: true, secure: origin.protocol === 'https:', sameSite: 'lax' as const, path: '/', maxAge: 1800 };
    if (classroomReadOnly) {
      const grant = Buffer.from(JSON.stringify({ scope: 'demo', classroomId: data.classroomId, exp: now + 1800000 })).toString('base64url');
      const signed = createHmac('sha256', secret).update(`codemate-demo:${grant}`).digest('base64url');
      response.cookies.set('openmaic_codemate_demo', `${grant}.${signed}`, options);
    } else {
      const timestamp = String(now);
      const accessToken = `${timestamp}.${createHmac('sha256', accessCode).update(timestamp).digest('hex')}`;
      response.cookies.set('openmaic_access', accessToken, options);
      // A normal authenticated launch supersedes a previous read-only demo.
      response.cookies.set('openmaic_codemate_demo', '', { ...options, maxAge: 0 });
    }
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch {
    return deny();
  }
}
