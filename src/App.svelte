<script lang="ts">
  import { TreeView } from 'carbon-components-svelte';
  import Editor from './lib/Editor.svelte';
  import { createDocument, createWorkspaceDocument, isDirty, markDocumentLoaded, markSaved, mergeDocuments, mergeWorkspaces, updateMarkdown, workspaceTreeNodes, type MarkdownDocument, type Workspace, type WorkspaceTreeNode } from './lib/document';
  import { pickWorkspaceFolders, readMarkdownFile, saveMarkdownFile } from './lib/files';
  import { fontOptions, loadSettings, saveSettings, type FontChoice, type ThemeChoice } from './lib/settings';
  import { onMount } from 'svelte';

  const demo = createDocument('Welcome.md', `# Welcome to Plainmark

Write **Markdown** and see it take shape right where you type.

> Your files stay on your computer.

## Start writing

- Open one or more Markdown files
- Switch between them in the sidebar
- Save with **Ctrl+S**
`);
  const browserDemo = import.meta.env.DEV && !window.__TAURI_INTERNALS__;
  let documents: MarkdownDocument[] = $state(browserDemo ? [demo] : []);
  let workspaces: Workspace[] = $state([]);
  let activeId: string | null = $state(browserDemo ? demo.id : null);
  const settings = loadSettings();
  let font: FontChoice = $state(settings.font);
  let theme: ThemeChoice = $state(settings.theme);
  let message = $state('Ready');
  let busy = $state(false);
  let loadingDocumentPath = $state<string | null>(null);
  let settingsOpen = $state(false);
  let workspaceMenu: { x: number; y: number; workspace: Workspace } | null = $state(null);
  let expandedIds: string[] = $state([]);
  let active = $derived(documents.find((document) => document.id === activeId));
  let standaloneDocuments = $derived(documents.filter((document) => !document.workspacePath));

  async function openWorkspaces() {
    busy = true;
    try {
      if (!window.__TAURI_INTERNALS__) {
        message = 'Folder dialogs are available in the desktop app.';
        return;
      }
      const selected = await pickWorkspaceFolders();
      if (!selected.length) {
        message = 'Open cancelled';
        return;
      }
      const nextWorkspaces = mergeWorkspaces(workspaces, selected);
      const discovered = selected.flatMap((workspace) =>
        (workspace.markdownPaths ?? []).map((path) => createWorkspaceDocument(path, workspace)),
      );
      workspaces = nextWorkspaces;
      expandedIds = [...new Set([...expandedIds, ...selected.map((workspace) => workspace.path)])];
      documents = mergeDocuments(documents, discovered);
      const firstDocument = discovered[0];
      if (firstDocument) await selectDocument(firstDocument);
      message = discovered.length
        ? `${discovered.length} Markdown file${discovered.length === 1 ? '' : 's'} opened from folder`
        : 'No Markdown files found in selected folder';
    } catch (error) {
      message = `Could not open folder: ${error instanceof Error ? error.message : String(error)}`;
    } finally { busy = false; }
  }

  function openWorkspaceMenu(event: MouseEvent, workspace: Workspace) {
    event.preventDefault();
    workspaceMenu = { x: event.clientX, y: event.clientY, workspace };
  }

  function closeWorkspaceMenu() {
    workspaceMenu = null;
  }

  function removeWorkspace(workspace: Workspace) {
    documents = documents.filter((document) => document.workspacePath !== workspace.path);
    workspaces = workspaces.filter((current) => current.path !== workspace.path);
    expandedIds = expandedIds.filter((id) => !id.startsWith(`${workspace.path}::`));
    if (active?.workspacePath === workspace.path) activeId = documents.find((document) => document.workspacePath !== workspace.path)?.id ?? null;
    message = `${workspace.name} removed from sidebar`;
    closeWorkspaceMenu();
  }

  const workspaceNode = (workspace: Workspace): WorkspaceTreeNode => ({
    id: workspace.path,
    text: workspace.name,
    nodes: workspaceTreeNodes(documents, workspace),
  });

  const workspaceTree = $derived(workspaces.map(workspaceNode));

  const workspaceForNode = (node: WorkspaceTreeNode) =>
    workspaces.find((workspace) => workspace.path === node.id);

  async function selectDocument(document: MarkdownDocument) {
    const current = documents.find((candidate) => candidate.path === document.path) ?? document;
    activeId = current.id;
    if (current.loaded || loadingDocumentPath === current.path) return;

    loadingDocumentPath = current.path;
    message = `Loading ${current.name}`;
    try {
      const markdown = await readMarkdownFile(current.path);
      documents = markDocumentLoaded(documents, current.path, markdown);
    } catch (error) {
      if (activeId === current.id) {
        activeId = null;
        message = `Could not open ${current.name}: ${error instanceof Error ? error.message : String(error)}`;
      }
    } finally {
      if (loadingDocumentPath === current.path) loadingDocumentPath = null;
    }
  }

  function selectTreeNode(node: WorkspaceTreeNode) {
    if (node.document) void selectDocument(node.document);
  }

  function openWorkspaceMenuForNode(event: MouseEvent, node: WorkspaceTreeNode) {
    const workspace = workspaceForNode(node);
    if (workspace) openWorkspaceMenu(event, workspace);
  }

  function updateExpandedIds(event: CustomEvent<{ expandedIds: ReadonlyArray<string> }>) {
    expandedIds = [...event.detail.expandedIds];
  }

  async function saveActive() {
    if (!active || !isDirty(active)) return;
    busy = true;
    try {
      if (window.__TAURI_INTERNALS__) await saveMarkdownFile(active.path, active.markdown);
      documents = markSaved(documents, active.id);
      message = `${active.name} saved`;
    } catch (error) {
      message = `Could not save file: ${error instanceof Error ? error.message : String(error)}`;
    } finally { busy = false; }
  }

  function setFont(value: string) {
    if (!(value in fontOptions)) return;
    font = value as FontChoice;
    saveSettings({ font, theme });
  }

  function setTheme(value: string) {
    if (!['dark', 'light', 'midnight'].includes(value)) return;
    theme = value as ThemeChoice;
    saveSettings({ font, theme });
  }

  function closeSettingsOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) settingsOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { settingsOpen = false; closeWorkspaceMenu(); }
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's') { event.preventDefault(); void saveActive(); }
    if (event.key.toLowerCase() === 'k') { event.preventDefault(); void openWorkspaces(); }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('click', closeWorkspaceMenu);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('click', closeWorkspaceMenu);
    };
  });
