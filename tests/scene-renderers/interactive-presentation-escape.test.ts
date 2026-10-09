/** Execute the production pooled-frame message handler against real relay dispatch. */
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { expect, it, vi } from 'vitest';
import {
  INTERACTIVE_PRESENTATION_ESCAPE_EVENT,
  relayInteractivePresentationEscape,
} from '@/lib/classroom/interactive-presentation-escape';

const source = readFileSync(
  new URL('../../components/scene-renderers/InteractiveIframeHost.tsx', import.meta.url),
  'utf8',
);
const tree = ts.createSourceFile(
  'InteractiveIframeHost.tsx',
  source,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TSX,
);
let effect: ts.Node | undefined;
let visibilityEffect: ts.Node | undefined;
function walk(node: ts.Node) {
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(tree) === 'useEffect' &&
    node.arguments[0]?.getText(tree).includes('relayInteractivePresentationEscape(e,')
  )
    effect = node.arguments[0];
  if (
    ts.isCallExpression(node) &&
    node.expression.getText(tree) === 'useLayoutEffect' &&
    node.arguments[0]?.getText(tree).includes('presentationVisibleRef.current = shown')
  )
    visibilityEffect = node.arguments[0];
  ts.forEachChild(node, walk);
}
walk(tree);
if (!effect) throw new Error('Production pooled iframe message effect was not found');
if (!visibilityEffect)
  throw new Error('Production pooled iframe visibility layout effect was not found');
const compiledVisibility = ts.transpileModule(
  'const run = ' + visibilityEffect.getText(tree) + ';',
  {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  },
).outputText;
const compiled = ts.transpileModule('const run = ' + effect.getText(tree) + ';', {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;

function setup(initialShown = true) {
  const host = new EventTarget();
  const iframeWindow = { postMessage: vi.fn() } as unknown as Window;
  const forwarded = vi.fn();
  host.addEventListener(INTERACTIVE_PRESENTATION_ESCAPE_EVENT, forwarded);
  const presentationVisibleRef = { current: initialShown };
  const addError = vi.fn();
  const picker = vi.fn();
  const env = {
    window: host,
    iframeRef: { current: { contentWindow: iframeWindow } },
    presentationVisibleRef,
    sceneId: 'interactive-scene',
    relayInteractivePresentationEscape,
    useSceneRuntimeErrors: { getState: () => ({ addError }) },
    handleInteractivePickerMessage: picker,
    t: (key: string) => key,
  };
  const run = new Function(...Object.keys(env), compiled + '; return run;')(...Object.values(env));
  const cleanup = run() as () => void;
  function message({
    source = iframeWindow as MessageEventSource,
    origin = 'null',
    data = { __maicInteractive: true, kind: 'presentation-escape' } as unknown,
  } = {}) {
    const event = new Event('message');
    Object.defineProperties(event, {
      source: { value: source },
      origin: { value: origin },
      data: { value: data },
    });
    host.dispatchEvent(event);
  }
  return { host, message, forwarded, presentationVisibleRef, addError, picker, cleanup };
}

it('relays only the actual visible opaque iframe and stamps its host-owned scene identity', () => {
  const fixture = setup();
  try {
    fixture.message({ source: {} as MessageEventSource });
    fixture.message({ origin: 'https://foreign.example' });
    fixture.message({ data: null });
    fixture.message({ data: { __maicInteractive: false, kind: 'presentation-escape' } });
    expect(fixture.forwarded).not.toHaveBeenCalled();
    fixture.presentationVisibleRef.current = false;
    fixture.message();
    expect(fixture.forwarded).not.toHaveBeenCalled();
    fixture.presentationVisibleRef.current = true;
    fixture.message({
      data: {
        __maicInteractive: true,
        kind: 'presentation-escape',
        sceneId: 'forged-scene',
      },
    });
    expect(fixture.forwarded).toHaveBeenCalledTimes(1);
    const event = fixture.forwarded.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ sceneId: 'interactive-scene' });
  } finally {
    fixture.cleanup();
  }
  fixture.message();
  expect(fixture.forwarded).toHaveBeenCalledTimes(1);
});

it('preserves runtime error and picker routing instead of treating their messages as Escape', () => {
  const fixture = setup();
  try {
    fixture.message({
      data: {
        __maicInteractive: true,
        kind: 'runtime-error',
        errorKind: 'error',
        message: 'widget failed',
      },
    });
    expect(fixture.addError).toHaveBeenCalledExactlyOnceWith(
      'interactive-scene',
      '[error] widget failed',
    );
    const picked = { __maicInteractive: true, kind: 'element-picked', selector: '#button' };
    fixture.message({ data: picked });
    expect(fixture.picker).toHaveBeenCalledExactlyOnceWith(
      'interactive-scene',
      picked,
      expect.any(Function),
    );
    expect(fixture.forwarded).not.toHaveBeenCalled();
  } finally {
    fixture.cleanup();
  }
});

it('uses committed visibility and disables the relay synchronously on hide or unmount', () => {
  const fixture = setup(false);
  const commitVisibility = (shown: boolean) =>
    new Function('presentationVisibleRef', 'shown', compiledVisibility + '; return run();')(
      fixture.presentationVisibleRef,
      shown,
    ) as () => void;
  let visibilityCleanup: (() => void) | undefined;
  try {
    fixture.message();
    expect(fixture.forwarded).not.toHaveBeenCalled();
    visibilityCleanup = commitVisibility(true);
    fixture.message();
    expect(fixture.forwarded).toHaveBeenCalledTimes(1);
    visibilityCleanup();
    fixture.message();
    expect(fixture.forwarded).toHaveBeenCalledTimes(1);
    visibilityCleanup = commitVisibility(false);
    fixture.message();
    expect(fixture.forwarded).toHaveBeenCalledTimes(1);
  } finally {
    visibilityCleanup?.();
    fixture.cleanup();
  }
});
