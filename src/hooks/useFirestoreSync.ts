import { useEffect, useState, useCallback } from 'react';
import {
    collection,
    onSnapshot,
    doc,
    setDoc,
    deleteDoc,
    DocumentData,
    QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

interface UseFirestoreSyncResult<T> {
    data: T[];
    loading: boolean;
    error: string | null;
    addItem: (item: T) => Promise<void>;
    updateItem: (id: string, item: Partial<T>) => Promise<void>;
    deleteItem: (id: string) => Promise<void>;
}

/**
 * Custom hook för att synkronisera en Firestore-collection med React state.
 * Den här hooken lyssnar på ändringar i realtid och uppdaterar 'data' automatiskt.
 * @param collectionPath - Sökväg till Firestore-collection (t.ex. 'users/{uid}/categories').
 * @param userId - Den inloggade användarens ID.
 * @returns Objekt med data, loading-status, felmeddelanden och CRUD-operationer.
 */
export function useFirestoreSync<T extends { id: string }>(
    collectionPath: string,
    userId: string | null | undefined
): UseFirestoreSyncResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const path = collectionPath.replace('{uid}', userId);
        const collectionRef = collection(db, path);

        const unsubscribe = onSnapshot(
            collectionRef,
            { includeMetadataChanges: true },
            (snapshot) => {
                const items: T[] = [];
                snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
                    const data = doc.data() as T;
                    // Use Firestore's built-in metadata to track pending writes
                    items.push({ 
                        ...data, 
                        isPending: doc.metadata?.hasPendingWrites || false
                    } as T);
                });
                setData(items);
                setLoading(false);
            },
            (err) => {
                console.error(`Firestore sync error for ${path}:`, err);
                if (err.code === 'resource-exhausted') {
                    setError('Firebase Quota Exceeded. Please try again tomorrow or upgrade your plan.');
                } else {
                    setError(err.message);
                }
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionPath, userId]);

    const addItem = useCallback(async (item: T) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, item.id);
        try {
            await setDoc(docRef, item);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 'resource-exhausted') {
                console.error('Firebase Quota Exceeded during addItem');
            }
            throw err;
        }
    }, [collectionPath, userId]);

    const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, id);
        try {
            await setDoc(docRef, updates, { merge: true });
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 'resource-exhausted') {
                console.error('Firebase Quota Exceeded during updateItem');
            }
            throw err;
        }
    }, [collectionPath, userId]);

    const deleteItem = useCallback(async (id: string) => {
        if (!userId) throw new Error('User not authenticated');
        const path = collectionPath.replace('{uid}', userId);
        const docRef = doc(db, path, id);
        try {
            await deleteDoc(docRef);
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'code' in err && err.code === 'resource-exhausted') {
                console.error('Firebase Quota Exceeded during deleteItem');
            }
            throw err;
        }
    }, [collectionPath, userId]);

    return {
        data,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem
    };
}
