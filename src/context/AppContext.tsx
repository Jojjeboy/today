import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { List, ListDB, Item, Todo, ListSettings, Section, Category, HistoryItem, Priority } from '../types';
import { MAX_ITEM_LENGTH } from '../constants';


import { useToast } from './ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { deleteField } from 'firebase/firestore';

interface AppContextType {
    lists: List[]; // Keep lists array for now but we only use one
    defaultListId: string | undefined; // Helper to get the main list
    theme: 'light' | 'dark';
    
    // Core List Operations
    updateListName: (id: string, name: string) => Promise<void>;
    updateListSettings: (id: string, settings: ListSettings) => Promise<void>;
    updateListItems: (listId: string, items: Item[]) => Promise<void>;
    deleteItem: (listId: string, itemId: string) => Promise<void>;
    
    // Theme
    toggleTheme: () => void;
    
    // Todos
    todos: Todo[];
    addTodo: (title: string, content: string, priority: Priority) => Promise<void>;
    updateTodo: (id: string, title: string, content: string, priority: Priority) => Promise<void>;
    toggleTodo: (id: string) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;
    
    
    // Loading
    loading: boolean;
    
    // Access
    updateListAccess: (id: string) => Promise<void>;
    
    // Sections
    addSection: (listId: string, name: string) => Promise<void>;
    updateSection: (listId: string, sectionId: string, name: string) => Promise<void>;
    deleteSection: (listId: string, sectionId: string) => Promise<void>;

    // Categories
    categories: Category[];
    
    // Archiving
    archiveList: (id: string, archived: boolean) => Promise<void>;

    // Lists
    addList: (name: string, categoryId: string) => Promise<void>;
    deleteList: (id: string) => Promise<void>;

