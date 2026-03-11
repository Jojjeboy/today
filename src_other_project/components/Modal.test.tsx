import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';
import { describe, it, expect, vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    X: () => <div data-testid="x-icon" />
}));

describe('Modal', () => {
    it('renders correctly when open', () => {
        render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                onConfirm={() => {}}
                title="Test Title"
                message="Test Message"
            />
        );
        expect(screen.getByText('Test Title')).toBeDefined();
        expect(screen.getByText('Test Message')).toBeDefined();
    });

    it('does not render when closed', () => {
        const { container } = render(
            <Modal
                isOpen={false}
                onClose={() => {}}
                onConfirm={() => {}}
                title="Test Title"
                message="Test Message"
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when close button (x) is clicked', () => {
        const mockClose = vi.fn();
        render(
            <Modal
                isOpen={true}
                onClose={mockClose}
                onConfirm={() => {}}
                title="Test Title"
                message="Test Message"
            />
        );
        
        const closeButton = screen.getAllByRole('button')[0]; // First button is close (X)
        fireEvent.click(closeButton);
        expect(mockClose).toHaveBeenCalled();
    });

    it('calls onClose when Cancel is clicked', () => {
        const mockClose = vi.fn();
        render(
            <Modal
                isOpen={true}
                onClose={mockClose}
                onConfirm={() => {}}
                title="Test Title"
                message="Test Message"
            />
        );
        
        const cancelButton = screen.getByText('common.cancel');
        fireEvent.click(cancelButton);
        expect(mockClose).toHaveBeenCalled();
    });

    it('calls onConfirm and onClose when Confirm is clicked', () => {
        const mockConfirm = vi.fn();
        const mockClose = vi.fn();
        render(
            <Modal
                isOpen={true}
                onClose={mockClose}
                onConfirm={mockConfirm}
                title="Test Title"
                message="Test Message"
            />
        );
        
        const confirmButton = screen.getByText('common.confirm');
        fireEvent.click(confirmButton);
        expect(mockConfirm).toHaveBeenCalled();
        expect(mockClose).toHaveBeenCalled();
    });

    it('renders with destructive styling', () => {
         render(
            <Modal
                isOpen={true}
                onClose={() => {}}
                onConfirm={() => {}}
                title="Test Title"
                message="Test Message"
                isDestructive={true}
            />
        );
        
        const confirmButton = screen.getByText('common.confirm');
        expect(confirmButton.className).toContain('bg-red-600');
    });
});
