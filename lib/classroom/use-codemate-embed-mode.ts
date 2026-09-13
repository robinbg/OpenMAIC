'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;
const getServerSnapshot = () => false;
const getClientSnapshot = () =>
  window.parent !== window && new URLSearchParams(window.location.search).get('codemateEmbed') === '1';

/** Explicit opt-in; normal classroom and workbench screens keep their layout. */
export function useCodeMateEmbedMode(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
