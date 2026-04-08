import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import type { Item, List } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus, RotateCcw, ChevronDown, CloudUpload, X, Calendar, ArrowUpDown, Clock, Flag, Type } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Confetti } from './Confetti';
import { CelebrationOverlay } from './CelebrationOverlay';
import { useCelebration } from '../hooks/useCelebration';
import { useTranslation } from 'react-i18next';
import { InlineAutocompleteInput } from './InlineAutocompleteInput';
import { MAX_ITEM_LENGTH } from '../constants';
import * as chronoNode from 'chrono-node';
const chronoParse = (chronoNode as unknown as { parse?: typeof chronoNode.parse }).parse ?? chronoNode.parse;



export const TodoListView: React.FC = React.memo(function TodoListView() {
    const { t } = useTranslation();
    const { lists, defaultListId, updateListItems, deleteItem, updateListAccess, loading, itemHistory, addToHistory, deleteFromHistory } = useApp();
    const { showToast } = useToast();
    const [newItemText, setNewItemText] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');
    const wasAllCompleted = React.useRef<boolean>(false);
    const isFirstLoad = React.useRef<boolean>(true);
    const { getCelebrationMessage } = useCelebration();
    const [suggestions, setSuggestions] = useState<(typeof itemHistory)>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [completedAccordionOpen, setCompletedAccordionOpen] = useState(false);

    const list: List | undefined = lists.find((l) => l.id === defaultListId);

    React.useEffect(() => {
        if (list) {
            document.title = `today - ${t('lists.groceryTitle')}`;
            updateListAccess(list.id);
        }
    }, [list?.id, t, updateListAccess]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [sortBy, setSortBy] = useState<'manual' | 'alphabetical' | 'completed' | 'priority' | 'dueDate'>('manual');

    useEffect(() => {
        if (list?.settings?.defaultSort) {
            setSortBy(list.settings.defaultSort);
        }
    }, [list?.settings?.defaultSort]);

    const sortedItems = React.useMemo(() => {
        if (!list) return [];
        const items = [...list.items];

        if (sortBy === 'alphabetical') {
            items.sort((a, b) => a.text.localeCompare(b.text));
        } else if (sortBy === 'completed') {
            items.sort((a, b) => {
                const getWeight = (item: Item) => (item.completed ? 2 : 1);
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                return a.text.localeCompare(b.text);
            });
        } else if (sortBy === 'priority') {
            const priorityWeight: Record<NonNullable<Item['priority']> | 'none', number> = { high: 3, medium: 2, low: 1, none: 0 };
            items.sort((a, b) => {
                const weightA = priorityWeight[a.priority || 'none'] || 0;
                const weightB = priorityWeight[b.priority || 'none'] || 0;
                if (weightA !== weightB) return weightB - weightA; // High to Low
                return 0;
            });
        } else if (sortBy === 'dueDate') {
            items.sort((a, b) => {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1; // Items without due date go to the bottom
                if (!b.dueDate) return -1;
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            });
        }
        return items;
    }, [list, sortBy]);

    // Autocomplete Logic
    useEffect(() => {
        if (!newItemText.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const searchText = newItemText.toLowerCase();

        // Filter history
        const historyMatches = itemHistory.filter(h =>
            h.text.toLowerCase().includes(searchText)
        );

        // Sort by usage count
        historyMatches.sort((a, b) => b.usageCount - a.usageCount);

        setSuggestions(historyMatches.slice(0, 5));
        setShowSuggestions(true);
    }, [newItemText, itemHistory]);

    // CELEBRATION TRIGGER: Watch for list completion
    useEffect(() => {
        if (!list || list.items.length === 0) {
            wasAllCompleted.current = false;
            if (list) isFirstLoad.current = false;
            return;
        }

        const isAllCompletedNow = list.items.every(item => item.completed);

        if (isAllCompletedNow && !wasAllCompleted.current && !isFirstLoad.current) {
            // Trigger celebration!
            const msg = getCelebrationMessage();
            setCelebrationMessage(msg);
            setShowConfetti(true);
            setTimeout(() => {
                setShowConfetti(false);
                setCelebrationMessage('');
            }, 6000);
        }

        wasAllCompleted.current = isAllCompletedNow;
        isFirstLoad.current = false;
    }, [list?.items, getCelebrationMessage, showToast]);

    if (loading && !list) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
    }

    if (!list) return <div className="text-center py-10">{t('lists.notFound')}</div>;

    const handleAddItem = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();
        const textToAdd = (textOverride || newItemText).trim();

        if (list && textToAdd) {
            try {
                // Check if item exists (completed) -> Restore it
                const normalize = (s: string) => s.trim().toLowerCase().normalize("NFC");
                const existingItem = list.items.find(i => normalize(i.text) === normalize(textToAdd));

                if (existingItem) {
                    if (existingItem.completed) {
                        // Clear input immediately for "Optimistic" feel
                        setNewItemText('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                        await handleToggle(existingItem.id);
                    } else {
                        // Item exists and is active - notify user
                        showToast(t('lists.itemExists', 'Item is already in the list'), 'info');
                    }
                } else {
                    // Clear input immediately for "Optimistic" feel
                    setNewItemText('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                    
                    // NLP Date Parsing
                    let finalTitle = textToAdd;
                    let dueDate: string | undefined = undefined;

                    try {
                        const parseFunc = chronoParse;
                        const parsedResults = parseFunc ? parseFunc(textToAdd) : [];
                        
                        if (parsedResults && parsedResults.length > 0) {
                            const firstResult = parsedResults[0];
                            dueDate = firstResult.start.date().toISOString();
                            
                            // Remove the parsed date part from the text for a cleaner title
                            finalTitle = textToAdd.replace(firstResult.text, '').trim();
                            // Clean up multiple spaces if any
                            finalTitle = finalTitle.replace(/\s+/g, ' ');

                            // fallback if title became empty (e.g. user just typed "tomorrow")
                            if (!finalTitle) finalTitle = textToAdd;
                        }
                    } catch (nlpError) {
                        console.error("NLP Parsing failed, falling back to plain text:", nlpError);
                        // Fallback: use the original text and no due date
                        finalTitle = textToAdd;
                        dueDate = undefined;
                    }

                    const newItem: Item = { 
                        id: uuidv4(), 
                        text: finalTitle, 
                        completed: false,
                        dueDate: dueDate
                    };
                    await updateListItems(list.id, [...list.items, newItem]);
                    await addToHistory(textToAdd);
                }
            } catch (error) {
                console.error("Failed to add item:", error);
            }
        }
    };

    const handleSuggestionClick = (text: string) => {
        handleAddItem(undefined, text);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        if (sortBy !== 'manual') return; // Do not allow manual reorder when auto-sorted
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = list.items.findIndex((item) => item.id === active.id);
        const newIndex = list.items.findIndex((item) => item.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            await updateListItems(list.id, arrayMove(list.items, oldIndex, newIndex));
        }
    };

    const handleToggle = async (itemId: string) => {
        const itemToToggle = list.items.find(i => i.id === itemId);
        if (!itemToToggle) return;
        
        const newCompleted = !itemToToggle.completed;

        // Recursive function to get all descendant IDs
        const getDescendantIds = (parentId: string): string[] => {
            const children = list.items.filter(i => i.parentId === parentId);
            return [...children.map(c => c.id), ...children.flatMap(c => getDescendantIds(c.id))];
        };

        const descendantIds = getDescendantIds(itemId);

        const newItems = list.items.map(item => {
            if (item.id === itemId || descendantIds.includes(item.id)) {
                return { ...item, completed: newCompleted };
            }
            return item;
        });
        await updateListItems(list.id, newItems);
    };

    const handleDelete = async (itemId: string) => {
        await deleteItem(list.id, itemId);
    };

    const handleEdit = async (itemId: string, text: string) => {
        const newItems = list.items.map(item =>
            item.id === itemId ? { ...item, text } : item
        );
        await updateListItems(list.id, newItems);
    };

    const handleUpdate = async (itemId: string, updates: Partial<Item>) => {
        // AppContext.updateListItems strips undefined fields before writing to Firestore,
        // so we simply spread the updates (including priority: undefined for unprioritizing).
        const newItems = list.items.map(item => {
            if (item.id === itemId) {
                const updated = { ...item, ...updates };
                // If priority was set back to undefined, delete the key so it's removed
                if ('priority' in updates && updates.priority === undefined) {
                    delete updated.priority;
                }
                return updated;
            }
            return item;
        });
        await updateListItems(list.id, newItems);
    };

    const handleAddSubtask = async (parentId: string) => {
        const newSubtask: Item = { id: uuidv4(), text: '', completed: false, parentId };
        await updateListItems(list.id, [...list.items, newSubtask]);
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-8rem)] relative pb-40 md:pb-32">
            {showConfetti && <Confetti trigger={true} duration={6000} />}
            {celebrationMessage && <CelebrationOverlay message={celebrationMessage} />}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 group min-w-0 flex-1">
                        <h2 className="text-xl font-semibold truncate">{t('lists.groceryTitle')}</h2>
                        {list.isPending && (
                            <div className="text-blue-500 animate-in fade-in duration-300" title="Syncing list...">
                                <CloudUpload size={20} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sorting Pills */}
            <div className="flex flex-wrap gap-2 mb-6 items-center overflow-x-auto pb-2 scrollbar-hide">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-1 flex items-center gap-1.5"><ArrowUpDown size={14} /> {t('lists.sort.title')}</span>
                {[
                    { id: 'manual', label: t('lists.sort.manual'), icon: null },
                    { id: 'priority', label: t('lists.sort.priority'), icon: <Flag size={14} /> },
                    { id: 'dueDate', label: t('lists.sort.dueDate'), icon: <Clock size={14} /> },
                    { id: 'alphabetical', label: t('lists.sort.alphabetical'), icon: <Type size={14} /> }
                ].map(sortOption => (
                    <button
                        key={sortOption.id}
                        onClick={() => setSortBy(sortOption.id as 'manual' | 'alphabetical' | 'completed' | 'priority' | 'dueDate')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                            ${sortBy === sortOption.id
                                ? 'bg-primary text-black shadow-sm'
                                : 'bg-gray-100 dark:bg-[#3d4551] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#4b5563]'
                            }`}
                    >
                        {sortOption.icon}
                        {sortOption.label}
                    </button>
                ))}
            </div>

            {/* Active Items */}
            {(() => {
                // Only top-level items in the main sorted/draggable list
            const activeItems = sortedItems.filter(i => !i.completed && !i.parentId);
                const completedItems = sortedItems.filter(i => i.completed && !i.parentId);
                
                const itemsWithoutDate = activeItems.filter(i => !i.dueDate);
                const itemsWithDate = activeItems.filter(i => i.dueDate);

                return (
                    <>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={activeItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-6">
                                    {/* Normal Items */}
                                    <div className="space-y-2">
                                        {itemsWithoutDate.map((item) => (
                                            <SortableItem
                                                key={item.id}
                                                item={{ ...item, isPending: item.isPending || list.isPending }}
                                                onToggle={handleToggle}
                                                onDelete={handleDelete}
                                                onEdit={handleEdit}
                                                onUpdate={handleUpdate}
                                                subtasks={list.items
                                                    .filter(i => i.parentId === item.id)
                                                    .map(i => ({ ...i, isPending: i.isPending || list.isPending }))}
                                                onAddSubtask={handleAddSubtask}
                                                disabled={sortBy !== 'manual'}
                                            />
                                        ))}
                                    </div>

                                    {/* Scheduled Section */}
                                    {itemsWithDate.length > 0 && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 px-1 text-primary/60">
                                                <Calendar size={16} strokeWidth={2.5} />
                                                <h3 className="text-xs font-bold uppercase tracking-widest">{t('lists.scheduled', 'Scheduled')}</h3>
                                            </div>
                                            <div className="space-y-2">
                                                {itemsWithDate.map((item) => (
                                                    <SortableItem
                                                        key={item.id}
                                                        item={{ ...item, isPending: item.isPending || list.isPending }}
                                                        onToggle={handleToggle}
                                                        onDelete={handleDelete}
                                                        onEdit={handleEdit}
                                                        onUpdate={handleUpdate}
                                                        subtasks={list.items
                                                            .filter(i => i.parentId === item.id)
                                                            .map(i => ({ ...i, isPending: i.isPending || list.isPending }))}
                                                        onAddSubtask={handleAddSubtask}
                                                        disabled={sortBy !== 'manual'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {activeItems.length === 0 && (
                            <div
                                onClick={() => {
                                    const input = document.getElementById('add-item-input');
                                    if (input) {
                                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        // Slight delay to allow smooth scrolling to finish before focusing 
                                        setTimeout(() => input.focus(), 300);
                                    }
                                }}
                                className="flex flex-col items-center justify-center py-20 opacity-50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-3xl mt-4"
                                role="button"
                                tabIndex={0}
                                aria-label={t('lists.addItemPlaceholder')}
                            >
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                    <Plus className="text-gray-400" size={32} />
                                </div>
                                <p className="text-gray-500 font-medium">{t('lists.emptyList')}</p>
                            </div>
                        )}

                        {/* Completed Items Accordion */}
                        {completedItems.length > 0 && (
                            <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => setCompletedAccordionOpen(!completedAccordionOpen)}
                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors mb-4"
                                >
                                    <ChevronDown size={16} className={`transition-transform ${completedAccordionOpen ? 'rotate-180' : ''}`} />
                                    {t('lists.completedItems', 'Completed Items')} ({completedItems.length})
                                </button>

                                {completedAccordionOpen && (
                                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                                        {completedItems.map(item => (
                                            <div key={item.id} className="opacity-60 hover:opacity-100 transition-opacity">
                                                <SortableItem
                                                    item={{ ...item, isPending: item.isPending || list.isPending }}
                                                    onToggle={handleToggle}
                                                    onDelete={handleDelete}
                                                    onEdit={handleEdit}
                                                    onUpdate={handleUpdate}
                                                    subtasks={list.items
                                                        .filter(i => i.parentId === item.id)
                                                        .map(i => ({ ...i, isPending: i.isPending || list.isPending }))}
                                                    disabled={true} // Disable drag for completed items
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                );
            })()}

            {/* Floating Persistent Bottom Bar ("Add Inbox") */}
            {document.body && createPortal(
                <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-gradient-to-t from-[#f4f5f7] via-[#f4f5f7]/95 to-[#f4f5f7]/0 dark:from-[#2D3540] dark:via-[#2D3540]/95 dark:to-[#2D3540]/0 pt-10 pb-8 px-6 z-[100] transition-all duration-300 pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <div className="relative group">
                            <form onSubmit={handleAddItem} className="flex gap-3 items-center bg-white/80 dark:bg-black/20 backdrop-blur-xl p-2 pl-4 rounded-[32px] border border-white/50 dark:border-white/10 shadow-xl transition-all">
                                <div className="relative flex-1">
                                    <Plus className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none z-10" size={22} />
                                    <InlineAutocompleteInput
                                        id="add-item-input"
                                        value={newItemText}
                                        onChange={setNewItemText}
                                        onSubmit={() => handleAddItem()}
                                        suggestions={suggestions}
                                        placeholder={t('lists.addItemPlaceholder')}
                                        className="w-full pl-8 pr-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none font-medium text-lg"
                                        inputPaddingClass="pl-8"
                                        maxLength={MAX_ITEM_LENGTH}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute bottom-full left-0 right-0 mb-4 bg-white dark:bg-[#1c1c1e] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
                                            {suggestions.map((suggestion) => {
                                                const normalize = (s: string) => s.trim().toLowerCase().normalize("NFC");
                                                const existingItem = list?.items.find(i => normalize(i.text) === normalize(suggestion.text));
                                                const isCompleted = existingItem?.completed;
                                                const isActive = existingItem && !isCompleted;

                                                return (
                                                    <div key={suggestion.id} className="w-full flex items-center group transition-colors">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSuggestionClick(suggestion.text)}
                                                            className="flex-1 text-left px-5 py-3 hover:bg-gray-100/50 dark:hover:bg-white/5 flex items-center justify-between transition-colors"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <RotateCcw size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                                                <span className={`font-medium ${isActive ? 'text-gray-400 dark:text-gray-500 decoration-gray-400' : 'text-gray-700 dark:text-gray-200'}`}>
                                                                    {suggestion.text}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {isCompleted && (
                                                                    <span className="text-[10px] text-primary font-bold bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                                        {t('lists.restore', 'Restore')}
                                                                    </span>
                                                                )}
                                                                {isActive && (
                                                                    <span className="text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                                                                        {t('lists.added', 'Added')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteFromHistory(suggestion.id);
                                                            }}
                                                            className="px-4 py-3 text-gray-400 hover:text-red-500 transition-colors"
                                                            title={t('common.remove', 'Remove')}
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newItemText.trim()}
                                    className="p-3 bg-primary text-[#161618] rounded-xl hover:opacity-90 shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                                >
                                    <Plus size={22} strokeWidth={2.5} />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
});
