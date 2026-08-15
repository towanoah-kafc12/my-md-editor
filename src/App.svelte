<script lang="ts">
  import Editor from './lib/Editor.svelte';
  import { createDocument, documentsForWorkspace, isDirty, markSaved, mergeDocuments, mergeWorkspaces, updateMarkdown, type MarkdownDocument, type Workspace } from './lib/document';
  import { pickMarkdownFiles, pickWorkspaceFolders, readWorkspaceDocuments, saveMarkdownFile } from './lib/files';
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
  let active = $derived(documents.find((document) => document.id === activeId));

  async function openFiles() {
    busy = true;
    try {
      if (!window.__TAURI_INTERNALS__) {
        message = 'File dialogs are available in the desktop app.';
        return;
      }
      const opened = await pickMarkdownFiles();
      documents = mergeDocuments(documents, opened);
      if (opened.length) activeId = opened[0].id;
      message = opened.length ? `${opened.length} file${opened.length === 1 ? '' : 's'} opened` : 'Open cancelled';
    } catch (error) {
      message = `Could not open file: ${error instanceof Error ? error.message : String(error)}`;
    } finally { busy = false; }
  }

  async function openWorkspaces() {
    busy = true;
    try {
      if (!window.__TAURI_INTERNALS__) {
        message = 'Folder dialogs are available in the desktop app.';
        return;
      }
      const selected = await pickWorkspaceFolders();
      const newWorkspaces = selected.filter(
        (workspace) => !workspaces.some((current) => current.path === workspace.path),
      );
      const results = await Promise.allSettled(newWorkspaces.map(readWorkspaceDocuments));
      const loaded = results.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
      const failed = results.filter((result) => result.status === 'rejected').length;
      workspaces = mergeWorkspaces(workspaces, selected);
      documents = mergeDocuments(documents, loaded);
      if (loaded.length) activeId = loaded[0].id;
      if (!selected.length) message = 'Open cancelled';
      else if (failed) message = `${loaded.length} file${loaded.length === 1 ? '' : 's'} opened; ${failed} folder${failed === 1 ? '' : 's'} could not be read`;
      else if (!loaded.length) message = 'No Markdown files found in selected folder';
      else message = `${loaded.length} file${loaded.length === 1 ? '' : 's'} opened from ${newWorkspaces.length} folder${newWorkspaces.length === 1 ? '' : 's'}`;
    } catch (error) {
      message = `Could not open folder: ${error instanceof Error ? error.message : String(error)}`;
    } finally { busy = false; }
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

  function handleKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's') { event.preventDefault(); void saveActive(); }
    if (event.key.toLowerCase() === 'o') { event.preventDefault(); void openFiles(); }
    if (event.key.toLowerCase() === 'k') { event.preventDefault(); void openWorkspaces(); }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head><title>{active ? `${isDirty(active) ? '• ' : ''}${active.name}` : 'Plainmark'}</title></svelte:head>

<main class="app-shell" data-theme={theme} style={`--editor-font-family: ${fontOptions[font]}`}>
  <aside class="sidebar">
    <div class="brand"><span class="brand-mark">P</span><strong>Plainmark</strong></div>
    <button class="open-button" onclick={openFiles} disabled={busy} aria-label="Open Markdown files">
      <span>＋</span> Open files <kbd>Ctrl O</kbd>
    </button>
    <button class="open-button workspace-button" onclick={openWorkspaces} disabled={busy} aria-label="Open workspace folders">
      <span>□</span> Open folders <kbd>Ctrl K</kbd>
    </button>
    <div class="section-label">OPEN DOCUMENTS</div>
    <nav aria-label="Open documents">
      {#each documents.filter((document) => !document.workspacePath) as document (document.id)}
        <button class:active={document.id === activeId} class="file-item" onclick={() => activeId = document.id}>
          <span class="file-icon">#</span><span class="file-name">{document.name}</span>
          {#if isDirty(document)}<span class="dirty" title="Unsaved changes">●</span>{/if}
        </button>
      {/each}
      {#each workspaces as workspace (workspace.path)}
        <div class="workspace-section">
          <div class="workspace-label" title={workspace.path}>⌁ {workspace.name}</div>
          {#each documentsForWorkspace(documents, workspace.path) as document (document.id)}
            <button class:active={document.id === activeId} class="file-item workspace-file" onclick={() => activeId = document.id} title={document.relativePath}>
              <span class="file-icon">#</span><span class="file-name">{document.relativePath ?? document.name}</span>
              {#if isDirty(document)}<span class="dirty" title="Unsaved changes">●</span>{/if}
            </button>
          {:else}
            <p class="sidebar-empty workspace-empty">No Markdown files</p>
          {/each}
        </div>
      {/each}
      {#if !documents.length && !workspaces.length}
        <p class="sidebar-empty">No files open yet.<br />Choose a Markdown file or folder to begin.</p>
      {/if}
    </nav>
    <div class="settings" aria-label="Editor settings">
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
    <div class="privacy"><span>◇</span><div><strong>Local only</strong><small>Your writing never leaves this device.</small></div></div>
  </aside>

  <section class="workspace">
    <header class="topbar">
      <div class="file-heading">
        <span class="document-glyph">#</span>
        <div><strong>{active?.name ?? 'No document'}</strong><small>{active ? (isDirty(active) ? 'Unsaved changes' : 'Saved locally') : 'Open a file to start'}</small></div>
      </div>
      <button class="save-button" class:available={active && isDirty(active)} onclick={saveActive} disabled={!active || !isDirty(active) || busy} aria-label="Save active file">Save <kbd>Ctrl S</kbd></button>
    </header>
    <div class="canvas">
      {#if active}
        {#key active.id}
          <Editor documentId={active.id} markdown={active.markdown} onChange={(value) => documents = updateMarkdown(documents, active!.id, value)} />
        {/key}
      {:else}
        <div class="empty-state"><div class="empty-logo">P</div><h1>Open a Markdown file</h1><p>Your document will appear here, ready to edit.</p><button onclick={openFiles}>Choose files</button><button class="empty-folder-button" onclick={openWorkspaces}>Choose folder</button><small>or press Ctrl+O / Ctrl+K</small></div>
      {/if}
    </div>
    <footer><span>{message}</span><span>Markdown <b>·</b> UTF-8</span></footer>
  </section>
</main>
