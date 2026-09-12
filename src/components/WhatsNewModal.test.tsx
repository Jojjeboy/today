import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WhatsNewModal } from './WhatsNewModal';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { count?: number }) => {
            if (key === 'whatsNew.subtitle') return `${options?.count ?? 0} new changes`;
            return key;
        },
    }),
}));

vi.mock('../commits.json', () => ({
    default: [
        {
            hash: 'new-hash',
            author: 'Test Author',
            date: '2026-09-11T10:00:00.000Z',
            message: 'feat: add new feature',
            body: 'This is the full commit description.',
            url: 'https://github.com/Jojjeboy/today/commit/new-hash',
        },
    ],
}));

describe('WhatsNewModal', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('shows unseen commits and marks the latest commit as seen when dismissed', () => {
        render(<MemoryRouter><WhatsNewModal /></MemoryRouter>);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('feat: add new feature')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'whatsNew.dismiss' }));

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(window.localStorage.getItem('today.whats-new.last-seen-commit')).toBe('new-hash');
    });

    it('expands commit details and links to GitHub', () => {
        render(<MemoryRouter><WhatsNewModal /></MemoryRouter>);

        fireEvent.click(screen.getByRole('button', { name: /feat: add new feature/ }));

        expect(screen.getByText('This is the full commit description.')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /whatsNew.viewCommit/ })).toHaveAttribute(
            'href',
            'https://github.com/Jojjeboy/today/commit/new-hash'
        );
    });
});
