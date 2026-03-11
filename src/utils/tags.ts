export const extractTags = (text: string): string[] => {
    // Regex matches # followed by at least one word character, supporting Unicode (Swedish characters)
    const tagRegex = /(?<=^|\s)(#[\p{L}\p{N}_]+)/gu;
    const matches = text.match(tagRegex);
    return matches ? matches : [];
};

export const getUniqueTags = (items: { text: string }[]): string[] => {
    const tagSet = new Set<string>();
    items.forEach(item => {
        const tags = extractTags(item.text);
        tags.forEach(tag => tagSet.add(tag.toLowerCase()));
    });
    return Array.from(tagSet).sort();
};

const TAG_COLORS = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
];

export const getTagColorClass = (tag: string): string => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
        hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % TAG_COLORS.length;
    return TAG_COLORS[index];
};
