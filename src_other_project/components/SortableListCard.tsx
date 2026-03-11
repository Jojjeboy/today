import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { Copy, ArrowRight, Trash2, GripVertical, MoreVertical, CheckCheck } from 'lucide-react';
import type { List, Category } from '../types';
import { useTranslation } from 'react-i18next';

interface SortableListCardProps {
    list: List;
    onCopy: (listId: string) => Promise<void>;
    onMove: (listId: string) => void;
    onDelete: (listId: string) => void;
    onClearCompleted: (listId: string) => void;
    isMoving: boolean;
    categories: Category[];
    currentCategoryId: string;
    onMoveToCategory: (listId: string, categoryId: string) => Promise<void>;
    showHandle: boolean;
}

export const SortableListCard: React.FC<SortableListCardProps> = ({
    list,
    onCopy,
    onMove,
    onDelete,
    onClearCompleted,
    isMoving,
    categories,
    currentCategoryId,
    onMoveToCategory,
    showHandle,
}) => {
    const { t } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: list.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const truncatedName = list.name.length > 30 ? list.name.substring(0, 30) + '...' : list.name;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex flex-col w-full min-w-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${isDragging ? 'z-50 opacity-50 outline-2 outline-blue-500' : 'z-auto'}`}
        >
            <div className="flex items-center justify-between p-4 gap-2 min-w-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">

                    <Link
                        to={`/list/${list.id}`}
                        className="flex-1 min-w-0 text-lg font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="truncate" title={list.name}>
                                {truncatedName}
                            </div>
                        </div>
                    </Link>
                    {showHandle && (
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing hover:text-gray-600 dark:hover:text-gray-300 p-1 touch-none flex-shrink-0 mr-2"
                            style={{ color: '#e1e1e1' }}
                        >
                            <GripVertical size={24} strokeWidth={2.5} />
                        </div>
                    )}
                </div>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title={t('lists.actions')}
                    >
                        <MoreVertical size={18} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                            <button
                                onClick={async () => {
                                    await onCopy(list.id);
                                    setDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            >
                                <Copy size={16} />
                                {t('lists.copy')}
                            </button>
                            <button
                                onClick={() => {
                                    onMove(list.id);
                                    setDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors"
                            >
                                <ArrowRight size={16} />
                                {t('lists.move')}
                            </button>
                            <button
                                onClick={() => {
                                    onClearCompleted(list.id);
                                    setDropdownOpen(false);
                                }}
                                disabled={!list.items.some(item => item.completed)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${list.items.some(item => item.completed)
                                    ? 'text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30'
                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                            >
                                <CheckCheck size={16} />
                                {t('lists.clearCompleted')}
                            </button>
                            <button
                                onClick={() => {
                                    onDelete(list.id);
                                    setDropdownOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                                <Trash2 size={16} />
                                {t('lists.deleteTitle')}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isMoving && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
                    <p className="text-sm text-gray-500 mb-2">{t('lists.moveToCategory')}</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.filter(c => c.id !== currentCategoryId).map(c => (
                            <button
                                key={c.id}
                                onClick={async () => {
                                    await onMoveToCategory(list.id, c.id);
                                }}
                                className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:border-blue-500 hover:text-blue-500 transition-colors"
                            >
                                {c.name}
                            </button>
                        ))}
                        {categories.length <= 1 && <span className="text-sm text-gray-400">{t('lists.noOtherCategories')}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};
