import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle, Search, History } from 'lucide-react';
import { Modal } from './Modal';

export const HistoryView: React.FC = () => {
    const { t } = useTranslation();
    const { itemHistory, deleteFromHistory, clearAllHistory } = useApp();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [searchFilter, setSearchFilter] = useState('');

    const sortedHistory = [...itemHistory].sort((a, b) =>
        b.usageCount - a.usageCount
    );

    // Filter by search text
    const filteredHistory = sortedHistory.filter(item =>
        item.text.toLowerCase().includes(searchFilter.toLowerCase())
    );

    const handleClearAll = async () => {
        await clearAllHistory();
        setShowClearConfirm(false);
    };

    const formatDate = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return t('history.today', 'Today');
        if (diffDays === 1) return t('history.yesterday', 'Yesterday');
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl shadow-sm">
                    <History size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {t('history.suggestionHistory', 'Suggestion History')}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {itemHistory.length} {t('history.items', 'items')} tracked
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Search and Clear All */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder={t('history.searchPlaceholder', 'Search history...')}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                        </div>
                        {itemHistory.length > 0 && (
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                className="px-6 py-3 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-2xl transition-colors whitespace-nowrap"
                            >
                                {t('history.clearAll', 'Clear All')}
                            </button>
                        )}
                    </div>

                    {/* History List */}
                    {filteredHistory.length === 0 ? (
                        <div className="p-12 text-center">
                            <History className="mx-auto mb-4 text-gray-300 dark:text-gray-700" size={48} />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                {searchFilter
                                    ? t('history.noResults', 'No items match your search')
                                    : t('history.noHistory', 'No suggestion history yet')}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredHistory.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 dark:text-white truncate text-lg">
                                            {item.text}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1">
                                                <span className="text-yellow-500">⭐</span>
                                                {item.usageCount}× {t('history.used', 'used')}
                                            </span>
                                            <span>· {formatDate(item.lastUsed)}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteFromHistory(item.id)}
                                        className="p-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title={t('history.delete', 'Delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Clear All Confirmation Modal */}
            <Modal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                title={t('history.clearAll', 'Clear All History')}
                message=""
                onConfirm={() => {}}
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {t('history.clearAllConfirm', 'Are you sure? This will delete all {{count}} suggestion history items.', { count: itemHistory.length })}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {t('common.cancel', 'Cancel')}
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                        >
                            {t('history.clearAll', 'Clear All')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
