import { beforeEach, describe, expect, it, vi } from 'vitest';

const { join, open, readDir, readTextFile } = vi.hoisted(() => ({
  join: vi.fn(async (...parts: string[]) => parts.join('/')),
  open: vi.fn(),
  readDir: vi.fn(),
  readTextFile: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({ join }));
vi.mock('@tauri-apps/plugin-dialog', () => ({ open }));
vi.mock('@tauri-apps/plugin-fs', () => ({
  readDir,
  readTextFile,
  writeTextFile: vi.fn(),
}));

import { folderPathsIn, markdownFilesIn, pickWorkspaceFolders, readMarkdownFile, readWorkspace, readWorkspaceDocuments } from './files';
import { createWorkspace } from './document';

describe('workspace file access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readDir.mockReset();
    readTextFile.mockReset();
  });

  it('returns no workspace when the directory dialog is cancelled', async () => {
    open.mockResolvedValueOnce(null);
    await expect(pickWorkspaceFolders()).resolves.toEqual([]);
    expect(open).toHaveBeenLastCalledWith({ multiple: true, directory: true, recursive: true });
  });

  it('uses the platform path API for relative directory entries', async () => {
    readDir.mockResolvedValueOnce([{ name: 'note.md', isFile: true, isDirectory: false }]);

    await expect(markdownFilesIn('C:\\workspace')).resolves.toEqual(['C:\\workspace/note.md']);
    expect(join).toHaveBeenCalledWith('C:\\workspace', 'note.md');
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

  it('recursively records folder paths for the sidebar tree', async () => {
    readDir
      .mockResolvedValueOnce([
        { name: 'docs', isFile: false, isDirectory: true },
        { name: 'readme.md', isFile: true, isDirectory: false },
      ])
      .mockResolvedValueOnce([
        { name: '00_base', isFile: false, isDirectory: true },
      ])
      .mockResolvedValueOnce([]);

    await expect(folderPathsIn('C:/workspace')).resolves.toEqual([
      'docs',
      'docs/00_base',
    ]);
  });

  it('skips generated workspace directories during Markdown and folder discovery', async () => {
    const rootEntries = [
      { name: '.git', isFile: false, isDirectory: true },
      { name: 'node_modules', isFile: false, isDirectory: true },
      { name: 'docs', isFile: false, isDirectory: true },
    ];

    readDir
      .mockResolvedValueOnce(rootEntries)
      .mockResolvedValueOnce([
        { name: 'guide.md', isFile: true, isDirectory: false },
      ]);
    await expect(markdownFilesIn('C:/workspace')).resolves.toEqual([
      'C:/workspace/docs/guide.md',
    ]);
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith('C:/workspace/docs');

    readDir.mockReset()
      .mockResolvedValueOnce(rootEntries)
      .mockResolvedValueOnce([]);
    await expect(folderPathsIn('C:/workspace')).resolves.toEqual(['docs']);
    expect(readDir).toHaveBeenCalledTimes(2);
    expect(readDir).toHaveBeenLastCalledWith('C:/workspace/docs');
  });

  it('scans workspace paths without reading Markdown contents', async () => {
    readDir
      .mockResolvedValueOnce([
        { name: 'docs', isFile: false, isDirectory: true },
        { name: 'note.md', isFile: true, isDirectory: false },
      ])
      .mockResolvedValueOnce([
        { name: 'guide.markdown', isFile: true, isDirectory: false },
      ]);

    await expect(readWorkspace('C:/workspace')).resolves.toMatchObject({
      folderPaths: ['docs'],
      markdownPaths: ['C:/workspace/docs/guide.markdown', 'C:/workspace/note.md'],
    });
    expect(readTextFile).not.toHaveBeenCalled();
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

  it('reads an individual Markdown document on demand', async () => {
    readTextFile.mockResolvedValueOnce('# Note');

    await expect(readMarkdownFile('C:/workspace/note.md')).resolves.toBe('# Note');
    expect(readTextFile).toHaveBeenCalledWith('C:/workspace/note.md');
  });

  it('keeps readable Markdown files when a nested directory or file cannot be read', async () => {
    readDir
      .mockResolvedValueOnce([
        { name: 'ok.md', isFile: true, isDirectory: false },
        { name: 'blocked', isFile: false, isDirectory: true },
        { name: 'broken.md', isFile: true, isDirectory: false },
      ])
      .mockRejectedValueOnce(new Error('denied'));
    readTextFile
      .mockResolvedValueOnce('# OK')
      .mockRejectedValueOnce(new Error('locked'));

    await expect(markdownFilesIn('C:/workspace')).resolves.toEqual([
      'C:/workspace/ok.md',
      'C:/workspace/broken.md',
    ]);

    readDir
      .mockResolvedValueOnce([
        { name: 'ok.md', isFile: true, isDirectory: false },
        { name: 'blocked', isFile: false, isDirectory: true },
        { name: 'broken.md', isFile: true, isDirectory: false },
      ])
      .mockRejectedValueOnce(new Error('denied'));
    readTextFile
      .mockResolvedValueOnce('# OK')
      .mockRejectedValueOnce(new Error('locked'));

    const documents = await readWorkspaceDocuments(createWorkspace('C:/workspace'));
    expect(documents).toHaveLength(1);
    expect(documents[0].name).toBe('ok.md');
  });

  it('uses absolute entry names returned by the platform without joining twice', async () => {
    readDir.mockResolvedValueOnce([
      { name: 'C:/workspace/note.md', isFile: true, isDirectory: false },
    ]);

    await expect(markdownFilesIn('C:/workspace')).resolves.toEqual(['C:/workspace/note.md']);
    expect(join).not.toHaveBeenCalled();
  });
});
