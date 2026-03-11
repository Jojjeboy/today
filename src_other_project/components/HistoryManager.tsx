import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

export const HistoryManager: React.FC = () => {
    const { t } = useTranslation();
    const { itemHistory, deleteFromHistory, clearAllHistory } = useApp();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const sortedHistory = [...itemHistory].sort((a, b) =>
        b.usageCount - a.usageCount
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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('history.suggestionHistory', 'Suggestion History')} ({itemHistory.length} {t('history.items', 'items')})
                </div>
                {itemHistory.length > 0 && (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        {t('history.clearAll', 'Clear All')}
                    </button>
                )}
            </div>

            {itemHistory.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    {t('history.noHistory', 'No suggestion history yet')}
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                    {sortedHistory.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                    {item.text}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3 mt-1">
                                    <span>⭐ {item.usageCount}×</span>
                                    <span>· {formatDate(item.lastUsed)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => deleteFromHistory(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title={t('history.delete', 'Delete')}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

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
