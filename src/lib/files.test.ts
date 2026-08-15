import { describe, expect, it, vi } from 'vitest';

const { open, readDir, readTextFile } = vi.hoisted(() => ({
  open: vi.fn(),
  readDir: vi.fn(),
  readTextFile: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-dialog', () => ({ open }));
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir,
  readTextFile,
  writeTextFile: vi.fn(),
}));

import { markdownFilesIn, pickWorkspaceFolders, readWorkspaceDocuments } from './files';
import { createWorkspace } from './document';

describe('workspace file access', () => {
  it('returns no workspace when the directory dialog is cancelled', async () => {
    open.mockResolvedValueOnce(null);
    await expect(pickWorkspaceFolders()).resolves.toEqual([]);
  });

  it('recursively finds Markdown files only', async () => {
    readDir
      .mockResolvedValueOnce([
        { name: 'readme.md', isFile: true, isDirectory: false },
        { name: 'notes', isFile: false, isDirectory: true },
        { name: 'image.png', isFile: true, isDirectory: false },
      ])
      .mockResolvedValueOnce([
        { name: 'idea.markdown', isFile: true, isDirectory: false },
        { name: 'draft.txt', isFile: true, isDirectory: false },
      ]);

    await expect(markdownFilesIn('C:/workspace')).resolves.toEqual([
      'C:/workspace/readme.md',
      'C:/workspace/notes/idea.markdown',
    ]);
  });

  it('adds workspace metadata when reading discovered files', async () => {
    readDir.mockResolvedValueOnce([{ name: 'note.md', isFile: true, isDirectory: false }]);
    readTextFile.mockResolvedValueOnce('# Note');

    const [document] = await readWorkspaceDocuments(createWorkspace('C:/workspace'));
    expect(document).toMatchObject({
      path: 'C:/workspace/note.md',
      relativePath: 'note.md',
      workspaceName: 'workspace',
      markdown: '# Note',
    });
  });
});
