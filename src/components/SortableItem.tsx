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
    const inputRef = React.useRef<HTMLInputElement>(null);

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
            className={`relative group ${isDragging ? 'z-50' : ''}`}
        >
            <SwipeableList threshold={0.25} type={ListType.IOS}>
                <SwipeableListItem
                    trailingActions={trailingActions()}
                >
                    <div className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
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

                        <div className="flex-1 min-w-0 flex items-center h-full">
                            {isEditing && !isReadOnly ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={localText}
                                    onChange={(e) => setLocalText(e.target.value)}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    aria-label="Edit item text"
                                    className="w-full bg-transparent outline-none p-1 text-gray-700 dark:text-gray-200"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                />
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
