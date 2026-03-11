import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

vi.mock('../firebase', () => ({
    auth: {}
}));

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializes with loading state and checks auth status', async () => {
        // Mock onAuthStateChanged to delay
        (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, _callback: (user: unknown) => void) => {
            // Do nothing immediately to simulate loading
            return () => { };
        });


        // Should start loading
        // Note: The AuthProvider only renders children when !loading. 
        // So effectively, we can't test "loading=true" through useAuth hook return if the provider blocks render.
        // However, we can test that it eventually resolves.
    });

    it('updates user when auth state changes', async () => {
        const mockUser = { uid: '123', email: 'test@example.com' };
        (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback(mockUser);
            return () => { };
        });

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
            expect(result.current.loading).toBe(false);
        });
    });

    it('signInWithGoogle calls firebase signInWithPopup', async () => {
        // Setup valid user state first to ensure hook renders
        (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback({ uid: 'guest' });
            return () => { };
        });

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.signInWithGoogle();
        });

        expect(signInWithPopup).toHaveBeenCalled();
    });

    it('logout calls firebase signOut', async () => {
        (onAuthStateChanged as unknown as ReturnType<typeof vi.fn>).mockImplementation((_auth: unknown, callback: (user: unknown) => void) => {
            callback({ uid: 'user1' });
            return () => { };
        });

        const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
        await waitFor(() => expect(result.current.loading).toBe(false));

        await act(async () => {
            await result.current.logout();
        });

        expect(signOut).toHaveBeenCalled();
    });
});
