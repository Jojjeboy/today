import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home, Search, PlusCircle, Settings, MoreHorizontal,
    BarChart3, History, Activity, LogOut, Moon, Sun
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const MobileFooter: React.FC = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme } = useApp();
    const { logout } = useAuth();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [, setSearchParams] = useSearchParams();

    return (
        <footer className="mobile-footer md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2D3540] border-t border-gray-200 dark:border-gray-800 z-[9999]">
            <div id="mobile-footer-form-slot" />
            <div className="flex justify-around items-center h-14 px-2">
                    <Link to="/" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <Home size={22} />
                        <span className="text-[10px] font-medium">{t('nav.home', 'Hem')}</span>
                    </Link>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setSearchParams({ search: '1' })}
                            title={t('common.search')}
                            aria-label={t('common.search')}
                            className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                        >
                            <Search size={22} />
                            <span className="text-[10px] font-medium">{t('common.search', 'Sök')}</span>
                        </button>
                    </div>
                    <button className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <PlusCircle size={22} />
                        <span className="text-[10px] font-medium">{t('common.add', 'Lägg till')}</span>
                    </button>
                    <Link to="/settings" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <Settings size={22} />
                        <span className="text-[10px] font-medium">{t('nav.settings', 'Inställningar')}</span>
                    </Link>
                    <div className="relative">
                        <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                            <MoreHorizontal size={22} />
                            <span className="text-[10px] font-medium">{t('common.more', 'Mer')}</span>
                        </button>
                        {isMoreMenuOpen && (
                            <div className="absolute bottom-[calc(3.5rem+env(safe-area-inset-bottom))] right-0 bg-white dark:bg-[#2D3540] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 w-48 z-50">
                                <Link to="/activity" onClick={() => setIsMoreMenuOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <Activity size={16} />
                                    <span>{t('history.title', 'Aktivitet')}</span>
                                </Link>
                                <Link to="/statistics" onClick={() => setIsMoreMenuOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <BarChart3 size={16} />
                                    <span>{t('history.statistics', 'Statistik')}</span>
                                </Link>
                                <Link to="/history" onClick={() => setIsMoreMenuOpen(false)} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <History size={16} />
                                    <span>{t('history.suggestionHistory', 'Historik')}</span>
                                </Link>
                                <button onClick={() => { toggleTheme(); setIsMoreMenuOpen(false); }} className="flex items-center gap-2 w-full p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                                    <span>{t('app.toggleTheme', 'Växla tema')}</span>
                                </button>
                                <button onClick={() => { logout(); setIsMoreMenuOpen(false); }} className="flex items-center gap-2 w-full p-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <LogOut size={16} />
                                    <span>{t('common.logout', 'Logga ut')}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </footer>
    );
};
