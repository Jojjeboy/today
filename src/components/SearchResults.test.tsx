import { render, screen } from '@testing-library/react';
import { SearchResults } from './SearchResults';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import * as AppContext from '../context/AppContext';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    ShoppingBasket: () => <div data-testid="shopping-basket-icon" />,
    CheckSquare: () => <div data-testid="check-square-icon" />,
    CloudUpload: () => <div data-testid="cloud-sync-icon" />,
    ChevronRight: () => <div data-testid="chevron-right-icon" />
}));

describe('SearchResults', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockLists = [
        { id: 'l1', name: 'Inköpslista', categoryId: 'c1', items: [{ id: 'i1', text: 'Milk', completed: false }] },
    ];

    const mockTodos = [
        { id: 't1', title: 'Call Mom', content: 'About dinner', completed: false, priority: 'high', createdAt: '' }
    ];

    const setup = (query: string) => {
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            lists: mockLists,
            todos: mockTodos,
            loading: false,
        } as ReturnType<typeof AppContext.useApp>); // Removed 'any' as the object is now directly cast to the return type

        render(
            <MemoryRouter initialEntries={query ? [`/search?q=${query}`] : ['/search']}>
                <Routes>
                    <Route path="/search" element={<SearchResults />} />
                </Routes>
            </MemoryRouter>
        );
    };

    it('renders nothing when query is empty', () => {
        setup('');
        expect(screen.queryByText(/Results for/)).toBeNull();
    });

    it('filters grocery items by text', () => {
        setup('Milk');
        expect(screen.getByText('Groceries')).toBeDefined();
        expect(screen.getByText('Milk')).toBeDefined();
        expect(screen.getByText(/In Inköpslista/)).toBeDefined();
    });

    it('filters todos by title', () => {
        setup('Call');
        expect(screen.getByText('Todos')).toBeDefined();
        expect(screen.getByText('Call Mom')).toBeDefined();
    });

    it('filters todos by content', () => {
        setup('dinner');
        expect(screen.getByText('Todos')).toBeDefined();
        expect(screen.getByText('Call Mom')).toBeDefined();
    });

    it('shows no results found state', () => {
        setup('Astronaut');
        expect(screen.getByText('No items found')).toBeDefined();
    });
});
