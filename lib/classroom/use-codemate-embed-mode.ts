'use client';

import { useEffect, useState } from 'react';

/** Explicit opt-in; normal classroom and workbench screens keep their layout. */
export function useCodeMateEmbedMode(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(window.parent !== window && new URLSearchParams(window.location.search).get('codemateEmbed') === '1');
  }, []);
  return enabled;
}
