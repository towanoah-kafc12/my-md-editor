import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { createDocument, createWorkspace, type MarkdownDocument, type Workspace } from './document';

const markdownExtension = /\.(md|markdown)$/i;
const joinPath = (parent: string, child: string) => `${parent.replace(/[\\/]+$/, '')}/${child}`;

export async function pickMarkdownFiles(): Promise<MarkdownDocument[]> {
  const selected = await open({
    multiple: true,
    directory: false,
    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
  });
  if (!selected) return [];
  const paths = Array.isArray(selected) ? selected : [selected];
  return Promise.all(paths.map(async (path) => createDocument(path, await readTextFile(path))));
}

export async function pickWorkspaceFolders(): Promise<Workspace[]> {
  const selected = await open({ multiple: true, directory: true });
  if (!selected) return [];
  const paths = Array.isArray(selected) ? selected : [selected];
  return paths.map(createWorkspace);
}

export async function readWorkspaceDocuments(workspace: Workspace): Promise<MarkdownDocument[]> {
  const paths = await markdownFilesIn(workspace.path);
  return Promise.all(
    paths.map(async (path) => createDocument(path, await readTextFile(path), workspace)),
  );
}

export async function markdownFilesIn(path: string): Promise<string[]> {
  const entries = await readDir(path);
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = joinPath(path, entry.name);
      if (entry.isDirectory) return markdownFilesIn(entryPath);
      return entry.isFile && markdownExtension.test(entry.name) ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

export const saveMarkdownFile = (path: string, markdown: string) =>
  writeTextFile(path, markdown);
