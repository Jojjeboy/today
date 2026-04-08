import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useBlocker, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Item, ListSettings, List } from '../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, useDroppable } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { Plus, ChevronLeft, Settings, RotateCcw, ChevronDown, Trash2, Edit2, Pin, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from './Modal';
import { InlineAutocompleteInput } from './InlineAutocompleteInput';
import { MAX_ITEM_LENGTH } from '../constants';
import { Confetti } from './Confetti';
import { CelebrationOverlay } from './CelebrationOverlay';
import { useCelebration } from '../hooks/useCelebration';
import { useToast } from '../context/ToastContext';

import { useTranslation } from 'react-i18next';

/**
 * Detailed view for a single list.
 * Supports adding items, toggling states (normal/three-stage), 
 * sorting, and reordering items via drag and drop.
 */
const DroppableSection = ({ sectionId, children }: { sectionId: string, children: React.ReactNode }) => {
    const { setNodeRef } = useDroppable({ id: sectionId });
    return <div ref={setNodeRef}>{children}</div>;
};

export const ListDetail: React.FC = React.memo(function ListDetail() {
    const { t } = useTranslation();
    const { listId } = useParams<{ listId: string }>();
    const { lists, updateListItems, deleteItem, updateListName, updateListSettings, updateListAccess, archiveList, addSection, updateSection, deleteSection, itemHistory, addToHistory, deleteFromHistory } = useApp();
    const [newItemText, setNewItemText] = useState('');
    const [uncheckModalOpen, setUncheckModalOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [calendarAccordionOpen, setCalendarAccordionOpen] = useState(false);
    const [calendarEventTitle, setCalendarEventTitle] = useState('');
    const [newSectionName, setNewSectionName] = useState('');
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [editedSectionName, setEditedSectionName] = useState('');
    const [deletingSectionId, setDeleteSectionId] = useState<string | null>(null);
    const [unpinConfirmOpen, setUnpinConfirmOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<(typeof itemHistory)>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [completedAccordionOpen, setCompletedAccordionOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');
    const wasAllCompleted = React.useRef<boolean>(false);
    const isFirstLoad = React.useRef<boolean>(true);
    const { getCelebrationMessage } = useCelebration();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const list: List | undefined = lists.find((l) => l.id === listId);

    // Block navigation if the list is pinned
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !!list?.settings?.pinned &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            setUnpinConfirmOpen(true);
        }
    }, [blocker.state]);


    React.useEffect(() => {
        if (list) {
            document.title = `today - ${list.name}`;
            setEditedTitle(list.name);
            updateListAccess(list.id);
        }
    }, [list?.id, list?.name]);

    useEffect(() => {
        if (listId) {
            updateListAccess(listId);
        }
    }, [listId]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [sortBy, setSortBy] = useState<'manual' | 'alphabetical' | 'completed' | 'priority' | 'dueDate'>('manual');
    const threeStageMode = list?.settings?.threeStageMode ?? false;

    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm) in LOCAL time
    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    // Helper function to get next full hour
    const getNextFullHour = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return toLocalISOString(now);
    };

    // Calendar time state with defaults
    const [calendarStartTime, setCalendarStartTime] = useState(() =>
        list?.settings?.calendarStartTime || getNextFullHour()
    );
    const [calendarEndTime, setCalendarEndTime] = useState(() => {
        if (list?.settings?.calendarEndTime) return list.settings.calendarEndTime;

        // Default to start time + 1 hour
        const startStr = list?.settings?.calendarStartTime || getNextFullHour();
        const endDate = new Date(startStr);
        endDate.setHours(endDate.getHours() + 1);
        return toLocalISOString(endDate);
    });

    // EFFECT: Refresh start time to next full hour if it's in the past when accordion opens
    useEffect(() => {
        if (calendarAccordionOpen) {
            const now = new Date();
            const currentStart = new Date(calendarStartTime);
            if (currentStart < now) {
                const nextHourStr = getNextFullHour();
                setCalendarStartTime(nextHourStr);

                // Also adjust end time to be 1 hour after the NEW start time
                const nextHourDate = new Date(nextHourStr);
                const endDate = new Date(nextHourDate);
                endDate.setHours(endDate.getHours() + 1);
                setCalendarEndTime(toLocalISOString(endDate));
            }
        }
    }, [calendarAccordionOpen]);

    // EFFECT: Ensure end time is not before start time when start time changes
    useEffect(() => {
        const start = new Date(calendarStartTime);
        const end = new Date(calendarEndTime);
        if (end <= start) {
            const newEnd = new Date(start);
            newEnd.setHours(newEnd.getHours() + 1);
            setCalendarEndTime(toLocalISOString(newEnd));
        }
    }, [calendarStartTime]);

    // Load sort setting from list or default to manual
    useEffect(() => {
        if (list?.settings?.defaultSort) {
            setSortBy(list.settings.defaultSort);
        }
    }, [list?.settings?.defaultSort]);

    // Memoized sort of items based on current settings
    const sortedItems = React.useMemo(() => {
        if (!list) return [];
        const items = [...list.items];
        if (sortBy === 'alphabetical') {
            items.sort((a, b) => a.text.localeCompare(b.text));
        } else if (sortBy === 'completed') {
            items.sort((a, b) => {
                // Sort order: Prepared -> Unchecked -> Completed
                // Assign weights: Prepared = 0, Unchecked = 1, Completed = 2
                const getWeight = (item: Item) => {
                    if (item.completed) return 2;
                    if (threeStageMode && item.state === 'ongoing') return 0;
                    return 1;
                };
                const weightA = getWeight(a);
                const weightB = getWeight(b);
                if (weightA !== weightB) return weightA - weightB;
                // Secondary sort: Alphabetical
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
    }, [list, sortBy, threeStageMode]);

    // Update calendar event title when list name changes
    React.useEffect(() => {
        if (list) {
            setCalendarEventTitle(list.name);
        }
    }, [list?.name]);

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
            h.text.toLowerCase().includes(searchText) &&
            !list?.items.some(i => i.text.toLowerCase() === h.text.toLowerCase() && !i.completed) // Don't suggest if already active
        );

        // Sort by usage count
        historyMatches.sort((a, b) => b.usageCount - a.usageCount);

        setSuggestions(historyMatches.slice(0, 5));
        setShowSuggestions(true);
    }, [newItemText, itemHistory, list?.items]);
    
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
                setUncheckModalOpen(true);
            }, 5000);
        }
        
        wasAllCompleted.current = isAllCompletedNow;
        isFirstLoad.current = false;
    }, [list?.items, getCelebrationMessage, showToast]);

    if (!list) return <div className="text-center py-10">{t('lists.notFound')}</div>;

    /**
     * Adds a new item to the current list.
     */
    const handleAddItem = async (e?: React.FormEvent, textOverride?: string) => {
        if (e) e.preventDefault();
        const textToAdd = textOverride || newItemText.trim();
        
        if (textToAdd) {
            // Check if item exists (completed) -> Restore it
            const existingItem = list.items.find(i => i.text.toLowerCase() === textToAdd.toLowerCase());
            
            if (existingItem) {
                if (existingItem.completed) {
                    await handleToggle(existingItem.id);
                }
                // If it's already active, maybe just clear input or highlight? 
                // Currently just adds duplicates if normalized text is different, strictly checking normalized here.
            } else {
                const newItem = { id: uuidv4(), text: textToAdd, completed: false };
                await updateListItems(list.id, [...list.items, newItem]);
                await addToHistory(textToAdd);
            }
            setNewItemText('');
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (text: string) => {
        handleAddItem(undefined, text);
    };

    /**
     * Handles item reordering via drag and drop.
     * Supports moving items within a section and between sections.
     */
    const handleDragEnd = async (event: DragEndEvent) => {
        if (sortBy !== 'manual') return; // Do not allow manual reorder when auto-sorted
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        // Check if dropped ON a section container directly (empty section or section header)
        const overSectionId = list.sections?.find(s => s.id === over.id)?.id;

        const activeItem = list.items.find((item) => item.id === active.id);
        if (!activeItem) return;

        // If dropped on a section directly
        if (overSectionId) {
            const currentSectionId = activeItem.sectionId;
            if (currentSectionId !== overSectionId) {
                // Move to new section (append to end)
                const updatedItems = list.items.map(item =>
                    item.id === active.id ? { ...item, sectionId: overSectionId } : item
                );
                await updateListItems(list.id, updatedItems);
            }
            return;
        }

        // Dropped on another item
        const overItem = list.items.find((item) => item.id === over.id);

        // Check if we're moving to a different section via item drop
        const activeItemSectionId = activeItem.sectionId;
        const overItemSectionId = overItem?.sectionId;

        // If moving between sections (dropped on item in different section)
        if (overItemSectionId !== undefined && activeItemSectionId !== overItemSectionId) {
            const updatedItems = list.items.map(item =>
                item.id === active.id ? { ...item, sectionId: overItemSectionId } : item
            );
            await updateListItems(list.id, updatedItems);
        } else if (overItem) {
            // Reordering within the same section
            const oldIndex = list.items.findIndex((item) => item.id === active.id);
            const newIndex = list.items.findIndex((item) => item.id === over.id);
            await updateListItems(list.id, arrayMove(list.items, oldIndex, newIndex));
        }
    };

    /**
     * Cycles an item through its possible states.
     * In normal mode: unresolved <-> completed
     * In three-stage mode: unresolved -> prepared -> completed -> unresolved
     */
    const handleToggle = async (itemId: string) => {
        const itemToToggle = list.items.find(i => i.id === itemId);
        if (!itemToToggle) return;

        // Determine new state for the toggled item
        let newState: 'unresolved' | 'ongoing' | 'completed';
        let newCompleted: boolean;

        if (threeStageMode) {
            if (itemToToggle.completed) {
                newState = 'unresolved';
                newCompleted = false;
            } else if (itemToToggle.state === 'ongoing') {
                newState = 'completed';
                newCompleted = true;
            } else {
                newState = 'ongoing';
                newCompleted = false;
            }
        } else {
            newCompleted = !itemToToggle.completed;
            newState = newCompleted ? 'completed' : 'unresolved';
        }

        // Recursive function to get all descendant IDs
        const getDescendantIds = (parentId: string): string[] => {
            const children = list.items.filter(i => i.parentId === parentId);
            return [...children.map(c => c.id), ...children.flatMap(c => getDescendantIds(c.id))];
        };

        const descendantIds = getDescendantIds(itemId);

        const newItems = list.items.map(item => {
            if (item.id === itemId || descendantIds.includes(item.id)) {
                return { ...item, completed: newCompleted, state: newState };
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

    const confirmUncheckAll = async () => {
        const newItems = list.items.map(item => ({ ...item, completed: false, state: 'unresolved' as const }));
        await updateListItems(list.id, newItems);
        setUncheckModalOpen(false);
    };

    const handleSaveTitle = async () => {
        if (editedTitle.trim()) {
            await updateListName(list.id, editedTitle.trim());
            setIsEditingTitle(false);
        }
    };

    const updateSettings = async (newSettings: Partial<typeof list.settings>) => {
        if (!list) return;
        const currentSettings = list.settings || { threeStageMode: false, defaultSort: 'manual' };
        const updated: ListSettings = { ...currentSettings, ...newSettings } as ListSettings;
        await updateListSettings(list.id, updated);
    };

    // Section management handlers
    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newSectionName.trim() && list) {
            await addSection(list.id, newSectionName.trim());
            setNewSectionName('');
        }
    };

    const handleUpdateSection = async (sectionId: string) => {
        if (editedSectionName.trim() && list) {
            await updateSection(list.id, sectionId, editedSectionName.trim());
            setEditingSectionId(null);
            setEditedSectionName('');
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (list) {
            await deleteSection(list.id, sectionId);
            setDeleteSectionId(null);
        }
    };

    // Helper function to group items by section
    const groupItemsBySection = (items: Item[]): Map<string | undefined, Item[]> => {
        const grouped = new Map<string | undefined, Item[]>();

        // Add unsectioned items
        grouped.set(undefined, items.filter(item => !item.sectionId));

        // Add items for each section
        const sections = list?.sections || [];
        sections.forEach(section => {
            grouped.set(section.id, items.filter(item => item.sectionId === section.id));
        });

        return grouped;
    };

    /**
     * Ensures start time is in the future and returns valid times
     */
    const validateAndGetTimes = () => {
        if (!list) return;

        // Ensure start time is in the future
        const now = new Date();
        const start = new Date(calendarStartTime);
        if (start < now) {
            // If in the past, adjust to next full hour before proceeding
            const nextHourStr = getNextFullHour();
            setCalendarStartTime(nextHourStr);

            const nextHourDate = new Date(nextHourStr);
            const endDate = new Date(nextHourDate);
            endDate.setHours(endDate.getHours() + 1);
            const actualEnd = toLocalISOString(endDate);
            setCalendarEndTime(actualEnd);

            return { actualStart: nextHourStr, actualEnd: actualEnd };
        }
        return { actualStart: calendarStartTime, actualEnd: calendarEndTime };
    };

    /**
     * Generates a Google Calendar event URL with list details
     */
    const generateGoogleCalendarLink = () => {
        if (!list) return;

        const times = validateAndGetTimes();
        if (!times) return;
        const { actualStart, actualEnd } = times;

        // Save the selected times to list settings
        updateSettings({ calendarStartTime: actualStart, calendarEndTime: actualEnd });

        // Format event title (use edited title or list name)
        const title = encodeURIComponent(calendarEventTitle || list.name);

        // Format event description: bullet points for items + HTML link
        const itemsText = list.items.map(item => `• ${item.text}`).join('\n');
        const linkText = t('lists.settings.calendar.linkText');
        const deepLink = `https://jojjeboy.github.io/today/#/list/${list.id}`;
        const htmlLink = `<a href="${deepLink}">${linkText}</a>`;
        const description = encodeURIComponent(`${itemsText}\n\n${htmlLink}`);

        // Format times for Google Calendar (YYYYMMDDTHHMMSS format in UTC)
        const formatGoogleTime = (isoString: string) => {
            const date = new Date(isoString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startTime = formatGoogleTime(actualStart);
        const endTime = formatGoogleTime(actualEnd);

        // Construct Google Calendar URL
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startTime}/${endTime}`;

        // Open in new tab
        window.open(calendarUrl, '_blank');
    };

    // --- Validation Logic for UI ---
    const now = new Date();
    // We ignore seconds for the comparison to prevent minor mismatches (e.g. current seconds vs 00 seconds)
    const currentNowTime = now.getTime();
    const startDate = new Date(calendarStartTime);
    const endDate = new Date(calendarEndTime);

    // Is the start time in the past? (Allowing a buffer of 1 minute roughly)
    const isPast = startDate.getTime() < (currentNowTime - 60000);

    // Is the range invalid? (Start time is after or same as end time)
    const isRangeInvalid = startDate >= endDate;

    // Should the button be disabled?
    const isCalendarButtonDisabled = isPast || isRangeInvalid;

    return (
        <div className="space-y-6">
            {showConfetti && <Confetti trigger={true} />}
            {celebrationMessage && <CelebrationOverlay message={celebrationMessage} />}
            {/* ... (header code) ... */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            if (list?.settings?.pinned) {
                                setUnpinConfirmOpen(true);
                            } else {
                                navigate('/');
                            }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                        title={t('common.back', 'Back')}
                    >
                        <ChevronLeft />
                    </button>
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 flex-1 mr-4 min-w-0">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none w-full min-w-0"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') {
                                        setEditedTitle(list.name);
                                        setIsEditingTitle(false);
                                    }
                                }}
                                onBlur={handleSaveTitle}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group min-w-0 flex-1">
                            {(() => {
                                const truncatedName = list.name.length > 30 ? list.name.substring(0, 30) + "... " : list.name;
                                return <h2 className="text-xl font-semibold truncate" title={list.name}>{truncatedName}</h2>;
                            })()}
                            <button
                                onClick={() => setIsEditingTitle(true)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all flex-shrink-0"
                                title={t('lists.editTitle')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {list?.archived && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-full text-orange-600 dark:text-orange-400">
                        <Settings size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{t('lists.archivedBadge')}</p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">{t('lists.archivedWarning')}</p>
                    </div>
                </div>
            )}


            {list?.archived && (
                <div className="flex justify-end">
                    <button
                        onClick={() => setSettingsOpen(true)}
                        className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 flex items-center gap-2 text-sm font-medium"
                    >
                        <Settings size={20} />
                        {t('lists.settings.title')}
                    </button>
                </div>
            )}

            {
                sortBy === 'manual' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-6">
                                {(() => {
                                    const groupedItems = groupItemsBySection(sortedItems);
                                    const sections = list?.sections || [];
                                    const hasAnySections = sections.length > 0;
                                    
                                    // Helper to split active/completed
                                    const filterActive = (items: Item[]) => items.filter(i => !i.completed);
                                    const completedItems = sortedItems.filter(i => i.completed);

                                    return (
                                        <>
                                            {/* Unsectioned items (Active only) */}
                                            {groupedItems.get(undefined) && filterActive(groupedItems.get(undefined)!).length > 0 && (
                                                <div>
                                                    {hasAnySections && (
                                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                            {t('lists.sections.unsectioned')}
                                                        </h3>
                                                    )}
                                                    <div className="space-y-2">
                                                        {filterActive(groupedItems.get(undefined)!).map((item) => (
                                                            <SortableItem
                                                                key={item.id}
                                                                item={item}
                                                                onToggle={list?.archived ? undefined : handleToggle}
                                                                onDelete={list?.archived ? undefined : handleDelete}
                                                                onEdit={list?.archived ? undefined : handleEdit}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Sectioned items (Active only) */}
                                            {sections.map((section) => {
                                                const sectionItems = filterActive(groupedItems.get(section.id) || []);
                                                return (
                                                    <DroppableSection sectionId={section.id} key={section.id}>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                                                {section.name}
                                                            </h3>
                                                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                        </div>
                                                        <div className="space-y-2 min-h-[2rem]"> {/* Add min-height for empty target */}
                                                            {sectionItems.map((item) => (
                                                                <SortableItem
                                                                    key={item.id}
                                                                    item={item}
                                                                    onToggle={list?.archived ? undefined : handleToggle}
                                                                    onDelete={list?.archived ? undefined : handleDelete}
                                                                    onEdit={list?.archived ? undefined : handleEdit}
                                                                />
                                                            ))}
                                                            {sectionItems.length === 0 && (
                                                                <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-4 italic">
                                                                    {t('lists.emptySection', 'Empty section')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </DroppableSection>
                                                );
                                            })}

                                            {sortedItems.filter(i => !i.completed).length === 0 && sections.length === 0 && (
                                                <p className="text-center text-gray-500 mt-8">{t('lists.emptyList')}</p>
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
                                                                        item={item}
                                                                        onToggle={list?.archived ? undefined : handleToggle}
                                                                        onDelete={list?.archived ? undefined : handleDelete}
                                                                        // Edit disabled for completed items typically, but user might want it. Keeping active.
                                                                        onEdit={list?.archived ? undefined : handleEdit}
                                                                        disabled={true} // Disable drag for completed items in accordion
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
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="space-y-6">
                        {(() => {
                            const groupedItems = groupItemsBySection(sortedItems);
                            const sections = list?.sections || [];
                            const hasAnySections = sections.length > 0;

                            return (
                                <>
                                    {/* Unsectioned items */}
                                    {groupedItems.get(undefined) && groupedItems.get(undefined)!.length > 0 && (
                                        <div>
                                            {hasAnySections && (
                                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                                                    {t('lists.sections.unsectioned')}
                                                </h3>
                                            )}
                                            <div className="space-y-2">
                                                {groupedItems.get(undefined)!.map((item) => (
                                                    <SortableItem
                                                        key={item.id}
                                                        item={item}
                                                        onToggle={list?.archived ? undefined : handleToggle}
                                                        onDelete={list?.archived ? undefined : handleDelete}
                                                        onEdit={list?.archived ? undefined : handleEdit}
                                                        disabled={true}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sectioned items */}
                                    {sections.map((section) => {
                                        const sectionItems = groupedItems.get(section.id) || [];
                                        return (
                                            <div key={section.id}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
                                                        {section.name}
                                                    </h3>
                                                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                                </div>
                                                <div className="space-y-2">
                                                    {sectionItems.map((item) => (
                                                        <SortableItem
                                                            key={item.id}
                                                            item={item}
                                                            onToggle={list?.archived ? undefined : handleToggle}
                                                            onDelete={list?.archived ? undefined : handleDelete}
                                                            onEdit={list?.archived ? undefined : handleEdit}
                                                            disabled={true}
                                                        />
                                                    ))}
                                                    {sectionItems.length === 0 && (
                                                        <p className="text-center text-gray-400 dark:text-gray-600 text-sm py-4 italic">
                                                            {t('lists.emptyList')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {sortedItems.length === 0 && (
                                        <p className="text-center text-gray-500 mt-8">{t('lists.emptyList')}</p>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )
            }

            <Modal
                isOpen={uncheckModalOpen}
                onClose={() => setUncheckModalOpen(false)}
                onConfirm={confirmUncheckAll}
                title={t('lists.resetTitle')}
                message={t('lists.resetMessage')}
                confirmText={t('lists.reset')}
            />
            <Modal
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                title={t('lists.settings.title')}
                message="" // Custom content
                confirmText={t('common.done')} // Or just close
                onConfirm={() => setSettingsOpen(false)}
            >
                <div className="space-y-6 pt-2">
                    {/* Three Stage Mode Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.threeStage.title')}</span>
                            <span className="text-sm text-gray-500">{t('lists.settings.threeStage.description')}</span>
                        </div>
                        <button
                            onClick={() => updateSettings({ threeStageMode: !threeStageMode })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${threeStageMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${threeStageMode ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {/* Pinned List Toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <Pin size={16} className={list?.settings?.pinned ? "text-blue-500" : "text-gray-400"} />
                                <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.pinned.title', 'Fäst lista')}</span>
                            </div>
                            <span className="text-sm text-gray-500">{t('lists.settings.pinned.description', 'Öppna denna lista automatiskt när appen startar')}</span>
                        </div>
                        <button
                            onClick={() => updateSettings({ pinned: !list?.settings?.pinned })}
                            className={`w-12 h-6 rounded-full transition-colors relative ${list?.settings?.pinned ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${list?.settings?.pinned ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {/* Sorting Options */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('lists.settings.sort')}
                        </label>
                        <div className="space-y-2">
                            {(['manual', 'alphabetical', 'completed'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => {
                                        setSortBy(mode);
                                        updateSettings({ defaultSort: mode });
                                    }}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border ${sortBy === mode
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="capitalize">{t(`lists.sort.${mode}`)}</span>
                                    {sortBy === mode && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Section Management */}
                    {!list?.archived && (
                        <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('lists.sections.title')}
                            </label>

                            {/* Add Section Form */}
                            <form onSubmit={handleAddSection} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSectionName}
                                    onChange={(e) => setNewSectionName(e.target.value)}
                                    placeholder={t('lists.sections.addPlaceholder')}
                                    className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                >
                                    {t('lists.sections.add')}
                                </button>
                            </form>

                            {/* Sections List */}
                            <div className="space-y-2">
                                {list?.sections && list.sections.length > 0 ? (
                                    list.sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                                        >
                                            {editingSectionId === section.id ? (
                                                <>
                                                    <input
                                                        type="text"
                                                        value={editedSectionName}
                                                        onChange={(e) => setEditedSectionName(e.target.value)}
                                                        className="flex-1 p-1 rounded border border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleUpdateSection(section.id);
                                                            if (e.key === 'Escape') {
                                                                setEditingSectionId(null);
                                                                setEditedSectionName('');
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateSection(section.id)}
                                                        className="p-1 text-green-600 hover:text-green-700"
                                                        title="Save"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingSectionId(null);
                                                            setEditedSectionName('');
                                                        }}
                                                        className="p-1 text-gray-600 hover:text-gray-700"
                                                        title="Cancel"
                                                    >
                                                        ✕
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">
                                                        {section.name}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            setEditingSectionId(section.id);
                                                            setEditedSectionName(section.name);
                                                        }}
                                                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteSectionId(section.id)}
                                                        className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                        {t('lists.sections.empty')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Archive Toggle */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col">
                            <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.archive.title')}</span>
                            <span className="text-sm text-gray-500">{t('lists.settings.archive.description')}</span>
                        </div>
                        <button
                            onClick={() => archiveList(list!.id, !list?.archived)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${list?.archived ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${list?.archived ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>

                    {/* Calendar Accordion - Hidden if archived */}
                    {!list?.archived && (
                        <div className="space-y-2">
                            <button
                                onClick={() => setCalendarAccordionOpen(!calendarAccordionOpen)}
                                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="flex flex-col items-start">
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{t('lists.settings.calendar.title')}</span>
                                    <span className="text-sm text-gray-500">{t('lists.settings.calendar.description')}</span>
                                </div>
                                <ChevronDown
                                    size={20}
                                    className={`transition-transform ${calendarAccordionOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {calendarAccordionOpen && (
                                <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('lists.settings.calendar.eventTitle')}
                                        </label>
                                        <input
                                            type="text"
                                            value={calendarEventTitle}
                                            onChange={(e) => setCalendarEventTitle(e.target.value)}
                                            placeholder={list.name}
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {t('lists.settings.calendar.startTime')}
                                            </label>
                                            {isPast && (
                                                <span className="text-xs text-red-500 font-medium self-center">
                                                    {/* You might want to translate this string */}
                                                    Time has passed
                                                </span>
                                            )}
                                        </div>
                                        <input
                                            type="datetime-local"
                                            value={calendarStartTime}
                                            onChange={(e) => setCalendarStartTime(e.target.value)}
                                            min={toLocalISOString(new Date())}
                                            className={`w-full p-2 rounded-lg border ${isPast ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 dark:border-gray-600 focus:ring-blue-500'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 outline-none`}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {t('lists.settings.calendar.endTime')}
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={calendarEndTime}
                                            onChange={(e) => setCalendarEndTime(e.target.value)}
                                            min={calendarStartTime}
                                            className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={generateGoogleCalendarLink}
                                        disabled={isCalendarButtonDisabled}
                                        className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-medium transition-colors ${isCalendarButtonDisabled
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {t('lists.settings.calendar.generateLink')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reset List Action */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => {
                                setSettingsOpen(false);
                                setUncheckModalOpen(true);
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <RotateCcw size={18} />
                            {t('lists.reset')}
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={deletingSectionId !== null}
                onClose={() => setDeleteSectionId(null)}
                onConfirm={() => deletingSectionId && handleDeleteSection(deletingSectionId)}
                title={t('lists.sections.deleteTitle')}
                message={t('lists.sections.deleteMessage')}
                confirmText={t('lists.sections.deleteConfirm')}
            />
            <Modal
                isOpen={unpinConfirmOpen}
                onClose={() => setUnpinConfirmOpen(false)}
                title={t('lists.unpinConfirm.title', 'Lämna fäst lista?')}
                message={t('lists.unpinConfirm.message', 'Denna lista är fäst och öppnas automatiskt när appen startar. Vill du sluta fästa den nu?')}
                confirmText={t('lists.unpinConfirm.unpinAndLeave', 'Sluta fäst och lämna')}
                cancelText={t('common.cancel', 'Avbryt')}
                onConfirm={async () => {
                    if (list) {
                        await updateSettings({ pinned: false });
                        navigate('/');
                    }
                }}
            >
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                    <button
                        onClick={() => {
                            setUnpinConfirmOpen(false);
                            navigate('/');
                        }}
                        className="w-full p-3 text-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium border border-gray-200 dark:border-gray-600"
                    >
                        {t('lists.unpinConfirm.keepPinned', 'Behåll fäst och lämna')}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">
                        {t('lists.unpinConfirm.explanation', 'Du kan alltid ändra detta i listinställningarna senare.')}
                    </p>
                </div>
            </Modal>

            {!list?.archived && document.body && createPortal(
                <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-gradient-to-t from-[#f4f5f7] via-[#f4f5f7]/95 to-[#f4f5f7]/0 dark:from-[#2D3540] dark:via-[#2D3540]/95 dark:to-[#2D3540]/0 pt-10 pb-8 px-6 z-[100] transition-all duration-300 pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <div className="relative group">
                            <form onSubmit={(e) => { e.preventDefault(); handleAddItem(e); }} className="flex gap-3 items-center bg-white/80 dark:bg-black/20 backdrop-blur-xl p-2 pl-4 rounded-[32px] border border-white/50 dark:border-white/10 shadow-xl transition-all">
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
                                                            className="flex-1 text-left px-5 py-3 hover:bg-white/5 flex items-center justify-between transition-colors"
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

ListDetail.displayName = 'ListDetail';