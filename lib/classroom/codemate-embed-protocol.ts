/** The embed bridge only accepts a small presentation-control vocabulary. */
export interface CodeMateVisualCommand {
  source: 'codemate';
  type: 'visual-command';
  action: 'show' | 'play' | 'pause';
  sceneId?: string;
}

export function isCodeMateParentMessage(source: unknown, origin: string, parent: unknown, allowedOrigin: string | null): boolean {
  return !!allowedOrigin && source === parent && origin === allowedOrigin;
}

export function resolveCodeMateParentOrigin(configured: string | undefined, referrer: string): string | null {
  try {
    const url = new URL(configured || referrer);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function parseCodeMateVisualCommand(
  input: unknown,
  classroomId: string,
  sceneIds: readonly string[],
): CodeMateVisualCommand | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const data = input as Record<string, unknown>;
  if (data.source !== 'codemate' || data.type !== 'visual-command'
    || !['show', 'play', 'pause'].includes(data.action as string)) return null;
  if (data.classroomId !== undefined && data.classroomId !== classroomId) return null;
  if (data.sceneId !== undefined
    && (typeof data.sceneId !== 'string' || !sceneIds.includes(data.sceneId))) return null;
  return {
    source: 'codemate', type: 'visual-command', action: data.action as CodeMateVisualCommand['action'],
    ...(typeof data.sceneId === 'string' ? { sceneId: data.sceneId } : {}),
  };
}
