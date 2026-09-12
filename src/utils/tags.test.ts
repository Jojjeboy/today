import { describe, expect, it } from 'vitest';
import { extractTagNamesFromText, removeTagsFromText } from './tags';

describe('tag utilities', () => {
  it('extracts unique tag names case-insensitively', () => {
    expect(extractTagNamesFromText('Buy milk #Food and fruit #food')).toEqual(['food']);
  });

  it('removes tags while preserving readable spacing', () => {
    expect(removeTagsFromText('Buy #food  and #urgent')).toBe('Buy and');
  });
});