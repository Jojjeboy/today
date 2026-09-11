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
    Type: { IOS: 'IOS', MS: 'MS' },
}));

vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('lucide-react')>();
    return {
        ...actual,
        Flag: () => <button data-testid="flag-icon" />,
    };
});

const baseItem = {
    id: 'item1',
    text: 'Test Task',
    completed: false,
};

describe('SortableItem - Priority Controls', () => {
    const mockOnToggle = vi.fn();
    const mockOnUpdate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('raises and lowers priority with separate arrow controls', () => {
        const { rerender } = render(
            <SortableItem
                item={{ ...baseItem, priority: undefined }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        const openMenu = () => {
            const moreBtn = screen.getByLabelText('More actions');
            fireEvent.click(moreBtn);
        };

        const clickIncrease = () => fireEvent.click(screen.getByRole('button', { name: 'lists.increasePriority' }));
        const clickDecrease = () => fireEvent.click(screen.getByRole('button', { name: 'lists.decreasePriority' }));

        // Increase: undefined -> low
        openMenu();
        expect(screen.getByRole('button', { name: 'lists.decreasePriority' })).toBeDisabled();
        clickIncrease();
        expect(mockOnUpdate).toHaveBeenNthCalledWith(1, 'item1', { priority: 'low' });

        // Rerender with updated priority
        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'low' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // Increase: low -> medium
        openMenu();
        clickIncrease();
        expect(mockOnUpdate).toHaveBeenNthCalledWith(2, 'item1', { priority: 'medium' });

        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'medium' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // Increase: medium -> high
        openMenu();
        clickIncrease();
        expect(mockOnUpdate).toHaveBeenNthCalledWith(3, 'item1', { priority: 'high' });

        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'high' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        // High cannot be increased further; decrease high -> medium.
        openMenu();
        expect(screen.getByRole('button', { name: 'lists.increasePriority' })).toBeDisabled();
        clickDecrease();
        expect(mockOnUpdate).toHaveBeenNthCalledWith(4, 'item1', { priority: 'medium' });

        rerender(
            <SortableItem
                item={{ ...baseItem, priority: 'low' }}
                onToggle={mockOnToggle}
                onUpdate={mockOnUpdate}
            />
        );

        openMenu();
        clickDecrease();
        expect(mockOnUpdate).toHaveBeenNthCalledWith(5, 'item1', { priority: undefined });
    });
});
