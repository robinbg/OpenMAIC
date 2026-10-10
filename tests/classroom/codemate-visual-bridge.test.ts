import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Scene } from '@/lib/types/stage';
import { useCodeMateVisualBridge as runCodeMateVisualBridge } from '@/lib/classroom/use-codemate-visual-bridge';
import {
  INTERACTIVE_PRESENTATION_ESCAPE_EVENT,
  relayInteractivePresentationEscape,
} from '@/lib/classroom/interactive-presentation-escape';

const hooks = vi.hoisted(() => ({
  effects: [] as Array<() => void | (() => void)>,
  refs: [] as Array<{ current: unknown }>,
}));
vi.mock('react', () => ({
  useEffect: (effect: () => void | (() => void)) => hooks.effects.push(effect),
  useRef: (value: unknown) => {
    const ref = { current: value };
    hooks.refs.push(ref);
    return ref;
  },
}));

let cleanups: Array<() => void> = [];
beforeEach(() => {
  hooks.effects.length = 0;
  hooks.refs.length = 0;
  vi.stubEnv('NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN', '');
});
afterEach(() => {
  cleanups.reverse().forEach((cleanup) => cleanup());
  cleanups = [];
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function mount({
  enabled = true,
  standalone = false,
  classroomId = 'classroom',
  sceneType = 'slide',
}: {
  enabled?: boolean;
  standalone?: boolean;
  classroomId?: string;
  sceneType?: 'slide' | 'interactive';
} = {}) {
  const parent = { postMessage: vi.fn() };
  const frame = Object.assign(new EventTarget(), {
    parent: parent as unknown,
    location: { search: '?codemateEmbed=1' },
  });
  if (standalone) frame.parent = frame;
  vi.stubGlobal('window', frame);
  vi.stubGlobal('document', { referrer: 'https://codemate.example/p/42' });
  const onCommand = vi.fn();
  // React is mocked above; this fixture executes the hook's collected effects.
  runCodeMateVisualBridge({
    enabled,
    classroomId,
    scenes: [{ id: 's1', title: '循环条件', type: sceneType }] as Scene[],
    currentSceneId: 's1',
    onCommand,
  });
  hooks.effects.forEach((effect) => {
    const cleanup = effect();
    if (cleanup) cleanups.push(cleanup);
  });
  parent.postMessage.mockClear();
  return { frame, parent, onCommand };
}

function key(frame: EventTarget, key = 'Escape', { composing = false, consumed = false } = {}) {
  const event = new Event('keydown', { cancelable: true });
  Object.defineProperties(event, { key: { value: key }, isComposing: { value: composing } });
  if (consumed) event.preventDefault();
  frame.dispatchEvent(event);
}

describe('CodeMate iframe presentation keyboard bridge', () => {
  it('sends Escape with the current classroom ID only to the embedding parent origin', () => {
    const { frame, parent } = mount();
    key(frame);
    expect(parent.postMessage).toHaveBeenCalledExactlyOnceWith(
      {
        source: 'openmaic',
        type: 'presentation-escape',
        classroomId: 'classroom',
      },
      'https://codemate.example',
    );
  });

  it('uses the configured parent origin and never broadcasts with a wildcard', () => {
    vi.stubEnv('NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN', 'https://allowed.example:8443/classroom');
    const { frame, parent } = mount();
    key(frame);
    expect(parent.postMessage.mock.calls[0][1]).toBe('https://allowed.example:8443');
  });

  it.each([{ enabled: false }, { standalone: true }, { classroomId: '' }])(
    'keeps non-embedded or unidentified classroom behavior unchanged: %j',
    (options) => {
      const { frame, parent } = mount(options);
      key(frame);
      expect(parent.postMessage).not.toHaveBeenCalled();
    },
  );

  it('does not attach a keyboard sender without a valid parent origin', () => {
    vi.stubEnv('NEXT_PUBLIC_CODEMATE_PARENT_ORIGIN', 'javascript:invalid');
    const { frame, parent } = mount();
    key(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('leaves other keys, IME composition and already-consumed Escape alone', () => {
    const { frame, parent } = mount();
    key(frame, 'Enter');
    key(frame, 'Escape', { composing: true });
    key(frame, 'Escape', { consumed: true });
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('rejects stale classroom state and removes its listener on cleanup', () => {
    const { frame, parent } = mount();
    (hooks.refs[0].current as { classroomId: string }).classroomId = 'different';
    key(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
    (hooks.refs[0].current as { classroomId: string }).classroomId = 'classroom';
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    key(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it('preserves the existing source/origin and scene validation for playback commands', () => {
    const { frame, parent, onCommand } = mount();
    const command = { source: 'codemate', type: 'visual-command', action: 'play', sceneId: 's1' };
    const message = (source: unknown, origin: string, sceneId = 's1') => {
      const event = new Event('message');
      Object.defineProperties(event, {
        source: { value: source },
        origin: { value: origin },
        data: { value: { ...command, sceneId } },
      });
      frame.dispatchEvent(event);
    };
    message({}, 'https://codemate.example');
    message(parent, 'https://foreign.example');
    message(parent, 'https://codemate.example', 'foreign');
    expect(onCommand).not.toHaveBeenCalled();
    message(parent, 'https://codemate.example');
    expect(onCommand).toHaveBeenCalledExactlyOnceWith(command);
  });
});

describe('CodeMate nested interactive presentation handoff', () => {
  function relay(frame: EventTarget, sceneId = 's1') {
    const iframeWindow = {} as MessageEventSource;
    return relayInteractivePresentationEscape(
      {
        source: iframeWindow,
        origin: 'null',
        data: { __maicInteractive: true, kind: 'presentation-escape' },
      },
      { iframeWindow, visible: true, sceneId, host: frame },
    );
  }

  it('dispatches a validated nested Escape through the real bridge with exact parent origin and classroom', () => {
    const { frame, parent, onCommand } = mount({ sceneType: 'interactive' });
    expect(relay(frame)).toBe(true);
    expect(parent.postMessage).toHaveBeenCalledExactlyOnceWith(
      {
        source: 'openmaic',
        type: 'presentation-escape',
        classroomId: 'classroom',
      },
      'https://codemate.example',
    );
    expect(onCommand).not.toHaveBeenCalled();
  });

  it('rejects stale scenes, noninteractive scenes and changed classroom identity', () => {
    const { frame, parent } = mount({ sceneType: 'interactive' });
    relay(frame, 'different');
    expect(parent.postMessage).not.toHaveBeenCalled();
    const state = hooks.refs[0].current as { classroomId: string; scenes: Scene[] };
    state.scenes = [{ id: 's1', type: 'slide' }] as Scene[];
    relay(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
    state.scenes = [{ id: 's1', type: 'interactive' }] as Scene[];
    state.classroomId = 'replacement';
    relay(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });

  it.each([{ enabled: false }, { standalone: true }, { classroomId: '' }])(
    'keeps a nested handoff inert outside the identified embedding: %j',
    (options) => {
      const { frame, parent } = mount({ ...options, sceneType: 'interactive' });
      relay(frame);
      expect(parent.postMessage).not.toHaveBeenCalled();
    },
  );

  it('removes the nested listener on cleanup and ignores malformed internal events', () => {
    const { frame, parent } = mount({ sceneType: 'interactive' });
    frame.dispatchEvent(new CustomEvent(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, { detail: null }));
    frame.dispatchEvent(
      new CustomEvent(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, { detail: { sceneId: 1 } }),
    );
    expect(parent.postMessage).not.toHaveBeenCalled();
    cleanups.forEach((cleanup) => cleanup());
    cleanups = [];
    relay(frame);
    expect(parent.postMessage).not.toHaveBeenCalled();
  });
});
