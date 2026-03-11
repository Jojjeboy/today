import { renderHook, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('showToast adds a toast', async () => {
        const { result } = renderHook(() => useToast(), { wrapper: ToastProvider });

        act(() => {
            result.current.showToast('Test Message', 'success');
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0]).toMatchObject({
            message: 'Test Message',
            type: 'success'
        });
    });

    it('removeToast removes a toast by id', async () => {
        const { result } = renderHook(() => useToast(), { wrapper: ToastProvider });

        act(() => {
            result.current.showToast('Test Message', 'success');
        });

        const toastId = result.current.toasts[0].id;

        act(() => {
            result.current.removeToast(toastId);
        });

        expect(result.current.toasts).toHaveLength(0);
    });

    it('auto removes toast after 5 seconds', async () => {
        const { result } = renderHook(() => useToast(), { wrapper: ToastProvider });

        act(() => {
            result.current.showToast('Test Message', 'success');
        });

        expect(result.current.toasts).toHaveLength(1);

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(result.current.toasts).toHaveLength(0);
    });
});
