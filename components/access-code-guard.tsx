'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AccessCodeModal } from '@/components/access-code-modal';
import { useSettingsStore } from '@/lib/store/settings';
import { getAiojClassroomId, getAiojClassroomLaunchUrl } from '@/lib/config/codemate-integration';
import {
  AiojAccessStatus,
  createAiojAccessBrowser,
  startAiojAccessSession,
} from '@/lib/classroom/aioj-access-session';

export function AccessCodeGuard({
  children,
  parentOrigin = null,
}: {
  children: ReactNode;
  parentOrigin?: string | null;
}) {
  const pathname = usePathname() ?? '';
  const classroomId = getAiojClassroomId(pathname);
  const [aiojStatus, setAiojStatus] = useState<AiojAccessStatus | null>(null);
  const [status, setStatus] = useState({ enabled: false, authenticated: false, loading: true });

  useEffect(() => {
    if (!parentOrigin || !classroomId) return;
    return startAiojAccessSession(
      createAiojAccessBrowser(),
      parentOrigin,
      classroomId,
      setAiojStatus,
    );
  }, [parentOrigin, classroomId]);

  useEffect(() => {
    if (parentOrigin) return;
    let cancelled = false;
    const controller = new AbortController();
    fetch('/api/access-code/status', { cache: 'no-store', signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Access status unavailable');
        return res.json();
      })
      .then((data) => {
        if (!cancelled)
          setStatus({
            enabled: data.enabled === true,
            authenticated: data.authenticated === true,
            loading: false,
          });
      })
      .catch(() => {
        if (!cancelled) setStatus({ enabled: true, authenticated: false, loading: false });
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [parentOrigin]);

  if (parentOrigin) {
    const checked = classroomId && aiojStatus?.classroomId === classroomId ? aiojStatus : null;
    if (checked?.authenticated && !checked.loading) return <>{children}</>;
    const loading = classroomId && (!checked || checked.loading);
    const href = classroomId ? getAiojClassroomLaunchUrl(parentOrigin, classroomId) : parentOrigin;
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section
          className="max-w-md space-y-4 rounded-2xl border bg-card p-8 text-center"
          aria-live="polite"
        >
          <h1 className="text-xl font-semibold">多模态互动课堂</h1>
          <p className="text-sm text-muted-foreground">
            {loading
              ? '正在恢复 AIOJ 课堂…'
              : classroomId
                ? '请从 AIOJ 重新打开课堂，已有学习进度会保留。'
                : '请在 AIOJ 中打开你的互动课堂。'}
          </p>
          {!loading && (
            <a
              className="inline-flex rounded-lg bg-primary px-4 py-2 text-primary-foreground"
              href={href}
              target="_top"
            >
              返回 AIOJ 继续课堂
            </a>
          )}
        </section>
      </main>
    );
  }

  const needsAuth = !status.loading && status.enabled && !status.authenticated;
  return (
    <>
      {needsAuth && (
        <AccessCodeModal
          open={true}
          onSuccess={() => {
            setStatus((s) => ({ ...s, authenticated: true }));
            // Providers were gated before the native access cookie existed.
            void useSettingsStore.getState().fetchServerProviders();
          }}
        />
      )}
      {children}
    </>
  );
}
