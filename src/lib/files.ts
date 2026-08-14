import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { createDocument, type MarkdownDocument } from './document';

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

export const saveMarkdownFile = (path: string, markdown: string) =>
  writeTextFile(path, markdown);
