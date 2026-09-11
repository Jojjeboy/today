import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home, Search, PlusCircle, Settings, MoreHorizontal,
    BarChart3, History, Activity, LogOut, Moon, Sun, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { MAX_ITEM_LENGTH } from '../constants';

export const MobileFooter: React.FC = () => {
    const { t } = useTranslation();
    const { theme, toggleTheme, lists, defaultListId, updateListItems } = useApp();
    const { logout } = useAuth();
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [showInput, setShowInput] = useState(false);
    const [newItemText, setNewItemText] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddClick = () => {
        setShowInput(true);
        setNewItemText('');
    };

    const handleCloseInput = () => {
        setShowInput(false);
        setNewItemText('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemText.trim()) return;

        const list = lists.find((l) => l.id === defaultListId);
        if (!list) return;

        const newItem = {
            id: uuidv4(),
            text: newItemText.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        updateListItems(list.id, [...list.items, newItem]);
        setNewItemText('');
        setShowInput(false);
    };

    return (
        <>
            {showInput && (
                <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-white dark:bg-[#2D3540] border-t border-gray-200 dark:border-gray-800 z-40">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder={t('lists.addItemPlaceholder', 'Vad behöver göras?')}
                            maxLength={MAX_ITEM_LENGTH}
                            className="flex-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!newItemText.trim()}
                            className="p-2 bg-primary rounded-lg text-[#161618] hover:opacity-90 transition-colors disabled:opacity-50 disabled:grayscale"
                        >
                            <PlusCircle size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseInput}
                            className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </form>
                </div>
            )}
            <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#2D3540] border-t border-gray-200 dark:border-gray-800 shadow-lg z-50">
                <div className="flex justify-around items-center h-14 px-2">
                    <Link to="/" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <Home size={22} />
                        <span className="text-[10px] font-medium">{t('nav.home', 'Hem')}</span>
                    </Link>
                    <Link to="/search" className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                        <Search size={22} />
                        <span className="text-[10px] font-medium">{t('common.search', 'Sök')}</span>
                    </Link>
                    <button onClick={handleAddClick} className="flex flex-col items-center gap-1 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
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
                            <div className="absolute bottom-14 right-0 bg-white dark:bg-[#2D3540] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-2 w-48 z-50">
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
        </>
    );
};
