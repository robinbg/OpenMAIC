import { cookies } from 'next/headers';
import { apiSuccess } from '@/lib/server/api-response';
import { verifyAccessToken } from '@/lib/server/access-token';
import { DEMO_COOKIE, verifyDemoGrant } from '@/lib/server/codemate-demo-access';

export async function GET() {
  const accessCode = process.env.ACCESS_CODE;
  const enabled = !!accessCode;
  const cookieStore = await cookies();
  const demoToken = cookieStore.get(DEMO_COOKIE)?.value;
  if (demoToken) {
    const grant = await verifyDemoGrant(demoToken, process.env.CODEMATE_OPENMAIC_LAUNCH_SECRET);
    return apiSuccess({ enabled, authenticated: !!grant, scope: 'demo', classroomId: grant?.classroomId });
  }
  const token = cookieStore.get('openmaic_access')?.value;
  return apiSuccess({ enabled, authenticated: !!accessCode && !!token && verifyAccessToken(token, accessCode) });
}
