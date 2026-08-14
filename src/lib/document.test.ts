import { describe, expect, it } from 'vitest';
import { createDocument, fileNameFromPath, isDirty, markSaved, mergeDocuments, updateMarkdown } from './document';

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
});