    // Categories
    addCategory: (name: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;

    // History
    itemHistory: HistoryItem[];
    addToHistory: (text: string) => Promise<void>;
    deleteFromHistory: (id: string) => Promise<void>;
    clearAllHistory: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * Global application state provider.
 * Manages data synchronization with Firestore, theme settings, 
 * and core business logic for the single grocery list.
 */
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const listsSync = useFirestoreSync<ListDB>('users/{uid}/lists', user?.uid);
    const todosSync = useFirestoreSync<Todo>('users/{uid}/notes', user?.uid);
    const categoriesSync = useFirestoreSync<Category>('users/{uid}/categories', user?.uid);
    const historySync = useFirestoreSync<HistoryItem>('users/{uid}/history', user?.uid);

    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [isCreatingDefault, setIsCreatingDefault] = React.useState(false);

    // Helper: Convert Document from DB into our local UI format (always array)
    const listsWithArrayItems = React.useMemo(() => {
        return listsSync.data.map((list) => {
            if (Array.isArray(list.items)) {
                return list as List & { items: Item[] };
            }
            
            // Convert map to array locally for UI based on itemOrder
            const itemsMap = (list.items as Record<string, Item>) || {};
            const order = list.itemOrder || [];
            
            // Filter out ids that no longer exist in the map
            const sortedItems = order
                .filter(id => itemsMap[id])
                .map(id => itemsMap[id]);
            
            // Catch any items that might be in map but not in order array
            const unorderedIds = Object.keys(itemsMap).filter(id => !order.includes(id));
            const unorderedItems = unorderedIds.map(id => itemsMap[id]);
            
            return {
                ...list,
                items: [...sortedItems, ...unorderedItems]
            } as List;
        });
    }, [listsSync.data]);

    // Ensure we have at least one list
    useEffect(() => {
        if (!listsSync.loading && listsSync.data.length === 0 && user?.uid && !isCreatingDefault) {
            const createDefaultList = async () => {
                setIsCreatingDefault(true);
                try {
                    const id = uuidv4();
                    await listsSync.addItem({
                        id,
                        name: t('lists.groceryList', 'Inköpslista'),
                        categoryId: 'default', // Legacy requirement
                        items: [],
                        lastAccessedAt: new Date().toISOString()
                    });
                } finally {
                    setIsCreatingDefault(false);
                }
            };
            createDefaultList();
        }
    }, [listsSync.loading, listsSync.data.length, user?.uid, listsSync.addItem, t, isCreatingDefault]);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
        if (savedTheme) {
            setTheme(savedTheme);
        } else {
            // Default to dark mode for new users
            setTheme('dark');
            document.documentElement.classList.add('dark');
        }
    }, []);

    const updateListName = async (id: string, name: string) => {
        await listsSync.updateItem(id, { name });
    };

    const updateListSettings = async (id: string, settings: ListSettings) => {
        await listsSync.updateItem(id, { settings });
    };

    const updateListAccess = async (id: string) => {
        const list = listsWithArrayItems.find((l: List) => l.id === id);
        if (list) {
            const lastAccessed = list.lastAccessedAt ? new Date(list.lastAccessedAt).getTime() : 0;
            const now = Date.now();
            // Only update if it's been more than 5 minutes since the last access update
            if (now - lastAccessed > 300000) {
                 await listsSync.updateItem(id, { lastAccessedAt: new Date().toISOString() });
            }
        }
    };

    const updateListItems = async (listId: string, items: Item[]) => {
        // Find existing list to deduce if we need to migrate from array to map
        const existingList = listsSync.data.find((l) => l.id === listId);
        if (!existingList) return;

        const isLegacyArray = Array.isArray(existingList.items);
        
        // If it's still an array, overwrite as an array to avoid breaking legacy before full migration
        // But let's actually migrate it right now!
        const itemsMap: Record<string, Item> = {};
        const itemOrder = items.map(i => i.id);
        if (isLegacyArray) {
            // Fill itemsMap with undefined stripped
            items.forEach(item => {
                const truncatedItem: Item = { ...item, text: item.text.substring(0, MAX_ITEM_LENGTH) };
                (['parentId', 'priority', 'dueDate', 'sectionId', 'state'] as (keyof Item)[]).forEach(key => {
                    if (truncatedItem[key] === undefined) {
                        delete truncatedItem[key];
                    }
                });
                itemsMap[item.id] = truncatedItem;
            });

            // Full overwrite to move to map paradigm. 
            await listsSync.updateItem(listId, { items: itemsMap, itemOrder } as unknown as Partial<ListDB>);
        } else {
            // Granular updates for existing maps to prevent overwrites.
            const dbMap = (existingList.items as Record<string, Item>) || {};
            
            // Find what was deleted
            const currentIds = new Set(itemOrder);
            const deletedIds = Object.keys(dbMap).filter(id => !currentIds.has(id));
            
            const updates: { itemOrder: string[], items: Record<string, Item | ReturnType<typeof deleteField>> } = {
                itemOrder,
                items: {}
            };

            // Add fields to update
            items.forEach(item => {
                 const truncatedItem: Item = { ...item, text: item.text.substring(0, MAX_ITEM_LENGTH) };
                 // Firestore throws an error if we try to save `undefined` directly.
                 // Also, if we omit a field, `merge: true` ignores it and keeps the old value.
                 // We must send `deleteField()` out to actually wipe it.
                 (['parentId', 'priority', 'dueDate', 'sectionId', 'state'] as (keyof Item)[]).forEach(key => {
                     if (truncatedItem[key] === undefined) {
                         if (dbMap[item.id] && dbMap[item.id][key] !== undefined) {
                             // The existing document in DB has this field, so we must delete it explicitly
                             (truncatedItem as any)[key] = deleteField();
                         } else {
                             // It's already missing or we just created this item; safer to just delete the key
                             delete truncatedItem[key];
                         }
                     }
                 });
                 updates.items[item.id] = truncatedItem;
            });

            // Add fields to delete natively
            deletedIds.forEach(id => {
                 updates.items[id] = deleteField();
            });

            // We explicitly bypass typing here for the field-path updates
            await listsSync.updateItem(listId, updates as unknown as Partial<ListDB>);
        }
    };

    const deleteItem = async (listId: string, itemId: string) => {
        const list = listsWithArrayItems.find((l: List) => l.id === listId);
        if (list) {
            const itemToDelete = list.items.find((i: Item) => i.id === itemId);
            if (itemToDelete) {
                // Also collect any subtasks that belong to this parent
                const subtasksToDelete = list.items.filter((i: Item) => i.parentId === itemId);
                const idsToRemove = new Set([itemId, ...subtasksToDelete.map(i => i.id)]);
                const deletedItems = [itemToDelete, ...subtasksToDelete];

                const newItems = list.items.filter((i: Item) => !idsToRemove.has(i.id));
                await updateListItems(listId, newItems);

                showToast(t('toasts.itemDeleted'), 'info', {
                    label: t('common.undo'),
                    onClick: async () => {
                        const currentList = listsWithArrayItems.find((l: List) => l.id === listId);
                        if (currentList) {
                            await updateListItems(listId, [...currentList.items, ...deletedItems]);
                        }
                    }
                });
            }
        }
    };

    const toggleTheme = () => {
        setTheme((prev) => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
        localStorage.setItem('manual_theme', 'true');
    };

    const addTodo = async (title: string, content: string, priority: Priority) => {
        const newTodo: Todo = {
            id: uuidv4(),
            title,
            content,
            createdAt: new Date().toISOString(),
            priority,
            completed: false, 
        };
        await todosSync.addItem(newTodo);
    };

    const updateTodo = async (id: string, title: string, content: string, priority: Priority) => {
        await todosSync.updateItem(id, { title, content, priority });
    };

    const toggleTodo = async (id: string) => {
        const todo = todosSync.data.find((t: Todo) => t.id === id);
        if (todo) {
            await todosSync.updateItem(id, { completed: !todo.completed });
        }
    };

    const deleteTodo = async (id: string) => {
        await todosSync.deleteItem(id);
    };

    const addSection = async (listId: string, name: string) => {
        const list = listsWithArrayItems.find((l: List) => l.id === listId);
        if (list) {
            const sections = list.sections || [];
            const newSection: Section = {
                id: uuidv4(),
                name,
                order: 0
            };

            const updatedSections = [newSection, ...sections].map((section, index) => ({
                ...section,
                order: index
            }));

            await listsSync.updateItem(listId, { sections: updatedSections });
        }
    };

    const updateSection = async (listId: string, sectionId: string, name: string) => {
        const list = listsWithArrayItems.find((l: List) => l.id === listId);
        if (list && list.sections) {
            const updatedSections = list.sections.map(section =>
                section.id === sectionId ? { ...section, name } : section
            );
            await listsSync.updateItem(listId, { sections: updatedSections });
        }
    };

    const deleteSection = async (listId: string, sectionId: string) => {
        const list = listsWithArrayItems.find((l: List) => l.id === listId);
        if (list) {
            const updatedSections = (list.sections || []).filter(s => s.id !== sectionId);
            const updatedItems = list.items.map(item => {
                if (item.sectionId === sectionId) {
                    const newItem = { ...item };
                    delete newItem.sectionId;
                    return newItem;
                }
                return item;
            });

            await updateListItems(listId, updatedItems);
            // After triggering items update (which handles map vs array automatically), manually update sections
            await listsSync.updateItem(listId, {
                sections: updatedSections
            });
        }
    };

    const archiveList = async (id: string, archived: boolean = true) => {
        await listsSync.updateItem(id, { archived });
    };

    const addList = async (name: string, categoryId: string) => {
        await listsSync.addItem({
            id: uuidv4(),
            name,
            categoryId,
            items: {} as Record<string, Item>, // Init as map right away!
            itemOrder: [],
            lastAccessedAt: new Date().toISOString()
        });
    };

    const deleteList = async (id: string) => {
        await listsSync.deleteItem(id);
    };

    const addCategory = async (name: string) => {
        await categoriesSync.addItem({
            id: uuidv4(),
            name,
            order: categoriesSync.data.length
        });
    };

    const deleteCategory = async (id: string) => {
        await categoriesSync.deleteItem(id);
    };

    const addToHistory = async (text: string) => {
        const normalizedText = text.trim();
        if (!normalizedText) return;

        const existingItem = historySync.data.find(
            item => item.text.toLowerCase() === normalizedText.toLowerCase()
        );

        if (existingItem) {
            await historySync.updateItem(existingItem.id, {
                lastUsed: new Date().toISOString(),
                usageCount: (existingItem.usageCount || 1) + 1
            });
        } else {
            await historySync.addItem({
                id: uuidv4(),
                text: normalizedText,
                lastUsed: new Date().toISOString(),
                usageCount: 1
            });
        }
    };

    const deleteFromHistory = async (id: string) => {
        await historySync.deleteItem(id);
    };

    const clearAllHistory = async () => {
        const deletePromises = historySync.data.map(item => 
            historySync.deleteItem(item.id)
        );
        await Promise.all(deletePromises);
    };

    const defaultListId = listsWithArrayItems.length > 0 ? listsWithArrayItems[0].id : undefined;

    return (
        <AppContext.Provider
            value={{
                lists: listsWithArrayItems as List[],
                defaultListId,
                theme,
                updateListName,
                updateListSettings,
                updateListItems,
                deleteItem,
                toggleTheme,
                todos: todosSync.data,
                addTodo,
                updateTodo,
                toggleTodo,
                deleteTodo,
                loading: listsSync.loading || todosSync.loading || isCreatingDefault,
                updateListAccess,
                addSection,
                updateSection,
                deleteSection,
                categories: categoriesSync.data,
                archiveList,
                addList,
                deleteList,
                addCategory,
                deleteCategory,
                itemHistory: historySync.data,
                addToHistory,
                deleteFromHistory,
                clearAllHistory,
            }}
        >
            <ErrorBoundary>
                {children}
            </ErrorBoundary>
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
