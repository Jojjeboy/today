import { useState, useEffect, useCallback } from 'react';

const WAKELOCK_PREF_KEY = 'today_wakelock_preference';

export const useWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    // Track user's explicit preference. Default to true.
    const [shouldKeepAwake, setShouldKeepAwake] = useState(() => {
        const stored = localStorage.getItem(WAKELOCK_PREF_KEY);
        return stored !== null ? stored === 'true' : true;
    });

    useEffect(() => {
        if ('wakeLock' in navigator) {
            setIsSupported(true);
        }
    }, []);

    const requestWakeLock = useCallback(async () => {
        if (!isSupported) return;
        try {
            const lock = await navigator.wakeLock.request('screen');
            setWakeLock(lock);
            setIsLocked(true);

            lock.addEventListener('release', () => {
                setIsLocked(false);
                setWakeLock(null);
            });
        } catch (err) {
            console.error(`${(err as Error).name}, ${(err as Error).message}`);
        }
    }, [isSupported]);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock) {
            await wakeLock.release();
            setWakeLock(null);
            setIsLocked(false);
        }
    }, [wakeLock]);

    // Update preference when toggled manually
    const toggleWakeLock = useCallback(async (enable: boolean) => {
        localStorage.setItem(WAKELOCK_PREF_KEY, String(enable));
        setShouldKeepAwake(enable);

        if (enable) {
            await requestWakeLock();
        } else {
            await releaseWakeLock();
        }
    }, [requestWakeLock, releaseWakeLock]);

    // Initial mount acquisition
    useEffect(() => {
        if (isSupported && shouldKeepAwake && !isLocked) {
            requestWakeLock();
        }
    }, [isSupported, shouldKeepAwake, isLocked, requestWakeLock]);

    // Re-acquire lock when page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && shouldKeepAwake && !wakeLock) {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [shouldKeepAwake, wakeLock, requestWakeLock]);

    // Expose the toggle interface instead of raw request/release, but alias it for compatibility
    return {
        isSupported,
        isLocked,
        requestWakeLock: () => toggleWakeLock(true),
        releaseWakeLock: () => toggleWakeLock(false)
    };
};
