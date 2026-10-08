/** Read-only classroom grants. Uses Web Crypto so it also runs in Edge middleware. */
export const DEMO_COOKIE = 'openmaic_codemate_demo';
export const DEMO_MAX_AGE_MS = 30 * 60 * 1000;

export interface DemoGrant {
  scope: 'demo';
  classroomId: string;
  exp: number;
}

export async function verifyDemoGrant(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): Promise<DemoGrant | null> {
  if (!token || !secret || token.length > 2048) return null;
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
  try {
    const [payload, signature] = parts;
    const decode = (value: string) =>
      Uint8Array.from(atob(value.replace(/-/g, '+').replace(/_/g, '/')), (character) =>
        character.charCodeAt(0),
      );
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    );
    if (
      !(await crypto.subtle.verify(
        'HMAC',
        key,
        decode(signature),
        new TextEncoder().encode(`codemate-demo:${payload}`),
      ))
    )
      return null;
    const data = JSON.parse(new TextDecoder().decode(decode(payload)));
    if (
      !data ||
      data.scope !== 'demo' ||
      typeof data.classroomId !== 'string' ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(data.classroomId) ||
      !Number.isSafeInteger(data.exp) ||
      data.exp <= now ||
      data.exp > now + DEMO_MAX_AGE_MS
    )
      return null;
    return { scope: 'demo', classroomId: data.classroomId, exp: data.exp };
  } catch {
    return null;
  }
}

/** Classroom reads and scoped quiz grading only; no editing or generation. */
export function demoRequestAllowed(method: string, url: URL, grant: DemoGrant): boolean {
  // The grading route independently verifies this grant and loads the question
  // from its classroom. This does not authorize arbitrary prompts or models.
  if (method === 'POST' && url.pathname === '/api/quiz-grade' && !url.search) return true;
  if (method !== 'GET') return false;
  const { pathname } = url;
  if (pathname === `/classroom/${grant.classroomId}`) return true;
  if (pathname === '/api/classroom') {
    return (
      url.searchParams.getAll('id').length === 1 && url.searchParams.get('id') === grant.classroomId
    );
  }
  if (pathname === '/api/server-providers' || pathname === '/api/access-code/status') return true;
  const mediaPrefix = `/api/classroom-media/${grant.classroomId}/media/`;
  if (pathname.startsWith(mediaPrefix)) {
    return /^[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:mp3|wav|ogg|mp4|webm|mov|png|jpg|jpeg|webp|gif)$/.test(
      pathname.slice(mediaPrefix.length),
    );
  }
  const audioPrefix = `/api/classroom-media/${grant.classroomId}/audio/`;
  if (pathname.startsWith(audioPrefix)) {
    return /^[A-Za-z0-9_-][A-Za-z0-9_.-]*\.(?:mp3|wav|ogg|aac)$/.test(
      pathname.slice(audioPrefix.length),
    );
  }
  return (
    /^\/(?:fonts|avatars|logos|icons|images)\/[A-Za-z0-9_./-]+\.(?:woff2?|ttf|otf|svg|png|jpg|jpeg|webp|gif|ico)$/.test(
      pathname,
    ) && !pathname.split('/').some((part) => part === '.' || part === '..')
  );
}
