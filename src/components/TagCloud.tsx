import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tag } from './Tag';
import type { Tag as TagType } from '../types';

interface TagCloudProps {
  tags: TagType[];
  selectedTag?: string;
  onTagClick: (tagId: string) => void;
  maxTags?: number;
  showMore?: boolean;
  className?: string;
}

export const TagCloud: React.FC<TagCloudProps> = ({
  tags,
  selectedTag,
  onTagClick,
  maxTags = 10,
  showMore = true,
  className = ''
}) => {
  const { t } = useTranslation();

  // Sort tags by usageCount (most popular first), then by name
  const sortedTags = [...tags].sort((a, b) => {
    const countDiff = (b.usageCount || 0) - (a.usageCount || 0);
    if (countDiff !== 0) return countDiff;
    return a.name.localeCompare(b.name);
  });

  const visibleTags = sortedTags.slice(0, maxTags);
  const remainingTags = sortedTags.length - maxTags;

  if (tags.length === 0) {
    return (
      <div className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        {t('tags.noTags', 'No tags yet')}
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {visibleTags.map(tag => (
        <Tag
          key={tag.id}
          tag={tag}
          onClick={() => onTagClick(tag.id)}
          interactive={true}
          className={selectedTag === tag.id ? 'ring-2 ring-blue-500 rounded-lg' : ''}
        />
      ))}

      {showMore && remainingTags > 0 && (
        <button
          onClick={() => onTagClick('all')}
          className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          +{remainingTags} {t('tags.more', 'more')}
        </button>
      )}
    </div>
  );
};