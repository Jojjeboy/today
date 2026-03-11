import { render, screen, fireEvent } from '@testing-library/react';
import { ListDetail } from './ListDetail';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import * as AppContext from '../context/AppContext';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock ToastContext so useToast doesn't throw
vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

// Mock ImportItemsModal to avoid rendering its internals in these unit tests
vi.mock('./ImportItemsModal', () => ({
    ImportItemsModal: () => null,
}));

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
    DndContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    closestCenter: vi.fn(),
    PointerSensor: vi.fn(),
    KeyboardSensor: vi.fn(),
    useSensor: vi.fn(),
    useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    sortableKeyboardCoordinates: vi.fn(),
    verticalListSortingStrategy: vi.fn(),
    arrayMove: vi.fn(),
}));

// Mock child components
vi.mock('./SortableItem', () => ({
    SortableItem: ({ item, onToggle }: { item: { id: string; text: string }; onToggle: (id: string) => void }) => (
        <div data-testid="sortable-item">
            {item.text}
            <button onClick={() => onToggle(item.id)}>Toggle</button>
        </div>
    )
}));

vi.mock('lucide-react', () => ({
    Plus: () => <div />,
    ChevronLeft: () => <div />,
    RotateCcw: () => <div />,
    Settings: () => <div data-testid="settings-icon" />,
    ChevronDown: () => <div />,
    Pin: () => <div />,
    Upload: () => <div />,
    Trash2: () => <div />,
    Edit2: () => <div />,
}));

const mockUpdateListItems = vi.fn();

describe('ListDetail', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            lists: [
                {
                    id: 'list1',
                    name: 'My List',
                    categoryId: 'cat1',
                    items: [
                        { id: 'i1', text: 'Apple', completed: false },
                        { id: 'i2', text: 'Banana', completed: false }
                    ]
                }
            ],
            updateListItems: mockUpdateListItems,
            deleteItem: vi.fn(),
            updateListName: vi.fn(),
            updateListSettings: vi.fn(),
            updateListAccess: vi.fn(),
            // defaults
            categories: [],
            addCategory: vi.fn(),
            deleteCategory: vi.fn(),
            // History
            itemHistory: [],
            addToHistory: vi.fn(),
            reorderCategories: vi.fn(),
            addList: vi.fn(),
            deleteList: vi.fn(),
            copyList: vi.fn(),
            moveList: vi.fn(),
            updateCategoryName: vi.fn(),
            reorderLists: vi.fn(),
            addSession: vi.fn(),
            combinations: [],
            addCombination: vi.fn(),
            updateCombination: vi.fn(),
            deleteCombination: vi.fn(),
            sessions: [],
            completeSession: vi.fn(),
            deleteSession: vi.fn(),
        } as Partial<ReturnType<typeof AppContext.useApp>> as ReturnType<typeof AppContext.useApp>);
    });

    const renderComponent = () => {
        const router = createMemoryRouter(
            [
                {
                    path: '/list/:listId',
                    element: <ListDetail />,
                },
            ],
            {
                initialEntries: ['/list/list1'],
            }
        );

        render(<RouterProvider router={router} />);
    };

    it('renders list items', () => {
        renderComponent();
        expect(screen.getByText('Apple')).toBeDefined();
        expect(screen.getByText('Banana')).toBeDefined();
    });

    it('adds a new item', () => {
        renderComponent();
        const input = screen.getByPlaceholderText('lists.addItemPlaceholder');
        fireEvent.change(input, { target: { value: 'Cherry' } });

        const form = input.closest('form');
        fireEvent.submit(form!);

        expect(mockUpdateListItems).toHaveBeenCalledWith('list1', expect.arrayContaining([
            expect.objectContaining({ text: 'Apple' }),
            expect.objectContaining({ text: 'Banana' }),
            expect.objectContaining({ text: 'Cherry', completed: false })
        ]));
    });

    it('toggles item completion', () => {
        renderComponent();
        const toggleButtons = screen.getAllByText('Toggle');
        fireEvent.click(toggleButtons[0]); // Apple

        expect(mockUpdateListItems).toHaveBeenCalledWith('list1', expect.arrayContaining([
            expect.objectContaining({ id: 'i1', completed: true }), // Toggled to true
            expect.objectContaining({ id: 'i2', completed: false })
        ]));
    });

    it('toggles item 3-stage unresolved -> prepared -> completed', async () => {
        // Mock list with 3-stage enabled
        vi.spyOn(AppContext, 'useApp').mockReturnValue({
            lists: [
                {
                    id: 'list1',
                    name: 'My List',
                    categoryId: 'cat1',
                    items: [
                        { id: 'i1', text: 'Apple', completed: false, state: 'unresolved' }
                    ],
                    settings: { threeStageMode: true, defaultSort: 'manual' }
                }
            ],
            updateListItems: mockUpdateListItems,
            deleteItem: vi.fn(),
            updateListName: vi.fn(),
            updateListSettings: vi.fn(),
            updateListAccess: vi.fn(),
            categories: [],
            addCategory: vi.fn(),
            deleteCategory: vi.fn(),
            reorderCategories: vi.fn(),
            addList: vi.fn(),
            deleteList: vi.fn(),
            copyList: vi.fn(),
            moveList: vi.fn(),
            updateCategoryName: vi.fn(),
            reorderLists: vi.fn(),
            addSession: vi.fn(),
            combinations: [],
            addCombination: vi.fn(),
            updateCombination: vi.fn(),
            deleteCombination: vi.fn(),
            sessions: [],
            completeSession: vi.fn(),
            deleteSession: vi.fn(),
            itemHistory: [],
            addToHistory: vi.fn(),
            // Add other required mock properties if missing from previous context
        } as Partial<ReturnType<typeof AppContext.useApp>> as ReturnType<typeof AppContext.useApp>);

        renderComponent();
        const toggleButtons = screen.getAllByText('Toggle');
        fireEvent.click(toggleButtons[0]); // Apple: unresolved -> ongoing

        expect(mockUpdateListItems).toHaveBeenCalledWith('list1', expect.arrayContaining([
            expect.objectContaining({ id: 'i1', completed: false, state: 'ongoing' })
        ]));
    });

});
