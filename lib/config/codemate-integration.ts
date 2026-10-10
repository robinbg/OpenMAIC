/** A fixed deployment origin, never a referrer or a URL supplied by the viewer. */
export function getAiojParentOrigin(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.pathname !== '/' ||
      url.search ||
      url.hash
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getAiojClassroomId(pathname: string): string | null {
  return /^\/classroom\/([A-Za-z0-9_-]{1,128})$/.exec(pathname)?.[1] ?? null;
}

export function getAiojClassroomLaunchUrl(parentOrigin: string, classroomId: string): string {
  const origin = getAiojParentOrigin(parentOrigin);
  if (!origin || !/^[A-Za-z0-9_-]{1,128}$/.test(classroomId)) {
    throw new Error('Invalid AIOJ classroom entrance');
  }
  const url = new URL('/api/ai-correction/openmaic/launch', origin);
  url.searchParams.set('classroomId', classroomId);
  return url.href;
}
