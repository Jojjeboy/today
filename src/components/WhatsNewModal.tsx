import React, { useEffect, useState } from 'react';
import { ExternalLink, GitCommit, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Commit } from '../types';
import buildCommits from '../commits.json';

const SEEN_COMMIT_KEY = 'today.whats-new.last-seen-commit';
const REPOSITORY_COMMITS_URL = 'https://github.com/Jojjeboy/today/commits/main';

const getUnseenCommits = (commits: Commit[]): Commit[] => {
    const lastSeenHash = window.localStorage.getItem(SEEN_COMMIT_KEY);
    if (!lastSeenHash) return commits;

    const lastSeenIndex = commits.findIndex(commit => commit.hash === lastSeenHash);
    return lastSeenIndex === -1 ? commits : commits.slice(0, lastSeenIndex);
};

export const WhatsNewModal: React.FC = () => {
    const { t } = useTranslation();
    const [unseenCommits, setUnseenCommits] = useState<Commit[]>([]);
    const [expandedCommit, setExpandedCommit] = useState<string | null>(null);

    useEffect(() => {
        setUnseenCommits(getUnseenCommits(buildCommits as Commit[]));
    }, []);

    const markAsSeen = () => {
        const latestCommit = buildCommits[0] as Commit | undefined;
        if (latestCommit) {
            window.localStorage.setItem(SEEN_COMMIT_KEY, latestCommit.hash);
        }
        setUnseenCommits([]);
    };

    if (unseenCommits.length === 0) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="whats-new-title"
                className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800"
            >
                <div className="flex items-start justify-between border-b border-gray-100 p-5 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                            <GitCommit size={20} />
                        </div>
                        <div>
                            <h2 id="whats-new-title" className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('whatsNew.title')}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('whatsNew.subtitle', { count: unseenCommits.length })}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={markAsSeen}
                        aria-label={t('common.close')}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="custom-scrollbar space-y-2 overflow-y-auto p-4">
                    {unseenCommits.map(commit => {
                        const isExpanded = expandedCommit === commit.hash;
                        return (
                            <div key={commit.hash} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setExpandedCommit(isExpanded ? null : commit.hash)}
                                    aria-expanded={isExpanded}
                                    className="flex w-full items-start justify-between gap-4 p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                >
                                    <span className="min-w-0">
                                        <span className="block font-semibold text-gray-900 dark:text-white">{commit.message}</span>
                                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                                            {commit.author} · {new Date(commit.date).toLocaleDateString()}
                                        </span>
                                    </span>
                                    <span className="text-lg text-gray-400" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                                </button>
                                {isExpanded && (
                                    <div className="space-y-3 border-t border-gray-200 px-4 pb-4 pt-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
                                        <p className="whitespace-pre-wrap">{commit.body || t('whatsNew.noDetails')}</p>
                                        <a
                                            href={commit.url || `https://github.com/jojjeboy/today/commit/${commit.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline dark:text-blue-400"
                                        >
                                            {t('whatsNew.viewCommit')} <ExternalLink size={14} />
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-4 dark:border-gray-700">
                    <a
                        href={REPOSITORY_COMMITS_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                        {t('whatsNew.viewAll')} <ExternalLink size={14} />
                    </a>
                    <button
                        type="button"
                        onClick={markAsSeen}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                    >
                        {t('whatsNew.dismiss')}
                    </button>
                </div>
            </div>
        </div>
    );
};