</script>

<svelte:head><title>{active ? `${isDirty(active) ? '• ' : ''}${active.name}` : 'Plainmark'}</title></svelte:head>

<main class="app-shell" data-theme={theme} style={`--editor-font-family: ${fontOptions[font]}`}>
  <aside class="sidebar">
    <div class="brand"><span class="brand-mark">P</span><div class="sidebar-actions"><button class="icon-button" onclick={openWorkspaces} disabled={busy} aria-label="Open workspace folder" title="Open folder (Ctrl+K)">＋</button><button class="icon-button" onclick={() => settingsOpen = true} aria-label="Open settings" title="Settings">⚙</button></div></div>
    <div class="section-label">WORKSPACES</div>
    <nav aria-label="Open documents">
      {#if workspaceTree.length}
        <TreeView
          nodes={workspaceTree}
          size="compact"
          hideLabel
          labelText="Workspaces"
          selectedIds={activeId ? [activeId] : []}
          {expandedIds}
          virtualize={{ containerHeight: '100%', overscan: 8 }}
          on:select={(event) => selectTreeNode(event.detail)}
          on:toggle:change={updateExpandedIds}
        >
          {#snippet children({ node })}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <span class="tree-node-text" class:dirty-node={Boolean(node.document && isDirty(node.document))} oncontextmenu={(event) => openWorkspaceMenuForNode(event, node)}>{node.text}</span>
          {/snippet}
        </TreeView>
      {/if}
      {#if standaloneDocuments.length}
        <div class="workspace-section standalone-section">
          <div class="other-files-label">Other Files</div>
          {#each standaloneDocuments as document (document.id)}
            <button class:active={document.id === activeId} class="file-item workspace-file" onclick={() => activeId = document.id}>
              <span class="file-icon">#</span><span class="file-name">{document.name}</span>
              {#if isDirty(document)}<span class="dirty" title="Unsaved changes">●</span>{/if}
            </button>
          {/each}
        </div>
      {/if}
      {#if !documents.length && !workspaces.length}
        <p class="sidebar-empty">No files open yet.<br />Choose a Markdown file or folder to begin.</p>
      {/if}
    </nav>
    <div class="privacy"><span>◇</span><div><strong>Local only</strong><small>Your writing never leaves this device.</small></div></div>
  </aside>

  {#if workspaceMenu}
    <div class="context-menu" style={`left: ${workspaceMenu.x}px; top: ${workspaceMenu.y}px`} role="menu">
      <button role="menuitem" onclick={() => removeWorkspace(workspaceMenu!.workspace)}>Remove Folder</button>
    </div>
  {/if}

  {#if settingsOpen}
    <div class="settings-overlay" role="presentation" onclick={closeSettingsOnBackdrop}>
      <div class="settings-panel" role="dialog" aria-modal="true" aria-label="Editor settings">
        <header><strong>Settings</strong><button onclick={() => settingsOpen = false} aria-label="Close settings">×</button></header>
        <label>Font
          <select value={font} onchange={(event) => setFont(event.currentTarget.value)} aria-label="Editor font">
            <option value="gothic">Gothic</option>
            <option value="system">System sans</option>
            <option value="serif">Serif</option>
          </select>
        </label>
        <label>Theme
          <select value={theme} onchange={(event) => setTheme(event.currentTarget.value)} aria-label="Color theme">
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="midnight">Midnight</option>
          </select>
        </label>
      </div>
    </div>
  {/if}

  <section class="workspace">
    <header class="topbar">
      <div class="file-heading">
        <span class="document-glyph">#</span>
        <div><strong>{active?.name ?? 'No document'}</strong><small>{active ? (isDirty(active) ? 'Unsaved changes' : 'Saved locally') : 'Open a file to start'}</small></div>
      </div>
      <button class="save-button" class:available={active && isDirty(active)} onclick={saveActive} disabled={!active || !isDirty(active) || busy} aria-label="Save active file">Save <kbd>Ctrl S</kbd></button>
    </header>
    <div class="canvas">
      {#if active?.loaded}
        {#key active.id}
          <Editor documentId={active.id} markdown={active.markdown} onChange={(value) => documents = updateMarkdown(documents, active!.id, value)} />
        {/key}
      {:else if active && loadingDocumentPath === active.path}
        <div class="empty-state"><div class="empty-logo">P</div><h1>Loading {active.name}</h1><p>Your document will be ready shortly.</p></div>
      {:else}
        <div class="empty-state"><div class="empty-logo">P</div><h1>Open a Markdown folder</h1><p>Your documents will appear here, ready to edit.</p><button onclick={openWorkspaces}>Choose folder</button><small>or press Ctrl+K</small></div>
      {/if}
    </div>
    <footer><span>{message}</span><span>Markdown <b>·</b> UTF-8</span></footer>
  </section>
</main>
