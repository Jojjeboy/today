import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoListView } from './TodoListView';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as AppContext from '../context/AppContext';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../context/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

vi.mock('../hooks/useCelebration', () => ({
    useCelebration: () => ({ getCelebrationMessage: vi.fn(() => 'Yay!') }),
}));

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
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
    }),
}));

vi.mock('lucide-react', () => ({
    Plus: () => <div />,
    RotateCcw: () => <div />,
    ChevronDown: () => <div />,
    CloudUpload: () => <div />,
    X: () => <div />,
    Calendar: () => <div />,
    ListTree: () => <div />,
    GripVertical: () => <div />,
    Trash2: () => <div />,
    Flag: () => <div />,
    ArrowUpDown: () => <div />,
    Clock: () => <div />,
    Type: () => <div />,
}));

const mockUpdateListItems = vi.fn().mockResolvedValue(undefined);
const mockAddToHistory = vi.fn().mockResolvedValue(undefined);

const makeAppMock = () => ({
    lists: [
        {
            id: 'list1',
            name: 'My List',
            items: [],
            categoryId: 'cat1',
            settings: { defaultSort: 'manual', threeStageMode: false },
        }
    ],
    defaultListId: 'list1',
    updateListItems: mockUpdateListItems,
    addToHistory: mockAddToHistory,
    deleteFromHistory: vi.fn(),
    itemHistory: [],
    loading: false,
    updateListAccess: vi.fn(),
    deleteItem: vi.fn(),
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
    updateListName: vi.fn(),
    updateListSettings: vi.fn(),
});

describe('TodoListView - Add Item', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AppContext, 'useApp').mockReturnValue(makeAppMock() as unknown as ReturnType<typeof AppContext.useApp>);
    });

    it('adds a new item with no default priority when submitted', async () => {
        render(<TodoListView />);

        const input = screen.getByPlaceholderText('lists.addItemPlaceholder');
        fireEvent.change(input, { target: { value: 'Buy groceries' } });
        const form = input.closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockUpdateListItems).toHaveBeenCalled();
        });

        const [listId, items] = mockUpdateListItems.mock.calls[0];
        expect(listId).toBe('list1');
        const added = items[items.length - 1];
        expect(added.text).toBe('Buy groceries');
        expect(added.completed).toBe(false);
        expect(added.priority).toBeUndefined();

        await waitFor(() => {
            expect(mockAddToHistory).toHaveBeenCalledWith('Buy groceries');
        });
    });

    it('parses NLP dates and removes them from the task title', async () => {
        render(<TodoListView />);

        const input = screen.getByPlaceholderText('lists.addItemPlaceholder');
        fireEvent.change(input, { target: { value: 'Call boss tomorrow' } });
        const form = input.closest('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockUpdateListItems).toHaveBeenCalled();
        });

        const [, items] = mockUpdateListItems.mock.calls[0];
        const added = items[items.length - 1];
        expect(added.text).toBe('Call boss');
        expect(added.dueDate).toBeDefined();
        expect(typeof added.dueDate).toBe('string');
    });
});
