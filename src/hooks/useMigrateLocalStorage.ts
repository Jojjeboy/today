import { useState, useEffect } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { Category, List, Todo } from '../types';

export function useMigrateLocalStorage(userId: string | null | undefined) {
    const [migrating, setMigrating] = useState(false);
    const { showToast } = useToast();
    const { t } = useTranslation();

    useEffect(() => {
        const migrate = async () => {
            if (!userId) return;

            try {
                // Check if user already has data
                const categoriesRef = collection(db, `users/${userId}/categories`);
                const snapshot = await getDocs(categoriesRef);

                if (!snapshot.empty) {
                    return; // User already has data, no need to migrate
                }

                // Check if there is local data to migrate
                const localCategories = localStorage.getItem('categories');
                const localLists = localStorage.getItem('lists');
                const localNotes = localStorage.getItem('notes');

                if (!localCategories && !localLists && !localNotes) {
                    return; // Nothing to migrate
                }

                setMigrating(true);
                const batch = writeBatch(db);

                if (localCategories) {
                    const categories = JSON.parse(localCategories);
                    categories.forEach((cat: Category) => {
                        const ref = doc(db, `users/${userId}/categories`, cat.id);
                        batch.set(ref, cat);
                    });
                }

                if (localLists) {
                    const lists = JSON.parse(localLists);
                    lists.forEach((list: List) => {
                        const ref = doc(db, `users/${userId}/lists`, list.id);
                        batch.set(ref, list);
                    });
                }

                if (localNotes) {
                    interface LegacyNote {
                        id: string;
                        title: string;
                        content: string;
                        createdAt: string;
                        priority: 'low' | 'medium' | 'high';
                    }
                    const notes = JSON.parse(localNotes);
                    notes.forEach((note: LegacyNote) => {
                         const todo: Todo = {
                            id: note.id,
                            title: note.title,
                            content: note.content,
                            createdAt: note.createdAt,
                            priority: note.priority,
                            completed: false, // Default to false for migrated notes
                        };
                        const ref = doc(db, `users/${userId}/notes`, todo.id);
                        batch.set(ref, todo);
                    });
                }

                await batch.commit();

                // Clear local storage after successful migration
                localStorage.removeItem('categories');
                localStorage.removeItem('lists');
                localStorage.removeItem('notes');

                showToast(t('toasts.dataMigrated'), 'success');
            } catch (error) {
                console.error('Migration failed:', error);
                showToast(t('toasts.migrationFailed'), 'error');
            } finally {
                setMigrating(false);
            }
        };

        migrate();
    }, [userId, showToast, t]);

    return { migrating };
}
