/** Internal handoff from a validated, visible sandbox to the classroom bridge. */
export const INTERACTIVE_PRESENTATION_ESCAPE_EVENT = 'openmaic:interactive-presentation-escape';

export function relayInteractivePresentationEscape(
  event: Pick<MessageEvent, 'source' | 'origin' | 'data'>,
  {
    iframeWindow,
    visible,
    sceneId,
    host,
  }: {
    iframeWindow: MessageEventSource | null | undefined;
    visible: boolean;
    sceneId: string;
    host: Pick<EventTarget, 'dispatchEvent'>;
  },
): boolean {
  const data = event.data as unknown;
  if (
    !visible ||
    !iframeWindow ||
    event.source !== iframeWindow ||
    event.origin !== 'null' ||
    !sceneId ||
    !data ||
    typeof data !== 'object' ||
    Array.isArray(data) ||
    (data as { __maicInteractive?: unknown }).__maicInteractive !== true ||
    (data as { kind?: unknown }).kind !== 'presentation-escape'
  )
    return false;
  // The opaque sandbox cannot assert its own scene identity; the host supplies it.
  host.dispatchEvent(
    new CustomEvent(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, {
      detail: { sceneId },
    }),
  );
  return true;
}
