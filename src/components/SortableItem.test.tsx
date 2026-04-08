import { render, screen, fireEvent } from '@testing-library/react';
import { SortableItem } from './SortableItem';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@dnd-kit/sortable', () => ({
    useSortable: () => ({
        attributes: {},
        listeners: {},
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    }),
}));

vi.mock('@dnd-kit/utilities', () => ({
    CSS: { Transform: { toString: vi.fn(() => '') } },
}));

vi.mock('react-swipeable-list', () => ({
    SwipeableList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    SwipeableListItem: ({ children, trailingActions }: { children: React.ReactNode; trailingActions?: React.ReactNode }) => <div>{children}</div>,
    TrailingActions: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SwipeAction: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => <div onClick={onClick}>{children}</div>,
    ListType: { IOS: 'IOS', MS: 'MS' },
}));

vi.mock('lucide-react', () => ({
    Trash2: () => <div />,
    GripVertical: () => <div />,
    CloudUpload: () => <div />,
    Calendar: () => <div />,
    ListTree: () => <div />,
    Flag: () => <button data-testid="flag-icon" />,
}));

const baseItem = {
    id: 'item1',
    text: 'Test Task',
    completed: false,
};

describe('SortableItem - Priority Cycling', () => {
    const mockOnToggle = vi.fn();
    const mockOnUpdate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('cycles priority: undefined -> low -> medium -> high -> undefined', () => {
        const { rerender } = render(
            <SortableItem
                item={{ ...baseItem, priority: undefined }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        const flagBtn = screen.getByLabelText('Cycle priority');

        // Click 1: undefined -> low
        fireEvent.click(flagBtn);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, 'item1', { priority: 'low' });

        // Rerender with updated priority
        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'low' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // Click 2: low -> medium
        fireEvent.click(flagBtn);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, 'item1', { priority: 'medium' });

        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'medium' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // Click 3: medium -> high
        fireEvent.click(flagBtn);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(3, 'item1', { priority: 'high' });

        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'high' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // Click 4: high -> undefined (back to no priority)
        fireEvent.click(flagBtn);
        expect(mockOnUpdate).toHaveBeenNthCalledWith(4, 'item1', { priority: undefined });
    });
});
