<script lang="ts">
  import Editor from './lib/Editor.svelte';
  import { createDocument, isDirty, markSaved, mergeDocuments, updateMarkdown, type MarkdownDocument } from './lib/document';
  import { pickMarkdownFiles, saveMarkdownFile } from './lib/files';
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
  let activeId: string | null = $state(browserDemo ? demo.id : null);
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

  function handleKeydown(event: KeyboardEvent) {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (event.key.toLowerCase() === 's') { event.preventDefault(); void saveActive(); }
    if (event.key.toLowerCase() === 'o') { event.preventDefault(); void openFiles(); }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head><title>{active ? `${isDirty(active) ? '• ' : ''}${active.name}` : 'Plainmark'}</title></svelte:head>

<main class="app-shell">
  <aside class="sidebar">
    <div class="brand"><span class="brand-mark">P</span><strong>Plainmark</strong></div>
    <button class="open-button" onclick={openFiles} disabled={busy} aria-label="Open Markdown files">
      <span>＋</span> Open files <kbd>Ctrl O</kbd>
    </button>
    <div class="section-label">OPEN DOCUMENTS</div>
    <nav aria-label="Open documents">
      {#each documents as document (document.id)}
        <button class:active={document.id === activeId} class="file-item" onclick={() => activeId = document.id}>
          <span class="file-icon">#</span><span class="file-name">{document.name}</span>
          {#if isDirty(document)}<span class="dirty" title="Unsaved changes">●</span>{/if}
        </button>
      {:else}
        <p class="sidebar-empty">No files open yet.<br />Choose a Markdown file to begin.</p>
      {/each}
    </nav>
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
        <div class="empty-state"><div class="empty-logo">P</div><h1>Open a Markdown file</h1><p>Your document will appear here, ready to edit.</p><button onclick={openFiles}>Choose files</button><small>or press Ctrl+O</small></div>
      {/if}
    </div>
    <footer><span>{message}</span><span>Markdown <b>·</b> UTF-8</span></footer>
  </section>
</main>
