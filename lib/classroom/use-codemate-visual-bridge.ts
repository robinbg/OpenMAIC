'use client';

import { useEffect, useRef } from 'react';
import type { Scene } from '@/lib/types/stage';
import { INTERACTIVE_PRESENTATION_ESCAPE_EVENT } from './interactive-presentation-escape';
import {
  isCodeMateParentMessage,
  parseCodeMateVisualCommand,
  resolveCodeMateParentOrigin,
  type CodeMateVisualCommand,
} from './codemate-embed-protocol';

export function useCodeMateVisualBridge({
  enabled,
  classroomId,
  scenes,
  currentSceneId,
  onCommand,
}: {
  enabled: boolean;
  classroomId?: string;
  scenes: Scene[];
  currentSceneId: string | null;
  onCommand: (command: CodeMateVisualCommand) => void;
}) {
  const stateRef = useRef({ classroomId, scenes, currentSceneId, onCommand });
  const initialSceneRef = useRef<string | null>(null);
  useEffect(() => {
    stateRef.current = { classroomId, scenes, currentSceneId, onCommand };
  }, [classroomId, scenes, currentSceneId, onCommand]);

  useEffect(() => {
    if (!enabled || !classroomId || window.parent === window) return;
    const parentOrigin = resolveCodeMateParentOrigin(
      process.env.NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN,
      document.referrer,
    );
    if (!parentOrigin) return;
    const listener = (event: MessageEvent) => {
      if (!isCodeMateParentMessage(event.source, event.origin, window.parent, parentOrigin)) return;
      const current = stateRef.current;
      if (current.classroomId !== classroomId) return;
      const command = parseCodeMateVisualCommand(
        event.data,
        classroomId,
        current.scenes.map((scene) => scene.id),
      );
      if (command) current.onCommand(command);
    };
    const sendEscape = () => {
      if (stateRef.current.classroomId !== classroomId) return;
      window.parent.postMessage(
        { source: 'openmaic', type: 'presentation-escape', classroomId },
        parentOrigin,
      );
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      sendEscape();
    };
    const interactiveEscape = (event: Event) => {
      const detail = (event as CustomEvent<{ sceneId?: unknown }>).detail;
      const current = stateRef.current;
      if (
        !detail ||
        typeof detail.sceneId !== 'string' ||
        detail.sceneId !== current.currentSceneId ||
        !current.scenes.some((scene) => scene.id === detail.sceneId && scene.type === 'interactive')
      )
        return;
      sendEscape();
    };
    window.addEventListener('message', listener);
    window.addEventListener('keydown', escape);
    window.addEventListener(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, interactiveEscape);
    return () => {
      window.removeEventListener('message', listener);
      window.removeEventListener('keydown', escape);
      window.removeEventListener(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, interactiveEscape);
    };
  }, [enabled, classroomId]);

  useEffect(() => {
    if (!enabled || !classroomId || scenes.length === 0 || window.parent === window) return;
    const parentOrigin = resolveCodeMateParentOrigin(
      process.env.NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN,
      document.referrer,
    );
    if (!parentOrigin) return;
    window.parent.postMessage(
      {
        source: 'openmaic',
        type: 'ready',
        classroomId,
        scenes: scenes.map((scene) => ({
          sceneId: scene.id,
          title: scene.title,
          sceneType: scene.type,
        })),
      },
      parentOrigin,
    );
    const initialSceneId = new URLSearchParams(window.location.search).get('sceneId');
    const initialKey = `${classroomId}:${initialSceneId}`;
    if (
      initialSceneId &&
      initialSceneRef.current !== initialKey &&
      scenes.some((scene) => scene.id === initialSceneId)
    ) {
      initialSceneRef.current = initialKey;
      stateRef.current.onCommand({
        source: 'codemate',
        type: 'visual-command',
        action: 'show',
        sceneId: initialSceneId,
      });
    }
  }, [enabled, classroomId, scenes]);

  useEffect(() => {
    if (!enabled || !classroomId || window.parent === window) return;
    const scene = scenes.find((item) => item.id === currentSceneId);
    const parentOrigin = resolveCodeMateParentOrigin(
      process.env.NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN,
      document.referrer,
    );
    if (!scene || !parentOrigin) return;
    window.parent.postMessage(
      {
        source: 'openmaic',
        type: 'scene-change',
        classroomId,
        sceneId: scene.id,
        title: scene.title,
        sceneType: scene.type,
      },
      parentOrigin,
    );
  }, [enabled, classroomId, scenes, currentSceneId]);
}
