// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { patchHtmlForIframe } from '@/lib/utils/iframe';

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  delete (window as unknown as Record<string, unknown>).__maicElementPickerInstalled;
});

describe('iframe element picker shim', () => {
  it('stays dormant, blocks armed page clicks, emits picks, syncs pins, and exits', async () => {
    const patched = patchHtmlForIframe(
      '<html><head></head><body><button id="cta">Start</button></body></html>',
    );
    const shim = patched.match(/<script data-iframe-element-picker-shim>([\s\S]*?)<\/script>/)?.[1];
    expect(shim).toBeTruthy();

    const button = document.createElement('button');
    button.id = 'cta';
    button.textContent = 'Start';
    Object.defineProperty(button, 'innerText', { value: 'Start' });
    button.getBoundingClientRect = () => ({ left: 20, top: 30, width: 80, height: 32 }) as DOMRect;
    document.body.appendChild(button);
    const pageClick = vi.fn();
    button.addEventListener('click', pageClick);
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: () => button,
    });
    let frame: FrameRequestCallback | null = null;
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: (callback: FrameRequestCallback) => {
        frame = callback;
        return 1;
      },
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: vi.fn(),
    });
    const postMessage = vi.spyOn(window, 'postMessage').mockImplementation(() => undefined);
    const flushFrame = () => {
      const callback = frame;
      frame = null;
      callback?.(0);
    };

    new Function('window', 'document', shim as string)(window, document);
    expect(document.querySelector('[data-maic-element-picker-overlay]')).toBeNull();

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 25, clientY: 35 }));
    expect(pageClick).toHaveBeenCalledTimes(1);
    expect(postMessage).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', isComposing: true }));
    const consumed = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    consumed.preventDefault();
    window.dispatchEvent(consumed);
    await Promise.resolve();
    expect(postMessage).not.toHaveBeenCalled();

    // The shim is installed before a generated page's own window handlers.
    // A handler added afterward must still be able to consume Escape.
    window.addEventListener('keydown', (event) => event.preventDefault(), { once: true });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', cancelable: true }));
    await Promise.resolve();
    expect(postMessage).not.toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(postMessage).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(postMessage).toHaveBeenCalledExactlyOnceWith(
      { __maicInteractive: true, kind: 'presentation-escape' },
      '*',
    );
    postMessage.mockClear();

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: { type: 'element-picker:arm' },
      }),
    );
    flushFrame();
    expect(document.querySelector('[data-maic-element-picker-overlay]')).not.toBeNull();

    button.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 25, clientY: 35 }));
    expect(pageClick).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        __maicInteractive: true,
        kind: 'element-picked',
        selector: '#cta',
        text: 'Start',
      }),
      '*',
    );

    window.dispatchEvent(
      new MessageEvent('message', {
        source: window,
        data: { type: 'element-picker:sync', selectors: ['#cta'] },
      }),
    );
    flushFrame();
    expect(document.querySelector('[data-maic-picker-pin]')?.textContent).toBe('1');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await Promise.resolve();
    expect(document.querySelector('[data-maic-element-picker-overlay]')).toBeNull();
    expect(postMessage).toHaveBeenCalledWith(
      { __maicInteractive: true, kind: 'element-picker-disarmed' },
      '*',
    );
    expect(postMessage.mock.calls.some(([data]) => data.kind === 'presentation-escape')).toBe(
      false,
    );
  });
});
