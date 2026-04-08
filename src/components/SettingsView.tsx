import React from 'react';
import { LogOut, SortAsc, Calendar, ChevronDown, Settings, Eye, EyeOff, CloudUpload, FileJson, Copy, Check, Moon, Sun } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import type { Item } from '../types';

export const SettingsView: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const { lists, defaultListId, updateListSettings, updateListItems, theme, toggleTheme } = useApp();
    const { showToast } = useToast();
    const [importAccordionOpen, setImportAccordionOpen] = React.useState(false);
    const [jsonText, setJsonText] = React.useState('');
    const list = lists.find(l => l.id === defaultListId);
    const sortBy = list?.settings?.defaultSort || 'manual';

    const { isSupported, isLocked, requestWakeLock, releaseWakeLock } = useWakeLock();

    const [calendarAccordionOpen, setCalendarAccordionOpen] = React.useState(false);

    const toLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const getNextFullHour = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        return toLocalISOString(now);
    };

    const [calendarStartTime, setCalendarStartTime] = React.useState(() =>
        list?.settings?.calendarStartTime || getNextFullHour()
    );
    const [calendarEndTime, setCalendarEndTime] = React.useState(() => {
        if (list?.settings?.calendarEndTime) return list.settings.calendarEndTime;
        const startStr = list?.settings?.calendarStartTime || getNextFullHour();
        const endDate = new Date(startStr);
        endDate.setHours(endDate.getHours() + 1);
        return toLocalISOString(endDate);
    });

    const generateGoogleCalendarLink = () => {
        if (!list) return;

        const title = encodeURIComponent(t('lists.groceryTitle'));
        const itemsText = list.items.map(item => `• ${item.text}`).join('\n');
        const linkText = t('lists.settings.calendar.linkText');
        const deepLink = window.location.origin;
        const description = encodeURIComponent(`${itemsText}\n\n${linkText}: ${deepLink}`);

        const formatGoogleTime = (isoString: string) => {
            const date = new Date(isoString);
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const startTime = formatGoogleTime(calendarStartTime);
        const endTime = formatGoogleTime(calendarEndTime);
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&dates=${startTime}/${endTime}`;
        window.open(calendarUrl, '_blank');
    };

    const handleImportJson = async (content: string) => {
        if (!list) return;

        try {
            let data;
            try {
                data = JSON.parse(content);
            } catch {
                throw new Error('Invalid JSON');
            }

            if (!Array.isArray(data)) throw new Error('Format must be an array');

            const newItems: Item[] = [];
            for (const entry of data) {
                let text = '';
                if (typeof entry === 'string') text = entry;
                else if (typeof entry === 'object' && entry !== null && entry.text) text = entry.text;

                if (text) {
                    newItems.push({
                        id: uuidv4(),
                        text: text.trim(),
                        completed: false
                    });
                }
            }

            if (newItems.length > 0) {
                await updateListItems(list.id, [...list.items, ...newItems]);
                showToast(t('settings.importSuccess', 'Added {{count}} items', { count: newItems.length }), 'success');
                setJsonText('');
                setImportAccordionOpen(false);
            } else {
                showToast(t('settings.importNoItems', 'No valid items found'), 'error');
            }
        } catch (error) {
            console.error(error);
            showToast(t('settings.importError', 'Failed to import: Invalid format'), 'error');
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            await handleImportJson(content);
            // Reset input
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                    <Settings size={22} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('settings.title')}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{t('settings.subtitle', 'Hantera dina appinställningar och konto')}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.language')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { code: 'en', label: 'English' },
                                { code: 'sv', label: 'Svenska' }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => i18n.changeLanguage(lang.code)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-semibold ${i18n.language.startsWith(lang.code)
                                        ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-800'
                                        }`}
                                >
                                    {i18n.language.startsWith(lang.code) && <Check size={18} />}
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.display', 'Skärm')}</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                            {/* Theme Toggle */}
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' : 'bg-orange-100 text-orange-500'}`}>
                                        {theme === 'dark' ? <Moon size={22} /> : <Sun size={22} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{theme === 'dark' ? t('settings.darkMode', 'Dark Mode') : t('settings.lightMode', 'Light Mode')}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.themeDesc', 'Toggle between light and dark themes')}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                            </div>

                            {/* Wake Lock */}
                            <div className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl transition-colors ${isLocked ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                        {isLocked ? <Eye size={22} /> : <EyeOff size={22} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">{t('settings.wakeLock')}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.wakeLockDesc')}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => isLocked ? releaseWakeLock() : requestWakeLock()}
                                    disabled={!isSupported}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLocked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                        } ${!isSupported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`${isLocked ? 'translate-x-6' : 'translate-x-1'
                                            } inline-block h-5 w-5 transform rounded-full bg-white transition-transform`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('lists.settings.title')}</h3>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-gray-400 flex items-center gap-2 px-1 uppercase tracking-wider">
                                <SortAsc size={14} />
                                {t('lists.settings.sort')}
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {(['manual', 'alphabetical', 'completed'] as const).map((mode) => (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            if (list) {
                                                updateListSettings(list.id, {
                                                    threeStageMode: list.settings?.threeStageMode ?? false,
                                                    defaultSort: mode,
                                                    calendarStartTime: list.settings?.calendarStartTime,
                                                    calendarEndTime: list.settings?.calendarEndTime,
                                                    pinned: list.settings?.pinned
                                                });
                                            }
                                        }}
                                        className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${sortBy === mode
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-500 dark:text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                            : 'border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-800'
                                            }`}
                                    >
                                        <span className="text-sm font-bold">{t(`lists.sort.${mode}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 mt-2">
                            <button
                                onClick={() => setCalendarAccordionOpen(!calendarAccordionOpen)}
                                className="flex items-center justify-between w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:scale-110 transition-transform">
                                        <Calendar size={22} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 dark:text-white">{t('lists.settings.calendar.title')}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('lists.settings.calendar.description')}</div>
                                    </div>
                                </div>
                                <ChevronDown className={`text-gray-400 transition-transform duration-300 ${calendarAccordionOpen ? 'rotate-180' : ''}`} size={20} />
                            </button>

                            {calendarAccordionOpen && (
                                <div className="mt-4 space-y-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-4 duration-300">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('lists.settings.calendar.startTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarStartTime}
                                                onChange={(e) => setCalendarStartTime(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('lists.settings.calendar.endTime')}</label>
                                            <input
                                                type="datetime-local"
                                                value={calendarEndTime}
                                                onChange={(e) => setCalendarEndTime(e.target.value)}
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={generateGoogleCalendarLink}
                                        className="w-full py-4 px-6 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        <Calendar size={20} />
                                        {t('lists.settings.calendar.addToCalendar')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.dataManagement', 'Data Management')}</h3>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-gray-600 transition-all">
                            <button
                                onClick={() => setImportAccordionOpen(!importAccordionOpen)}
                                className="w-full p-4 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                                        <CloudUpload size={22} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 dark:text-white">{t('settings.importTitle', 'Import List')}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">{t('settings.importDesc', 'Add items from JSON file or text')}</div>
                                    </div>
                                </div>
                                <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${importAccordionOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <div className={`transition-all duration-300 ease-in-out px-4 overflow-hidden ${importAccordionOpen ? 'max-h-[800px] pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="pt-2 space-y-4">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 text-xs font-mono space-y-2 relative group-json">
                                        <div className="text-gray-500 uppercase tracking-wider font-bold mb-1 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FileJson size={14} />
                                                {t('settings.jsonFormat', 'Expected JSON Format:')}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const example = `[\n  { "text": "Milk" },\n  { "text": "Eggs" }\n]`;
                                                    navigator.clipboard.writeText(example);
                                                    showToast(t('common.copied', 'Copied to clipboard'), 'success');
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                                                title={t('common.copy', 'Copy')}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-700">
                                            [<br />
                                            &nbsp;&nbsp;{'{ "text": "Milk" }'},<br />
                                            &nbsp;&nbsp;{'{ "text": "Eggs" }'}<br />
                                            ]
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <textarea
                                            value={jsonText}
                                            onChange={(e) => setJsonText(e.target.value)}
                                            placeholder={t('settings.pasteJson', 'Paste JSON here...')}
                                            className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleImportJson(jsonText)}
                                            disabled={!jsonText.trim()}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all ${jsonText.trim()
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <FileJson size={18} />
                                            <span>{t('settings.importText', 'Import Text')}</span>
                                        </button>

                                        <label className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold cursor-pointer transition-all active:scale-[0.98]">
                                            <CloudUpload size={18} />
                                            <span>{t('settings.selectFile', 'Upload File')}</span>
                                            <input
                                                type="file"
                                                accept=".json"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1">{t('settings.account', 'Konto')}</h3>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-transparent group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                                        {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">{user?.displayName || user?.email}</div>
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user?.email}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => logout()}
                                    className="p-3 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl transition-all active:scale-95"
                                    title={t('settings.logout', 'Logga ut')}
                                >
                                    <LogOut size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
