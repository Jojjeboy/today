import { render, screen, fireEvent } from '@testing-library/react';
import { MobileFooter } from './MobileFooter';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mock useApp
const mockUseApp = vi.fn();
vi.mock('../context/AppContext', () => ({
    useApp: () => mockUseApp(),
}));

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('lucide-react')>();
    return {
        ...actual,
        Home: () => <span data-testid="home-icon" />,
        Search: () => <span data-testid="search-icon" />,
        PlusCircle: () => <span data-testid="plus-circle-icon" />,
        Settings: () => <span data-testid="settings-icon" />,
        MoreHorizontal: () => <span data-testid="more-horizontal-icon" />,
        BarChart3: () => <span data-testid="bar-chart-icon" />,
        History: () => <span data-testid="history-icon" />,
        Activity: () => <span data-testid="activity-icon" />,
        LogOut: () => <span data-testid="log-out-icon" />,
        Moon: () => <span data-testid="moon-icon" />,
        Sun: () => <span data-testid="sun-icon" />,
    };
});

describe('MobileFooter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseApp.mockReturnValue({
            theme: 'light',
            toggleTheme: vi.fn(),
        });
        mockUseAuth.mockReturnValue({
            logout: vi.fn(),
        });
    });

    it('renders the footer with all main icons', () => {
        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        expect(screen.getByTestId('home-icon')).toBeInTheDocument();
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
        expect(screen.getByTestId('plus-circle-icon')).toBeInTheDocument();
        expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
        expect(screen.getByTestId('more-horizontal-icon')).toBeInTheDocument();
    });

    it('renders the correct labels for main icons', () => {
        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        expect(screen.getByText('nav.home')).toBeInTheDocument();
        expect(screen.getByText('common.search')).toBeInTheDocument();
        expect(screen.getByText('common.add')).toBeInTheDocument();
        expect(screen.getByText('nav.settings')).toBeInTheDocument();
        expect(screen.getByText('common.more')).toBeInTheDocument();
    });

    it('renders the Add button correctly', () => {
        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        const addButton = screen.getByText('common.add').parentElement;
        expect(addButton).toBeInTheDocument();
    });

    it('opens the More menu when More button is clicked', () => {
        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        const moreButton = screen.getByText('common.more').parentElement;
        fireEvent.click(moreButton!);

        expect(screen.getByText('history.title')).toBeInTheDocument();
        expect(screen.getByText('history.statistics')).toBeInTheDocument();
        expect(screen.getByText('history.suggestionHistory')).toBeInTheDocument();
        expect(screen.getByText('app.toggleTheme')).toBeInTheDocument();
        expect(screen.getByText('common.logout')).toBeInTheDocument();
    });

    it('closes the More menu when a link is clicked', () => {
        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        const moreButton = screen.getByText('common.more').parentElement;
        fireEvent.click(moreButton!);

        expect(screen.getByText('history.title')).toBeInTheDocument();

        const activityLink = screen.getByText('history.title').parentElement;
        fireEvent.click(activityLink!);

        expect(screen.queryByText('history.title')).not.toBeInTheDocument();
    });

    it('calls logout when Logout button is clicked', () => {
        const mockLogout = vi.fn();
        mockUseAuth.mockReturnValue({ logout: mockLogout });

        render(
            <MemoryRouter>
                <MobileFooter />
            </MemoryRouter>
        );

        const moreButton = screen.getByText('common.more').parentElement;
        fireEvent.click(moreButton!);

        const logoutButton = screen.getByText('common.logout').parentElement;
        fireEvent.click(logoutButton!);

        expect(mockLogout).toHaveBeenCalled();
    });
});

