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
  folderPaths?: string[];
}

export const fileNameFromPath = (path: string) => path.split(/[\\/]/).pop() || path;

export const relativePathFromRoot = (rootPath: string, path: string) => {
  const normalizedRoot = rootPath.replace(/[\\/]+$/, '');
  const normalizedPath = path.replace(/\\/g, '/');
  const normalizedRootPath = normalizedRoot.replace(/\\/g, '/');
  const prefix = `${normalizedRootPath}/`;
  return normalizedPath.startsWith(prefix) ? normalizedPath.slice(prefix.length) : fileNameFromPath(path);
};

export const createWorkspace = (path: string, folderPaths: string[] = []): Workspace => ({
  path,
  name: fileNameFromPath(path),
  folderPaths,
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

export type WorkspaceTreeNode = {
  id: string;
  text: string;
  document?: MarkdownDocument;
  nodes?: WorkspaceTreeNode[];
};

interface TreeDraftNode {
  folders: Map<string, TreeDraftNode>;
  documents: MarkdownDocument[];
}

const createTreeDraftNode = (): TreeDraftNode => ({ folders: new Map(), documents: [] });

export function workspaceTreeNodes(
  documents: MarkdownDocument[],
  workspace: Workspace,
): WorkspaceTreeNode[] {
  const root = createTreeDraftNode();
  const ensureFolder = (parts: string[]) => {
    let node = root;
    for (const part of parts) {
      let child = node.folders.get(part);
      if (!child) {
        child = createTreeDraftNode();
        node.folders.set(part, child);
      }
      node = child;
    }
    return node;
  };

  for (const folderPath of workspace.folderPaths ?? []) {
    ensureFolder(folderPath.split('/').filter(Boolean));
  }

  for (const document of documentsForWorkspace(documents, workspace.path)) {
    const parts = (document.relativePath ?? document.name).split('/').filter(Boolean);
    const fileName = parts.pop() ?? document.name;
    const node = ensureFolder(parts);
    node.documents.push({ ...document, name: fileName });
  }

  const build = (node: TreeDraftNode, prefix: string): WorkspaceTreeNode[] => [
    ...[...node.folders.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, child]) => {
        const id = prefix ? `${prefix}/${name}` : name;
        return { id: `${workspace.path}::${id}`, text: name, nodes: build(child, id) };
      }),
    ...[...node.documents]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((document) => ({ id: document.id, text: document.name, document })),
  ];

  return build(root, '');
}

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
