import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Item } from '../types';
import { Trash2, GripVertical, Circle, CheckCircle2, CloudUpload } from 'lucide-react';
import {
    SwipeableList,
    SwipeableListItem,
    SwipeAction,
    TrailingActions,
    Type as ListType,
} from 'react-swipeable-list';
import { getTagColorClass, extractTags } from '../utils/tags';
import { MAX_ITEM_LENGTH } from '../constants';
import 'react-swipeable-list/dist/styles.css';

interface SortableItemProps {
    item: Item;
    onToggle?: (id: string) => void;
    onDelete?: (id: string) => void;
    onEdit?: (id: string, text: string) => void;
    disabled?: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({ item, onToggle, onDelete, onEdit, disabled }) => {
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

    const renderTextWithTags = () => {
        if (!localText) return null;
        const tags = extractTags(localText);
        if (tags.length === 0) return <span>{localText}</span>;

        // Split the text by tags and interleave with styled tag spans
        let remainingText = localText;
        const parts: React.ReactNode[] = [];
        
        tags.forEach((tag, i) => {
            const index = remainingText.indexOf(tag);
            if (index > -1) {
                if (index > 0) {
                    parts.push(<span key={`text-${i}`}>{remainingText.slice(0, index)}</span>);
                }
                parts.push(
                    <span 
                        key={`tag-${i}`} 
                        className={`inline-block px-2.5 py-0.5 mx-1 rounded-full text-xs font-medium ${getTagColorClass(tag)}`}
                    >
                        {tag}
                    </span>
                );
                remainingText = remainingText.slice(index + tag.length);
            }
        });
        
        if (remainingText) {
            parts.push(<span key="text-end">{remainingText}</span>);
        }

        return <>{parts}</>;
    };

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
                <div className="flex items-center justify-end px-4 bg-red-500 text-white h-full rounded-r-lg">
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
                // Ignore keys if we are in editing mode (the textarea handles its own keys)
                // Om vi editerar (textarea är öppen) så låter vi den sköta sina egna tangenter.
                if (isEditing) return;

                if (e.key === ' ') {
                    // Mellanslag växlar om en todo är färdig eller inte.
                    e.preventDefault();
                    if (onToggle) onToggle(item.id);
                } else if (e.key === 'ArrowDown') {
                    // Pil ner flyttar fokus till nästa todo i listan.
                    e.preventDefault();
                    const allItems = Array.from(document.querySelectorAll('.todo-item-row')) as HTMLElement[];
                    const currentIndex = allItems.indexOf(e.currentTarget);
                    if (currentIndex < allItems.length - 1) {
                        allItems[currentIndex + 1].focus();
                    }
                } else if (e.key === 'ArrowUp') {
                    // Pil upp flyttar fokus till föregående todo.
                    e.preventDefault();
                    const allItems = Array.from(document.querySelectorAll('.todo-item-row')) as HTMLElement[];
                    const currentIndex = allItems.indexOf(e.currentTarget);
                    if (currentIndex > 0) {
                        allItems[currentIndex - 1].focus();
                    }
                } else if (e.key === 'Enter') {
                    // Enter startar editering av todon.
                    e.preventDefault();
                    if (!isReadOnly) setIsEditing(true);
                }
            }}
        >
            <SwipeableList threshold={0.25} type={ListType.IOS}>
                <SwipeableListItem
                    trailingActions={trailingActions()}
                >
                    <div className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-primary/50 group-focus:ring-2 group-focus:ring-primary/50 outline-none transition-all">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onToggle) onToggle(item.id);
                            }}
                            className={`flex-shrink-0 transition-colors ${isInteractionDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={item.completed ? "Mark as incomplete" : "Mark as complete"}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            {/* Render different icons based on state */}
                            {(() => {
                                if (item.completed) {
                                    return (
                                        <div className="text-blue-500 hover:text-blue-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                    );
                                }
                                return (
                                    <div className="text-gray-300 hover:text-gray-400">
                                        <Circle size={24} />
                                    </div>
                                );
                            })()}
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
                                    {renderTextWithTags()}
                                </div>
                            )}
                        </div>

                        {item.isPending && (
                            <div className="flex-shrink-0 text-blue-400 dark:text-blue-500 animate-in fade-in duration-300" title="Syncing...">
                                <CloudUpload size={16} />
                            </div>
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
                                // Stop propagation to prevent swipe start when clicking button
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </SwipeableListItem>
            </SwipeableList>
        </div>
    );
};
