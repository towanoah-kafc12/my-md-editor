export interface MarkdownDocument {
  id: string;
  path: string;
  name: string;
  markdown: string;
  savedMarkdown: string;
}

export const fileNameFromPath = (path: string) => path.split(/[\\/]/).pop() || path;

export const createDocument = (path: string, markdown: string): MarkdownDocument => ({
  id: path,
  path,
  name: fileNameFromPath(path),
  markdown,
  savedMarkdown: markdown,
});

export const isDirty = (document: MarkdownDocument) =>
  document.markdown !== document.savedMarkdown;

export function mergeDocuments(
  current: MarkdownDocument[],
  incoming: MarkdownDocument[],
): MarkdownDocument[] {
  const existingPaths = new Set(current.map((document) => document.path));
  return [...current, ...incoming.filter((document) => !existingPaths.has(document.path))];
}

export function updateMarkdown(
  documents: MarkdownDocument[],
  id: string,
  markdown: string,
): MarkdownDocument[] {
  return documents.map((document) =>
    document.id === id ? { ...document, markdown } : document,
  );
}

export function markSaved(documents: MarkdownDocument[], id: string): MarkdownDocument[] {
  return documents.map((document) =>
    document.id === id ? { ...document, savedMarkdown: document.markdown } : document,
  );
}
