import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item, Priority } from '../types';
import { Trash2, GripVertical, CloudUpload, Plus, ListTree, Flag, Calendar } from 'lucide-react';
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    Type as ListType,
} from 'react-swipeable-list';
import { MAX_ITEM_LENGTH } from '../constants';
import { useTranslation } from 'react-i18next';
import 'react-swipeable-list/dist/styles.css';

interface SortableItemProps {
    item: Item;
    onToggle?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, text: string) => void;
    onUpdate?: (id: string, updates: Partial<Item>) => void;
    disabled?: boolean;
    /** Subtask items that belong to this parent */
    subtasks?: Item[];
    /** Called when the user clicks "add subtask" */
    onAddSubtask?: (parentId: string) => void;
}

// ── Subtask Row ──────────────────────────────────────────────────────────────
interface SubtaskRowProps {
    item: Item;
    isPending?: boolean;
    onToggle?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, text: string) => void;
    autoFocus?: boolean;
}

const SubtaskRow: React.FC<SubtaskRowProps> = ({ item, isPending, onToggle, onDelete, onEdit, autoFocus }) => {
    const [localText, setLocalText] = React.useState(item.text);
    const [isEditing, setIsEditing] = React.useState(autoFocus || item.text === '');
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setLocalText(item.text);
    }, [item.text]);

    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const commit = () => {
        setIsEditing(false);
        if (onEdit && localText.trim() !== item.text) {
            if (localText.trim()) {
                onEdit(item.id, localText.trim());
            } else {
                // Empty text → delete subtask
                onDelete?.(item.id);
            }
        } else if (!localText.trim()) {
            onDelete?.(item.id);
        }
    };

    return (
        <div className="flex items-center gap-3 pl-3 pr-2 py-2 group/sub rounded-xl hover:bg-gray-50/50 dark:hover:bg-[#18181b]/40 transition-colors">
            {/* Indent marker */}
            <div className="w-4 flex-shrink-0 flex justify-center">
                <div className="w-0.5 h-full min-h-[1rem] bg-gray-200 dark:bg-gray-600 rounded-full" />
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onToggle?.(item.id); }}
                className="flex-shrink-0 transition-transform active:scale-90"
                aria-label={item.completed ? 'Mark subtask as incomplete' : 'Mark subtask as complete'}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                {item.completed ? (
                    <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center text-black shadow-sm shadow-primary/40">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                ) : (
                    <div className="w-4 h-4 rounded-md border-2 border-gray-300 dark:border-[#4a5568]"></div>
                )}
            </button>

            {/* Text / edit */}
            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={localText}
                        onChange={(e) => setLocalText(e.target.value)}
                        onBlur={commit}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); commit(); }
                            if (e.key === 'Escape') { setLocalText(item.text); setIsEditing(false); }
                        }}
                        maxLength={MAX_ITEM_LENGTH}
                        placeholder="Subtask…"
                        className="w-full bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-500"
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className={`block w-full text-sm cursor-text truncate ${
                            item.completed
                                ? 'line-through text-gray-400 dark:text-gray-500'
                                : 'text-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {localText || <span className="opacity-40 italic">Subtask…</span>}
                    </span>
                )}
            </div>

            {/* Pending indicator */}
            {isPending && (
                <div className="flex-shrink-0 text-blue-400 dark:text-blue-500 animate-in fade-in duration-300" title="Syncing…">
                    <CloudUpload size={12} />
                </div>
            )}

            {/* Delete — visible on hover (desktop) or always on mobile  */}
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                    className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 transition-colors
                               opacity-100 sm:opacity-0 sm:group-hover/sub:opacity-100 focus:opacity-100"
                    aria-label="Delete subtask"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    );
};

// ── SortableItem ─────────────────────────────────────────────────────────────
export const SortableItem: React.FC<SortableItemProps> = ({
    item,
    onToggle,
    onDelete,
    onEdit,
    onUpdate,
    disabled,
    subtasks = [],
    onAddSubtask,
}) => {
    const { t } = useTranslation();
    const [localText, setLocalText] = React.useState(item.text);
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);

    // Auto-resize logic for editing
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [isEditing, localText]);

    React.useEffect(() => {
        setLocalText(item.text);
    }, [item.text]);

    const handleBlur = () => {
        setIsEditing(false);
        if (onEdit && localText !== item.text) {
            onEdit(item.id, localText);
        }
    };

    const handlePriorityToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onUpdate) return;
        
        // Cycle: low -> medium -> high
        const priorities: Priority[] = ['low', 'medium', 'high'];
        const currentIndex = priorities.indexOf(item.priority || 'low');
        const nextIndex = (currentIndex + 1) % priorities.length;
        const nextPriority = priorities[nextIndex];

        onUpdate(item.id, { priority: nextPriority });
    };

    const getPriorityColor = (p?: Priority) => {
        switch (p) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-transparent';
        }
    };

    const getPriorityTextColor = (p?: Priority) => {
        switch (p) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-blue-500';
            default: return 'text-gray-300 dark:text-gray-600';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditing(false);
            if (onEdit && localText !== item.text) {
                onEdit(item.id, localText);
            }
        }
    };

    // Auto-focus input when entering edit mode
    React.useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);



    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id, disabled });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const trailingActions = () => (
        <TrailingActions>
            <SwipeAction
                destructive={true}
                onClick={() => onDelete && onDelete(item.id)}
            >
                <div className="flex items-center justify-end px-4 bg-red-500 text-white h-full rounded-r-2xl">
                    <Trash2 size={24} />
                </div>
            </SwipeAction>
        </TrailingActions>
    );

    const isReadOnly = !onToggle && !onEdit;
    const isInteractionDisabled = isReadOnly;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group todo-item-row ${isDragging ? 'z-50' : ''}`}
            tabIndex={disabled ? -1 : 0}
            aria-label={`Todo item: ${item.text}`}
            onKeyDown={(e) => {
                if (isEditing) return;

                if (e.key === ' ') {
                    e.preventDefault();
                    if (onToggle) onToggle(item.id);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const allItems = Array.from(document.querySelectorAll('.todo-item-row')) as HTMLElement[];
                    const currentIndex = allItems.indexOf(e.currentTarget);
                    if (currentIndex < allItems.length - 1) {
                        allItems[currentIndex + 1].focus();
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    const allItems = Array.from(document.querySelectorAll('.todo-item-row')) as HTMLElement[];
                    const currentIndex = allItems.indexOf(e.currentTarget);
                    if (currentIndex > 0) {
                        allItems[currentIndex - 1].focus();
                    }
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (!isReadOnly) setIsEditing(true);
                }
            }}
        >
            <SwipeableList threshold={0.25} type={ListType.IOS}>
                <SwipeableListItem
                    trailingActions={trailingActions()}
                >
                    <div className="w-full flex items-center gap-4 p-4 bg-white dark:bg-[#3d4551] rounded-3xl group-focus:ring-2 group-focus:ring-primary/30 outline-none transition-all shadow-sm overflow-hidden relative">
                        {/* Priority Indicator Bar */}
                        {item.priority && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getPriorityColor(item.priority)}`} />
                        )}
                        
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggle) onToggle(item.id);
                            }}
                            className={`flex-shrink-0 transition-transform active:scale-90 ${isInteractionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            {item.completed ? (
                                <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-black shadow-md shadow-primary/40">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-lg border-[2.5px] border-gray-300 dark:border-[#4a5568] hover:border-gray-400 dark:hover:border-[#718096] transition-colors"></div>
                            )}
                        </button>

                        <div className="flex-1 min-w-0 flex items-center h-full relative">
                            {isEditing && !isReadOnly ? (
                                <div className="w-full relative">
                                    <textarea
                                        ref={inputRef}
                                        value={localText}
                                        onChange={(e) => setLocalText(e.target.value)}
                                        onBlur={handleBlur}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                handleKeyDown(e);
                                            }
                                        }}
                                        aria-label="Edit item text"
                                        maxLength={MAX_ITEM_LENGTH}
                                        rows={1}
                                        className="w-full bg-transparent outline-none p-1 text-gray-700 dark:text-gray-200 resize-none overflow-hidden leading-normal"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onTouchStart={(e) => e.stopPropagation()}
                                    />
                                    {localText.length > MAX_ITEM_LENGTH * 0.8 && (
                                        <div className="absolute right-0 -bottom-4 text-[9px] font-bold text-gray-400 animate-in fade-in duration-300">
                                            {localText.length}/{MAX_ITEM_LENGTH}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div
                                    onClick={(e) => {
                                        if (!isReadOnly) {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }
                                    }}
                                    className={`w-full p-1 min-h-[1.5rem] truncate cursor-text ${(() => {
                                        if (item.completed) return 'line-through text-gray-400';
                                        return 'text-gray-700 dark:text-gray-200';
                                    })()} ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                                >
                                    {localText}
                                </div>
                            )}
                            
                            {/* Due Date Badge */}
                            {item.dueDate && (
                                <div className="ml-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[10px] font-bold text-blue-500 border border-blue-100 dark:border-blue-800 animate-in fade-in zoom-in duration-300 whitespace-nowrap">
                                    <Calendar size={10} />
                                    {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </div>
                            )}
                        </div>

                        {item.isPending && (
                            <div className="flex-shrink-0 text-blue-400 dark:text-blue-500 animate-in fade-in duration-300" title="Syncing...">
                                <CloudUpload size={16} />
                            </div>
                        )}

                        {/* Add-subtask button — touch-friendly, always visible on mobile */}
                        {onAddSubtask && !isReadOnly && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddSubtask(item.id); }}
                                className="flex-shrink-0 p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                                           transition-colors
                                           opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                aria-label={t('lists.addSubtask', 'Add subtask')}
                                title={t('lists.addSubtask', 'Add subtask')}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <ListTree size={16} />
                            </button>
                        )}

                        {/* Priority Toggle Button */}
                        {!isReadOnly && (
                            <button
                                onClick={handlePriorityToggle}
                                className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200
                                           ${getPriorityTextColor(item.priority)}
                                           hover:bg-gray-100 dark:hover:bg-gray-700
                                           opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100
                                           active:scale-90`}
                                aria-label="Cycle priority"
                                title={`Priority: ${item.priority || 'Low'}`}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <Flag size={16} fill={(item.priority && item.priority !== 'low') ? 'currentColor' : 'none'} strokeWidth={2.5} />
                            </button>
                        )}

                        {!disabled && (
                            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 touch-none" aria-label="Drag to reorder item">
                                <GripVertical size={24} strokeWidth={2.5} />
                            </div>
                        )}

                        {onDelete && (
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                aria-label="Delete item"
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </SwipeableListItem>
            </SwipeableList>

            {/* ── Subtasks ────────────────────────────────────────────── */}
            {subtasks.length > 0 && (
                <div className="ml-4 mt-0.5 mb-1 border-l-2 border-gray-100 dark:border-gray-700 rounded-bl-lg pl-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
                    {subtasks.map((sub) => (
                        <SubtaskRow
                            key={sub.id}
                            item={sub}
                            isPending={sub.isPending}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            )}

            {/* Inline "add subtask" row — appears after subtasks */}
            {onAddSubtask && !isReadOnly && subtasks.length > 0 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onAddSubtask(item.id); }}
                    className="ml-4 pl-7 flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors py-1
                               opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    aria-label={t('lists.addSubtask', 'Add subtask')}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <Plus size={12} />
                    {t('lists.addSubtask', 'Add subtask')}
                </button>
            )}
        </div>
    );
};
