import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CelebrationOverlayProps {
    message: string;
    duration?: number;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ message, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    if (!isVisible) return null;

    return createPortal(
        <div className="fixed inset-0 z-[250] flex items-center justify-center pointer-events-none px-6">
            <div className="max-w-xl text-center animate-in zoom-in-50 fade-in duration-500 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-white/5 shadow-2xl">
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white drop-shadow-xl animate-bounce">
                    {message}
                </h2>
                <div className="mt-4 flex justify-center gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-3 h-3 rounded-full bg-primary animate-ping delay-${i * 150}`} />
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};
