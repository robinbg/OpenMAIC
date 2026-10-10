import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/server/access-token';
import { DEMO_COOKIE, verifyDemoGrant } from '@/lib/server/codemate-demo-access';

export const dynamic = 'force-dynamic';

export async function GET(request?: NextRequest) {
  const accessCode = process.env.ACCESS_CODE;
  const enabled = !!accessCode;
  const ids = request?.nextUrl.searchParams.getAll('classroomId') ?? [];
  const validQuery =
    ids.length === 0 || (ids.length === 1 && /^[A-Za-z0-9_-]{1,128}$/.test(ids[0]));
  const respond = (data: Record<string, unknown>) =>
    NextResponse.json(
      { success: true, ...data },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  if (!validQuery) return respond({ enabled, authenticated: false, expiresAt: null });
  const cookieStore = await cookies();
  const demoToken = cookieStore.get(DEMO_COOKIE)?.value;
  if (demoToken) {
    const grant = await verifyDemoGrant(demoToken, process.env.CODEMATE_OPENMAIC_LAUNCH_SECRET);
    const matched = !!grant && (ids.length === 0 || grant.classroomId === ids[0]);
    return respond({
      enabled,
      authenticated: matched,
      scope: 'demo',
      classroomId: matched ? grant?.classroomId : undefined,
      expiresAt: matched ? grant?.exp : null,
    });
  }
  const token = cookieStore.get('openmaic_access')?.value;
  return respond({
    enabled,
    authenticated: !!accessCode && !!token && verifyAccessToken(token, accessCode),
    expiresAt: null,
  });
}
