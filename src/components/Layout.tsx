import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu, X, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar';
import { OfflineIndicator } from './OfflineIndicator';
import { useWakeLock } from '../hooks/useWakeLock';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useApp();
    const { isSupported, isLocked, requestWakeLock, releaseWakeLock } = useWakeLock();
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 flex-shrink-0 sticky top-0 h-screen z-20">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar Overlay/Drawer */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div 
                        className="absolute right-0 top-0 bottom-0 w-[280px] bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-300 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 flex justify-end">
                            <button 
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <Sidebar onNavClick={() => setIsMenuOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                <OfflineIndicator />

                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-10 glass p-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <img src="/today/favicon.png" alt="Logo" className="w-16 h-16 rounded-xl shadow-sm" />
                                <h1 className="text-3xl font-bold text-[#2c6de3]">
                                    today
                                </h1>
                            </Link>
                        </div>
                        <div className="flex items-center gap-2">
                            {isSupported && (
                                <button
                                    onClick={() => isLocked ? releaseWakeLock() : requestWakeLock()}
                                    className={`p-2 rounded-full transition-colors ${
                                        isLocked 
                                            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' 
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                    title={t('settings.wakeLock')}
                                >
                                    {isLocked ? <Eye size={22} /> : <EyeOff size={22} />}
                                </button>
                            )}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                aria-label={t('app.toggleTheme')}
                            >
                                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 ml-1"
                                aria-label="Menu"
                            >
                                <Menu size={26} />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Scrollable Content */}
                <main className="flex-1 p-4 w-full mx-auto md:p-8 md:max-w-7xl pb-8 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
};
