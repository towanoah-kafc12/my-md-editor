export interface MarkdownDocument {
  id: string;
  path: string;
  name: string;
  markdown: string;
  savedMarkdown: string;
  workspacePath?: string;
  workspaceName?: string;
  relativePath?: string;
}

export interface Workspace {
  path: string;
  name: string;
}

export const fileNameFromPath = (path: string) => path.split(/[\\/]/).pop() || path;

export const relativePathFromRoot = (rootPath: string, path: string) => {
  const normalizedRoot = rootPath.replace(/[\\/]+$/, '');
  const normalizedPath = path.replace(/\\/g, '/');
  const normalizedRootPath = normalizedRoot.replace(/\\/g, '/');
  const prefix = `${normalizedRootPath}/`;
  return normalizedPath.startsWith(prefix) ? normalizedPath.slice(prefix.length) : fileNameFromPath(path);
};

export const createWorkspace = (path: string): Workspace => ({
  path,
  name: fileNameFromPath(path),
});

export const createDocument = (
  path: string,
  markdown: string,
  workspace?: Workspace,
): MarkdownDocument => ({
  id: path,
  path,
  name: fileNameFromPath(path),
  markdown,
  savedMarkdown: markdown,
  ...(workspace && {
    workspacePath: workspace.path,
    workspaceName: workspace.name,
    relativePath: relativePathFromRoot(workspace.path, path),
  }),
});

export const mergeWorkspaces = (current: Workspace[], incoming: Workspace[]) => {
  const existingPaths = new Set(current.map((workspace) => workspace.path));
  return [...current, ...incoming.filter((workspace) => !existingPaths.has(workspace.path))];
};

export const documentsForWorkspace = (documents: MarkdownDocument[], path: string) =>
  documents.filter((document) => document.workspacePath === path);

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
