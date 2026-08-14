<script lang="ts">
  import { Crepe } from '@milkdown/crepe';
  import { onMount } from 'svelte';

  let { documentId, markdown, onChange }: {
    documentId: string;
    markdown: string;
    onChange: (markdown: string) => void;
  } = $props();

  let root: HTMLDivElement;

  onMount(() => {
    let disposed = false;
    let created = false;
    const crepe = new Crepe({
      root,
      defaultValue: markdown,
      features: {
        [Crepe.Feature.CodeMirror]: false,
        [Crepe.Feature.ImageBlock]: false,
        [Crepe.Feature.Latex]: false,
      },
    });

    // Crepe normalizes the initial Markdown while creating its ProseMirror
    // document. Registering the listener before create() resolves would report
    // that normalization as a user edit and make a freshly opened file dirty.
    void crepe.create().then(() => {
      created = true;
      if (disposed) {
        void crepe.destroy();
        return;
      }
      // Crepe's create-time transaction is emitted by ListenerManager after a
      // debounce, so it can arrive after create() has resolved and after this
      // listener is attached. Capture the normalized document as a semantic
      // baseline rather than relying on timing. Ignore only the first matching
      // baseline event; a real edit (including a later revert to the baseline)
      // is still forwarded.
      const initialBaseline = crepe.getMarkdown();
      let waitingForBaseline = true;
      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, value) => {
          if (waitingForBaseline && value === initialBaseline) {
            waitingForBaseline = false;
            return;
          }
          waitingForBaseline = false;
          onChange(value);
        });
      });
    });

    return () => {
      disposed = true;
      if (created) void crepe.destroy();
    };
  });
</script>

<div class="editor-shell" data-document={documentId} bind:this={root}></div>
