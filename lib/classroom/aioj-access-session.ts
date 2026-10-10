import { getAiojClassroomLaunchUrl, getAiojParentOrigin } from '@/lib/config/codemate-integration';

export interface AiojAccessStatus {
  classroomId: string;
  loading: boolean;
  authenticated: boolean;
  expiresAt: number | null;
}

export interface AiojAccessBrowser {
  now(): number;
  fetchStatus(classroomId: string, signal: AbortSignal): Promise<unknown>;
  setTimer(callback: () => void, delay: number): number;
  clearTimer(timer: number): void;
  onResume(callback: () => void): () => void;
  isEmbedded: boolean;
  notifyParent(
    message: { source: 'openmaic'; type: 'access-required'; classroomId: string },
    origin: string,
  ): void;
  readRetryAt(classroomId: string): number | null;
  writeRetryAt(classroomId: string, timestamp: number): boolean;
  replace(url: string): void;
}

const RETRY_INTERVAL_MS = 5 * 60 * 1000;

/** Observe the existing grant only. Recovery never generates or imports a classroom. */
export function startAiojAccessSession(
  browser: AiojAccessBrowser,
  parentOrigin: string,
  classroomId: string,
  onStatus: (status: AiojAccessStatus) => void,
): () => void {
  const origin = getAiojParentOrigin(parentOrigin);
  const launchUrl = getAiojClassroomLaunchUrl(parentOrigin, classroomId);
  if (!origin) throw new Error('Invalid AIOJ parent origin');
  let disposed = false;
  let version = 0;
  let timer: number | null = null;
  let pending: AbortController | null = null;
  let requestTimer: number | null = null;
  let grantExpiresAt: number | null = null;
  let notified = false;
  let recoveryAttempted = false;
  const clearTimer = () => {
    if (timer !== null) browser.clearTimer(timer);
    timer = null;
  };
  const reportDenied = () => {
    onStatus({ classroomId, loading: false, authenticated: false, expiresAt: null });
    if (browser.isEmbedded) {
      if (!notified) {
        notified = true;
        browser.notifyParent({ source: 'openmaic', type: 'access-required', classroomId }, origin);
      }
      return;
    }
    if (recoveryAttempted) return;
    recoveryAttempted = true;
    const now = browser.now();
    const lastRetry = browser.readRetryAt(classroomId);
    // A failed return to this page must not keep bouncing between applications.
    // If storage is unavailable, leave the explicit AIOJ entrance as the fallback.
    if (lastRetry !== null && (lastRetry > now || now - lastRetry < RETRY_INTERVAL_MS)) return;
    if (browser.writeRetryAt(classroomId, now)) browser.replace(launchUrl);
  };
  const check = async () => {
    if (disposed) return;
    clearTimer();
    if (requestTimer !== null) browser.clearTimer(requestTimer);
    requestTimer = null;
    pending?.abort();
    pending = new AbortController();
    const requestVersion = ++version;
    if (grantExpiresAt !== null && grantExpiresAt <= browser.now()) {
      onStatus({ classroomId, loading: true, authenticated: false, expiresAt: null });
    }
    requestTimer = browser.setTimer(() => {
      if (disposed || requestVersion !== version) return;
      requestTimer = null;
      version += 1;
      pending?.abort();
      reportDenied();
    }, 10000);
    try {
      const data = await browser.fetchStatus(classroomId, pending.signal);
      if (disposed || requestVersion !== version) return;
      const result = data as Record<string, unknown> | null;
      const now = browser.now();
      const demo = result?.scope === 'demo';
      const valid =
        result?.success === true &&
        result.authenticated === true &&
        (demo
          ? result.classroomId === classroomId &&
            Number.isSafeInteger(result.expiresAt) &&
            (result.expiresAt as number) > now
          : result.enabled === true && result.scope === undefined);
      if (!valid) {
        reportDenied();
        return;
      }
      notified = false;
      const expiresAt = demo ? (result!.expiresAt as number) : null;
      grantExpiresAt = expiresAt;
      onStatus({ classroomId, loading: false, authenticated: true, expiresAt });
      if (expiresAt !== null)
        timer = browser.setTimer(
          () => {
            void check();
          },
          expiresAt - now + 25,
        );
    } catch {
      if (!disposed && requestVersion === version) reportDenied();
    } finally {
      if (requestVersion === version && requestTimer !== null) {
        browser.clearTimer(requestTimer);
        requestTimer = null;
      }
    }
  };
  onStatus({ classroomId, loading: true, authenticated: false, expiresAt: null });
  const stopResume = browser.onResume(() => {
    void check();
  });
  void check();
  return () => {
    disposed = true;
    version += 1;
    pending?.abort();
    if (requestTimer !== null) browser.clearTimer(requestTimer);
    clearTimer();
    stopResume();
  };
}

export function createAiojAccessBrowser(): AiojAccessBrowser {
  const retryKey = (classroomId: string) => `aioj-classroom-recovery:${classroomId}`;
  return {
    now: () => Date.now(),
    async fetchStatus(classroomId, signal) {
      const query = new URLSearchParams({ classroomId });
      const response = await fetch(`/api/access-code/status?${query}`, {
        cache: 'no-store',
        signal,
      });
      if (!response.ok) throw new Error('Classroom access could not be checked');
      return response.json();
    },
    setTimer: (callback, delay) => window.setTimeout(callback, delay),
    clearTimer: (timer) => window.clearTimeout(timer),
    onResume(callback) {
      const onVisible = () => {
        if (document.visibilityState === 'visible') callback();
      };
      window.addEventListener('focus', callback);
      window.addEventListener('pageshow', callback);
      document.addEventListener('visibilitychange', onVisible);
      return () => {
        window.removeEventListener('focus', callback);
        window.removeEventListener('pageshow', callback);
        document.removeEventListener('visibilitychange', onVisible);
      };
    },
    isEmbedded: window.parent !== window,
    notifyParent: (message, origin) => window.parent.postMessage(message, origin),
    readRetryAt(classroomId) {
      try {
        const value = window.sessionStorage.getItem(retryKey(classroomId));
        const timestamp = value === null ? NaN : Number(value);
        return Number.isSafeInteger(timestamp) && timestamp >= 0 ? timestamp : null;
      } catch {
        return null;
      }
    },
    writeRetryAt(classroomId, timestamp) {
      try {
        window.sessionStorage.setItem(retryKey(classroomId), String(timestamp));
        return true;
      } catch {
        return false;
      }
    },
    replace: (url) => window.location.replace(url),
  };
}
