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

interface WorkspacePaths {
  folderPaths: string[];
  markdownPaths: string[];
}

export async function readWorkspace(path: string): Promise<Workspace> {
  const { folderPaths, markdownPaths } = await workspacePathsIn(path, path);
  return createWorkspace(path, folderPaths, markdownPaths);
}

export async function readWorkspaceDocuments(workspace: Workspace): Promise<MarkdownDocument[]> {
  const paths = workspace.markdownPaths ?? await markdownFilesIn(workspace.path);
  const results = await Promise.allSettled(
    paths.map(async (path) => createDocument(path, await readTextFile(path), workspace)),
  );
  return results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
}

export const readMarkdownFile = (path: string) => readTextFile(path);

export async function markdownFilesIn(path: string): Promise<string[]> {
  return (await workspacePathsIn(path, path)).markdownPaths;
}

export async function folderPathsIn(path: string, rootPath = path): Promise<string[]> {
  return (await workspacePathsIn(path, rootPath)).folderPaths;
}

async function workspacePathsIn(path: string, rootPath: string): Promise<WorkspacePaths> {
  const entries = await readDir(path);
  const nested = await Promise.allSettled(
    entries.map(async (entry): Promise<WorkspacePaths> => {
      if (entry.isDirectory && shouldSkipWorkspaceDirectory(entry.name)) {
        return { folderPaths: [], markdownPaths: [] };
      }
      const entryPath = await entryPathFrom(path, entry.name);
      if (entry.isDirectory) {
        const nestedPaths = await workspacePathsIn(entryPath, rootPath);
        return {
          folderPaths: [relativePathFromRoot(rootPath, entryPath), ...nestedPaths.folderPaths],
          markdownPaths: nestedPaths.markdownPaths,
        };
      }
      return {
        folderPaths: [],
        markdownPaths: entry.isFile && markdownExtension.test(entry.name) ? [entryPath] : [],
      };
    }),
  );
  return nested.reduce<WorkspacePaths>((paths, result) => {
    if (result.status === 'fulfilled') {
      paths.folderPaths.push(...result.value.folderPaths);
      paths.markdownPaths.push(...result.value.markdownPaths);
    }
    return paths;
  }, { folderPaths: [], markdownPaths: [] });
}

export const saveMarkdownFile = (path: string, markdown: string) =>
  writeTextFile(path, markdown);
