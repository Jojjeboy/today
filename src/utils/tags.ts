/**
 * Extract tag names from text (e.g., "#food" -> "food")
 * Returns unique lowercase tag names
 */
export const extractTagNamesFromText = (text: string): string[] => {
  const tagRegex = /#(\w+)/g;
  const tags: string[] = [];
  let match;

  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  return [...new Set(tags)]; // Remove duplicates
};

/**
 * Remove tags from text (e.g., "Buy #food" -> "Buy")
 */
export const removeTagsFromText = (text: string): string => {
  return text.replace(/#(\w+)/g, '').trim().replace(/\s+/g, ' ');
};

/**
 * Generate a random color from a predefined palette
 * This ensures consistent colors across the app
 */
export const generateRandomColor = (): string => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#8A2BE2', '#FF7F50', '#6495ED', '#DC143C',
    '#20B2AA', '#FFD700', '#ADFF2F', '#FF69B4', '#1E90FF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generate a deterministic color based on a string (e.g., tag name)
 * Same string always produces the same color
 */
export const generateDeterministicColor = (input: string): string => {
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3',
    '#33FFF3', '#8A2BE2', '#FF7F50', '#6495ED', '#DC143C',
    '#20B2AA', '#FFD700', '#ADFF2F', '#FF69B4', '#1E90FF'
  ];
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get all unique tag IDs from a list of items
 */
export const getTagIdsFromItems = (items: { tags?: string[] }[]): string[] => {
  const tagIds: Set<string> = new Set();
  items.forEach(item => {
    if (item.tags) {
      item.tags.forEach(tagId => tagIds.add(tagId));
    }
  });
  return Array.from(tagIds);
};

/**
 * Check if a text contains any tag references
 */
export const hasTagsInText = (text: string): boolean => {
  return /#\w+/.test(text);
};

/**
 * Replace tag names in text with tag IDs
 * Useful for converting from text-based tags to ID-based tags
 */
export const replaceTagNamesWithIds = (
  text: string,
  tagNameToId: Record<string, string>
): { text: string; tagIds: string[] } => {
  const tagNames = extractTagNamesFromText(text);
  const tagIds: string[] = [];
  let resultText = text;

  tagNames.forEach(tagName => {
    const tagId = tagNameToId[tagName];
    if (tagId) {
      tagIds.push(tagId);
      // Remove the tag from text
      resultText = resultText.replace(new RegExp(`#${tagName}\\b`, 'gi'), '').trim();
    }
  });

  return {
    text: resultText.replace(/\s+/g, ' '),
    tagIds
  };
};