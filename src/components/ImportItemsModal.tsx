import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, ChevronDown, Copy, Check, X } from 'lucide-react';

interface ImportItemsModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Called with validated item texts to add to the list */
    onImport: (items: string[]) => Promise<void>;
    /** Existing item texts (lowercased) to detect duplicates */
    existingItemTexts: string[];
}

const SIMPLE_EXAMPLE = `["Milk", "Eggs", "Bread", "Butter"]`;
const OBJECT_EXAMPLE = `[{"text": "Milk"}, {"text": "Eggs"}, {"text": "Bread"}]`;
const WRAPPED_EXAMPLE = `{"items": ["Milk", "Eggs", "Bread"]}`;

/**
 * Parses a JSON string and extracts a list of item texts.
 * Accepts the following formats:
 *   1. ["Milk", "Eggs"]                   — array of strings
 *   2. [{"text": "Milk"}]                 — array of objects with a `text` field
 *   3. {"items": ["Milk"]}                — object with an `items` array of strings
 *   4. {"items": [{"text": "Milk"}]}      — object with an `items` array of objects
 * Returns the extracted texts or throws a descriptive error key.
 */
function parseJsonItems(raw: string): string[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw 'errorInvalidJson';
    }

    let arr: unknown[];

    if (Array.isArray(parsed)) {
        arr = parsed;
    } else if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'items' in (parsed as object) &&
        Array.isArray((parsed as Record<string, unknown>).items)
    ) {
        arr = (parsed as Record<string, unknown>).items as unknown[];
    } else {
        throw 'errorInvalidFormat';
    }

    const texts: string[] = [];
    for (const entry of arr) {
        if (typeof entry === 'string' && entry.trim()) {
            texts.push(entry.trim());
        } else if (
            entry !== null &&
            typeof entry === 'object' &&
            typeof (entry as Record<string, unknown>).text === 'string' &&
            ((entry as Record<string, unknown>).text as string).trim()
        ) {
            texts.push(((entry as Record<string, unknown>).text as string).trim());
        }
    }

    if (texts.length === 0) {
        throw 'errorNoItems';
    }

    return texts;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // ignore
        }
    };

    return (
        <div className="relative group">
            <pre className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg p-3 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all pr-10">
                {code}
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy"
            >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        </div>
    );
};

export const ImportItemsModal: React.FC<ImportItemsModalProps> = ({
    isOpen,
    onClose,
    onImport,
    existingItemTexts,
}) => {
    const { t } = useTranslation();
    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState('');
    const [showExample, setShowExample] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            setJsonText(text);
            setError('');
        };
        reader.readAsText(file);
        // Reset so the same file can be re-selected
        e.target.value = '';
    };

    const handleImport = async () => {
        const raw = jsonText.trim();
        if (!raw) {
            setError(t('importItems.errorEmpty'));
            return;
        }

        let texts: string[];
        try {
            texts = parseJsonItems(raw);
        } catch (errKey) {
            setError(t(`importItems.${errKey as string}`));
            return;
        }

        // Separate new items from duplicates
        const existingSet = new Set(existingItemTexts.map((s) => s.toLowerCase()));
        const newTexts = texts.filter((t) => !existingSet.has(t.toLowerCase()));
        const dupeCount = texts.length - newTexts.length;

        if (newTexts.length === 0 && dupeCount > 0) {
            setError(t('importItems.skippedDupes', { count: dupeCount }));
            return;
        }

        setError('');
        setIsImporting(true);
        try {
            await onImport(newTexts);
            // Reset state on success
            setJsonText('');
            setShowExample(false);
            onClose();
        } catch {
            setError(t('importItems.errorFailed'));
        } finally {
            setIsImporting(false);
        }
    };

    const handleClose = () => {
        setJsonText('');
        setError('');
        setShowExample(false);
        onClose();
    };

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Upload size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {t('importItems.title')}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('importItems.description')}
                    </p>

                    {/* Example formats accordion */}
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <button
                            onClick={() => setShowExample(!showExample)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {showExample ? t('importItems.hideExample') : t('importItems.showExample')}
                            </span>
                            <ChevronDown
                                size={16}
                                className={`text-gray-400 transition-transform duration-200 ${showExample ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showExample && (
                            <div className="px-4 pb-4 pt-3 space-y-3 bg-white dark:bg-gray-800 animate-in slide-in-from-top-1 duration-150">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                                    {t('importItems.exampleLabel')}
                                </p>

                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {t('importItems.simpleFormat')}
                                    </p>
                                    <CodeBlock code={SIMPLE_EXAMPLE} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {t('importItems.objectFormat')}
                                    </p>
                                    <CodeBlock code={OBJECT_EXAMPLE} />
                                </div>

                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        {t('importItems.wrappedFormat')}
                                    </p>
                                    <CodeBlock code={WRAPPED_EXAMPLE} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Textarea */}
                    <textarea
                        value={jsonText}
                        onChange={(e) => { setJsonText(e.target.value); setError(''); }}
                        placeholder={t('importItems.placeholder')}
                        rows={6}
                        className={`w-full p-3 rounded-xl border text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 outline-none resize-none transition-colors ${
                            error
                                ? 'border-red-300 dark:border-red-600 focus:ring-red-200 dark:focus:ring-red-900'
                                : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
                        }`}
                    />

                    {/* File upload */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-xs text-gray-400">{t('importItems.orUpload')}</span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    </div>

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-sm font-medium"
                    >
                        <Upload size={16} />
                        {t('importItems.selectFile')}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    {/* Error message */}
                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in duration-150">
                            <X size={14} className="flex-shrink-0" />
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={isImporting || !jsonText.trim()}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload size={15} />
                        {isImporting ? t('importItems.importing') : t('importItems.import')}
                    </button>
                </div>
            </div>
        </div>
    );
};
