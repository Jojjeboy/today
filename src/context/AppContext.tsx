import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { List, Item, Todo, ListSettings, Section, Category, HistoryItem } from '../types';

type Priority = 'low' | 'medium' | 'high';
import { useToast } from './ToastContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { useFirestoreSync } from '../hooks/useFirestoreSync';
import { ErrorBoundary } from '../components/ErrorBoundary';

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

    const listsSync = useFirestoreSync<List>('users/{uid}/lists', user?.uid);
    const todosSync = useFirestoreSync<Todo>('users/{uid}/notes', user?.uid);
    const categoriesSync = useFirestoreSync<Category>('users/{uid}/categories', user?.uid);
    const historySync = useFirestoreSync<HistoryItem>('users/{uid}/history', user?.uid);

    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [isCreatingDefault, setIsCreatingDefault] = React.useState(false);

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
        }

        const manualTheme = localStorage.getItem('manual_theme');
        if (!manualTheme) {
            try {
                // Use Europe/Stockholm time
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: 'Europe/Stockholm',
                    hour: 'numeric',
                    hour12: false
                });

                const hour = parseInt(formatter.format(new Date()), 10);

                // Light mode between 08:00 and 18:00
                const isDay = hour >= 8 && hour < 18;
                setTheme(isDay ? 'light' : 'dark');
            } catch (error) {
                console.error("Error setting time-based theme:", error);
                const hour = new Date().getHours();
                const isDay = hour >= 8 && hour < 18;
                setTheme(isDay ? 'light' : 'dark');
            }
        }
    }, []);

    const updateListName = async (id: string, name: string) => {
        await listsSync.updateItem(id, { name });
    };

    const updateListSettings = async (id: string, settings: ListSettings) => {
        await listsSync.updateItem(id, { settings });
    };

    const updateListAccess = async (id: string) => {
        const list = listsSync.data.find((l: List) => l.id === id);
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
        await listsSync.updateItem(listId, { items });
    };

    const deleteItem = async (listId: string, itemId: string) => {
        const list = listsSync.data.find((l: List) => l.id === listId);
        if (list) {
            const itemToDelete = list.items.find((i: Item) => i.id === itemId);
            if (itemToDelete) {
                const newItems = list.items.filter((i: Item) => i.id !== itemId);
                await updateListItems(listId, newItems);

                showToast(t('toasts.itemDeleted'), 'info', {
                    label: t('common.undo'),
                    onClick: async () => {
                        const currentList = listsSync.data.find((l: List) => l.id === listId);
                        if (currentList) {
                            await updateListItems(listId, [...currentList.items, itemToDelete]);
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
        const list = listsSync.data.find((l: List) => l.id === listId);
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
        const list = listsSync.data.find((l: List) => l.id === listId);
        if (list && list.sections) {
            const updatedSections = list.sections.map(section =>
                section.id === sectionId ? { ...section, name } : section
            );
            await listsSync.updateItem(listId, { sections: updatedSections });
        }
    };

    const deleteSection = async (listId: string, sectionId: string) => {
        const list = listsSync.data.find((l: List) => l.id === listId);
        if (list) {
            const updatedSections = (list.sections || []).filter(s => s.id !== sectionId);
            const updatedItems = list.items.map(item =>
                item.sectionId === sectionId ? { ...item, sectionId: undefined } : item
            );

            await listsSync.updateItem(listId, {
                sections: updatedSections,
                items: updatedItems
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
            items: [],
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

    const defaultListId = listsSync.data.length > 0 ? listsSync.data[0].id : undefined;

    return (
        <AppContext.Provider
            value={{
                lists: listsSync.data,
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
