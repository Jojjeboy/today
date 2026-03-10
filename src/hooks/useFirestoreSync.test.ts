import { renderHook, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import { useFirestoreSync } from './useFirestoreSync';
import { collection, doc, setDoc, deleteDoc, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

// Mock the db import
vi.mock('../firebase', () => ({
    db: {},
}));

describe('useFirestoreSync', () => {
    const mockUserId = 'test-user-id';
    const mockCollectionPath = 'users/{uid}/test-collection';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with empty data and loading true', () => {
        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        expect(result.current.data).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should set loading to false when userId is null', () => {
        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, null)
        );

        expect(result.current.loading).toBe(false);
        expect(result.current.data).toEqual([]);
    });

    it('should call onSnapshot when userId is provided', () => {
        const mockUnsubscribe = vi.fn();
        (onSnapshot as Mock).mockImplementation((_query: unknown, options: { includeMetadataChanges?: boolean }, onNext: (snapshot: Partial<QuerySnapshot<DocumentData>>) => void) => {
            if (typeof options === 'function') {
                // Fallback for old signature if needed, but we want to test the new one
                (options as Function)({
                    forEach: () => {}
                });
            } else {
                onNext({
                    forEach: (_callback: (doc: unknown) => void) => {
                        // Simulate empty collection
                    }
                });
            }
            return mockUnsubscribe;
        });

        renderHook(() => useFirestoreSync(mockCollectionPath, mockUserId));

        expect(onSnapshot).toHaveBeenCalledWith(
            expect.any(Object),
            { includeMetadataChanges: true },
            expect.any(Function),
            expect.any(Function)
        );
        expect(collection).toHaveBeenCalledWith({}, 'users/test-user-id/test-collection');
    });

    it('should handle snapshot data correctly', async () => {
        const mockData = [
            { id: '1', name: 'Test Item 1', isPending: false },
            { id: '2', name: 'Test Item 2', isPending: false }
        ];

        (onSnapshot as Mock).mockImplementation((_query: unknown, _options: unknown, onNext: (snapshot: Partial<QuerySnapshot<DocumentData>>) => void) => {
            onNext({
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                forEach: (callback: (doc: any) => void) => {
                    mockData.forEach(item => {
                        callback({ 
                            data: () => item,
                            metadata: { hasPendingWrites: false }
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any);
                    });
                }
            });
            return vi.fn();
        });

        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.error).toBe(null);
    });

    it('should handle snapshot errors', async () => {
        const mockError = new Error('Firestore error');

        (onSnapshot as Mock).mockImplementation((_query: unknown, _options: unknown, __: unknown, onError: (error: Error) => void) => {
            onError(mockError);
            return vi.fn();
        });

        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBe('Firestore error');
        expect(result.current.data).toEqual([]);
    });

    it('should add item successfully', async () => {
        (setDoc as Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        const testItem = { id: 'test-id', name: 'Test Item' };

        await act(async () => {
            await result.current.addItem(testItem);
        });

        expect(setDoc).toHaveBeenCalledWith(
            expect.any(Object),
            testItem
        );
        expect(doc).toHaveBeenCalledWith({}, 'users/test-user-id/test-collection', 'test-id');
    });

    it('should update item successfully', async () => {
        (setDoc as Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        const updates = { name: 'Updated Name' };

        await act(async () => {
            await result.current.updateItem('test-id', updates);
        });

        expect(setDoc).toHaveBeenCalledWith(
            expect.any(Object),
            updates,
            { merge: true }
        );
    });

    it('should delete item successfully', async () => {
        (deleteDoc as Mock).mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        await act(async () => {
            await result.current.deleteItem('test-id');
        });

        expect(deleteDoc).toHaveBeenCalledWith(expect.any(Object));
        expect(doc).toHaveBeenCalledWith({}, 'users/test-user-id/test-collection', 'test-id');
    });

    it('should throw error when userId is null for operations', async () => {
        const { result } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, null)
        );

        const testItem = { id: 'test-id', name: 'Test Item' };

        await expect(result.current.addItem(testItem)).rejects.toThrow('User not authenticated');
        await expect(result.current.updateItem('test-id', {})).rejects.toThrow('User not authenticated');
        await expect(result.current.deleteItem('test-id')).rejects.toThrow('User not authenticated');
    });

    it('should unsubscribe on unmount', () => {
        const mockUnsubscribe = vi.fn();
        (onSnapshot as Mock).mockReturnValue(mockUnsubscribe);

        const { unmount } = renderHook(() =>
            useFirestoreSync(mockCollectionPath, mockUserId)
        );

        unmount();

        expect(mockUnsubscribe).toHaveBeenCalled();
    });
});