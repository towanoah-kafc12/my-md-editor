import { describe, expect, it } from 'vitest';
import { createDocument, createWorkspace, documentsForWorkspace, fileNameFromPath, isDirty, markSaved, mergeDocuments, mergeWorkspaces, relativePathFromRoot, updateMarkdown } from './document';

describe('document state', () => {
  it('extracts names from Windows and POSIX paths', () => {
    expect(fileNameFromPath('C:\\notes\\today.md')).toBe('today.md');
    expect(fileNameFromPath('/notes/today.md')).toBe('today.md');
  });

  it('tracks edits until the document is marked saved', () => {
    const original = createDocument('note.md', '# Note');
    const edited = updateMarkdown([original], original.id, '# Updated');
    expect(isDirty(edited[0])).toBe(true);
    const saved = markSaved(edited, original.id);
    expect(isDirty(saved[0])).toBe(false);
    expect(saved[0].savedMarkdown).toBe('# Updated');
  });

  it('does not replace an open dirty file when opening the same path again', () => {
    const current = updateMarkdown([createDocument('note.md', 'disk')], 'note.md', 'draft');
    const result = mergeDocuments(current, [createDocument('note.md', 'new disk'), createDocument('other.md', 'other')]);
    expect(result).toHaveLength(2);
    expect(result[0].markdown).toBe('draft');
  });

  it('assigns workspace metadata and relative paths to documents', () => {
    const workspace = createWorkspace('C:\\notes');
    const document = createDocument('C:\\notes\\projects\\today.md', '# Today', workspace);
    expect(workspace.name).toBe('notes');
    expect(document.relativePath).toBe('projects/today.md');
    expect(relativePathFromRoot('/notes', '/notes/today.md')).toBe('today.md');
    expect(documentsForWorkspace([document], workspace.path)).toEqual([document]);
  });

  it('keeps existing workspaces and documents when a duplicate root is opened', () => {
    const workspace = createWorkspace('C:\\notes');
    const other = createWorkspace('C:\\other');
    expect(mergeWorkspaces([workspace], [workspace, other])).toEqual([workspace, other]);
  });
});
