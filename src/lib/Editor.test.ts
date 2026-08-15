import { cleanup, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

let finishCreate: (() => void) | undefined;
let notifyMarkdown: ((ctx: unknown, markdown: string, previous: string) => void) | undefined;
const markdownUpdated = vi.fn((callback: typeof notifyMarkdown) => {
  notifyMarkdown = callback;
  setTimeout(() => callback?.({}, '# Note\n', '# Note'), 200);
});
const on = vi.fn((register: (listener: { markdownUpdated: typeof markdownUpdated }) => void) =>
  register({ markdownUpdated }),
);
const destroy = vi.fn(() => Promise.resolve());
const createConfig = vi.fn();

vi.mock('@milkdown/crepe', () => {
  class MockCrepe {
    static Feature = { CodeMirror: 'code', ImageBlock: 'image', Latex: 'latex' };
    constructor(config: unknown) { createConfig(config); }
    on = on;
    destroy = destroy;
    getMarkdown = () => '# Note\n';
    create = () => new Promise<void>((resolve) => { finishCreate = resolve; });
  }
  return { Crepe: MockCrepe };
});

import Editor from './Editor.svelte';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  finishCreate = undefined;
  notifyMarkdown = undefined;
});

describe('Editor initialization', () => {
  it('ignores the debounced normalized baseline and forwards later user edits', async () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    render(Editor, { documentId: 'note.md', markdown: '# Note', onChange });

    expect(on).not.toHaveBeenCalled();
    finishCreate?.();
    await Promise.resolve();

    expect(on).toHaveBeenCalledOnce();
    expect(markdownUpdated).toHaveBeenCalledOnce();
    expect(onChange).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    expect(onChange).not.toHaveBeenCalled();

    notifyMarkdown?.({}, '# Updated', '# Note\n');
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith('# Updated');
  });

  it('enables CodeMirror for editable highlighted code blocks', () => {
    render(Editor, { documentId: 'note.md', markdown: '# Note', onChange: vi.fn() });
    expect(createConfig).toHaveBeenCalledWith(expect.objectContaining({
      features: expect.objectContaining({ code: true }),
    }));
  });

  it('destroys Crepe if the document is switched during initialization', async () => {
    const view = render(Editor, { documentId: 'note.md', markdown: '# Note', onChange: vi.fn() });
    view.unmount();
    finishCreate?.();
    await Promise.resolve();

    expect(on).not.toHaveBeenCalled();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
