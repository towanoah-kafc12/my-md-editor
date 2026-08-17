import { join } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { createDocument, createWorkspace, relativePathFromRoot, type MarkdownDocument, type Workspace } from './document';

const markdownExtension = /\.(md|markdown)$/i;
const absolutePath = /^(?:[a-z]:|[/\\])/i;
const excludedWorkspaceDirectories = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.svelte-kit',
  '.next',
  'coverage',
]);

const entryPathFrom = (parent: string, name: string) =>
  absolutePath.test(name) ? Promise.resolve(name) : join(parent, name);

const shouldSkipWorkspaceDirectory = (name: string) =>
  excludedWorkspaceDirectories.has(name);

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
  const selected = await open({ multiple: true, directory: true, recursive: true });
  if (!selected) return [];
  const paths = Array.isArray(selected) ? selected : [selected];
  return Promise.all(paths.map(readWorkspace));
}

export async function readWorkspace(path: string): Promise<Workspace> {
  const folderPaths = await folderPathsIn(path, path);
  return createWorkspace(path, folderPaths);
}

export async function readWorkspaceDocuments(workspace: Workspace): Promise<MarkdownDocument[]> {
  const paths = await markdownFilesIn(workspace.path);
  const results = await Promise.allSettled(
    paths.map(async (path) => createDocument(path, await readTextFile(path), workspace)),
  );
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export async function markdownFilesIn(path: string): Promise<string[]> {
  const entries = await readDir(path);
  const nested = await Promise.allSettled(
    entries.map(async (entry) => {
      if (entry.isDirectory && shouldSkipWorkspaceDirectory(entry.name)) return [];
      const entryPath = await entryPathFrom(path, entry.name);
      if (entry.isDirectory) return markdownFilesIn(entryPath);
      return entry.isFile && markdownExtension.test(entry.name) ? [entryPath] : [];
    }),
  );
  return nested.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export async function folderPathsIn(path: string, rootPath = path): Promise<string[]> {
  const entries = await readDir(path);
  const nested = await Promise.allSettled(
    entries.map(async (entry) => {
      if (!entry.isDirectory || shouldSkipWorkspaceDirectory(entry.name)) return [];
      const entryPath = await entryPathFrom(path, entry.name);
      return [relativePathFromRoot(rootPath, entryPath), ...(await folderPathsIn(entryPath, rootPath))];
    }),
  );
  return nested.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export const saveMarkdownFile = (path: string, markdown: string) =>
  writeTextFile(path, markdown);
