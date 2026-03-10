import { useState, useEffect, useCallback } from 'react';

export const useWakeLock = () => {
    const [isLocked, setIsLocked] = useState(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
    const [isSupported, setIsSupported] = useState(false);

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

    // Re-acquire lock when page becomes visible again
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && isLocked && !wakeLock) {
                await requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isLocked, wakeLock, requestWakeLock]);

    return { isSupported, isLocked, requestWakeLock, releaseWakeLock };
};
