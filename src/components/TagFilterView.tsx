import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SortableItem } from './SortableItem';
import { Tag } from './Tag';
import { useTranslation } from 'react-i18next';
import { Check, ChevronLeft, Edit2, Tag as TagIcon, X } from 'lucide-react';

export const TagFilterView: React.FC = () => {
  const { t } = useTranslation();
  const { tagId } = useParams<{ tagId: string }>();
  const navigate = useNavigate();
  const { getItemsByTag, allTags, deleteItem, currentList, updateListItems, updateTag } = useApp();
  const [isEditingTag, setIsEditingTag] = React.useState(false);
  const [editedName, setEditedName] = React.useState('');
  const [editedColor, setEditedColor] = React.useState('');
  const [isSavingTag, setIsSavingTag] = React.useState(false);
  const [tagError, setTagError] = React.useState<string | null>(null);

  // Get tag info
  const tag = allTags.find(t => t.id === tagId);
  const filteredItems = getItemsByTag(tagId || '');

  React.useEffect(() => {
    if (tag && !isEditingTag) {
      setEditedName(tag.name);
      setEditedColor(tag.color || '');
    }
  }, [tag, isEditingTag]);

  const startEditingTag = () => {
    if (!tag) return;
    setEditedName(tag.name);
    setEditedColor(tag.color || '');
    setTagError(null);
    setIsEditingTag(true);
  };

  const cancelEditingTag = () => {
    setTagError(null);
    setIsEditingTag(false);
  };

  const saveTag = async () => {
    if (!tag) return;
    const normalizedName = editedName.trim().toLowerCase();
    if (!normalizedName) {
      setTagError(t('tags.nameRequired', 'Tag name is required'));
      return;
    }
    const duplicate = allTags.some(existingTag =>
      existingTag.id !== tag.id && existingTag.name.toLowerCase() === normalizedName
    );
    if (duplicate) {
      setTagError(t('tags.nameTaken', 'A tag with this name already exists'));
      return;
    }

    setIsSavingTag(true);
    setTagError(null);
    try {
      await updateTag(tag.id, { name: normalizedName, color: editedColor || undefined });
      setIsEditingTag(false);
    } catch {
      setTagError(t('tags.updateFailed', 'Could not update tag'));
    } finally {
      setIsSavingTag(false);
    }
  };

  if (!tag) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {t('tags.tagNotFound', 'Tag not found')}
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.back', 'Back')}
        >
          <ChevronLeft size={20} />
        </button>
        {isEditingTag ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <input
              value={editedName}
              onChange={(event) => setEditedName(event.target.value.replace(/^#/, ''))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void saveTag();
                if (event.key === 'Escape') cancelEditingTag();
              }}
              aria-label={t('tags.name', 'Tag name')}
              className="min-w-[8rem] flex-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-900"
              autoFocus
            />
            <Tag
              tag={{ ...tag, name: editedName.trim() || tag.name, color: editedColor || tag.color }}
              interactive={false}
              showColorPicker
              onColorChange={setEditedColor}
            />
            <button type="button" onClick={() => void saveTag()} disabled={isSavingTag} className="rounded-md p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-50 dark:hover:bg-green-900/20" aria-label={t('common.save', 'Save')}>
              <Check size={18} />
            </button>
            <button type="button" onClick={cancelEditingTag} disabled={isSavingTag} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-700" aria-label={t('common.cancel', 'Cancel')}>
              <X size={18} />
            </button>
            {tagError && <span className="basis-full text-xs text-red-500">{tagError}</span>}
          </div>
        ) : (
          <>
            <Tag tag={tag} />
            <button type="button" onClick={startEditingTag} className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200" aria-label={t('tags.edit', 'Edit tag')}>
              <Edit2 size={16} />
            </button>
          </>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredItems.length} {t('tags.itemsWithTag', 'items')}
        </span>
      </div>

      {/* Tag info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <TagIcon size={16} className="text-gray-500" />
          <span className="font-medium">{tag.name}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tags.usedInLists', 'Used in {{count}} lists', { count: filteredItems.length > 0 ? 1 : 0 })}
        </p>
      </div>

      <div className="space-y-2">
        {filteredItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onToggle={async (id: string) => {
                    if (!currentList) return;
                    await updateListItems(currentList.id, currentList.items.map(currentItem =>
                      currentItem.id === id
                        ? { ...currentItem, completed: !currentItem.completed }
                        : currentItem
                    ));
                  }}
                  onDelete={async (id: string) => {
                    await deleteItem(currentList?.id || '', id);
                  }}
                  onEdit={async (id: string, text: string) => {
                    if (!currentList) return;
                    await updateListItems(currentList.id, currentList.items.map(currentItem =>
                      currentItem.id === id ? { ...currentItem, text } : currentItem
                    ));
                  }}
                  disabled={true}
                />
              ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          {t('tags.noItemsWithTag', 'No items with this tag')}
        </div>
      )}
    </div>
  );
};