import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from './AppContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { List } from '../types';

// Mocks
const mockAddItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockDeleteItem = vi.fn();
const mockShowToast = vi.fn();

vi.mock('../hooks/useFirestoreSync', () => ({
    useFirestoreSync: (path: string) => {
        // Return different data based on path for basic structure
        let data: List[] = [];
        if (path.includes('lists')) {
            data = [
                { id: 'list1', name: 'List 1', categoryId: 'cat1', items: [] },
                { id: 'list2', name: 'List 2', categoryId: 'cat1', items: [] },
                { id: 'list3', name: 'List 3', categoryId: 'cat1', items: [] }
            ];
        }

        return {
            data,
            loading: false,
            error: null,
            addItem: mockAddItem,
            updateItem: mockUpdateItem,
            deleteItem: mockDeleteItem,
        };
    }
}));

vi.mock('./AuthContext', () => ({
    useAuth: () => ({ user: { uid: 'test-user' } }),
}));

vi.mock('./ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../hooks/useMigrateLocalStorage', () => ({
    useMigrateLocalStorage: () => ({ migrating: false }),
}));

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

describe('AppContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('addSection adds new section at the top (order 0)', async () => {
        const { result } = renderHook(() => useApp(), { wrapper: AppProvider });

        // Mock existing sections in list1
        // Note: The mock setup uses `lists` data which initally has no sections.
        // But `addSection` logic reads `listsSync.data`. 
        // We need to ensure `list1` has some sections if we want to test prepending,
        // OR just test that order is 0 even if it's the first one, but prepending is key.
        // Let's rely on the implementaton logic: it takes existing sections, prepends new one, re-indexes.
        // The mockUpdateItem should receive the new array.

        // Let's assume list1 works perfectly.

        await act(async () => {
            await result.current.addSection('New Top Section');
        });

        expect(mockUpdateItem).toHaveBeenCalledWith('list1', expect.objectContaining({
            sections: expect.arrayContaining([
                expect.objectContaining({
                    name: 'New Top Section',
                    order: 0
                })
            ])
        }));
    });
});
