import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, Edit2, Save, X, Check, CloudUpload } from 'lucide-react';
import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { Todo } from '../types';

type Priority = Todo['priority'];

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        case 'low': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    }
};

const getPriorityBadgeStyle = (priority: Priority) => {
    switch (priority) {
        case 'high': return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400';
        case 'medium': return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400';
        case 'low': return 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400';
    }
};

export const TodoView: React.FC = () => {
    const { t } = useTranslation();
    const { todos, addTodo, updateTodo, toggleTodo, deleteTodo } = useApp();
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState(''); // Optional details
    const [newPriority, setNewPriority] = useState<Priority>('low');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editPriority, setEditPriority] = useState<Priority>('low');

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);

    // Sorting: Incomplete first, then by priority (High -> Low), then newest
    const sortedTodos = [...todos].sort((a, b) => {
        if (a.completed === b.completed) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const pA = priorityOrder[a.priority];
            const pB = priorityOrder[b.priority];
            if (pA !== pB) return pB - pA;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.completed ? 1 : -1;
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const title = newTitle.trim();
        const content = newContent.trim();
        const priority = newPriority;

        if (title) {
            // Immediate feedback
            setNewTitle('');
            setNewContent('');
            setNewPriority('low');
            setIsAdding(false);

            try {
                await addTodo(title, content, priority);
            } catch (error) {
                console.error("Failed to add todo:", error);
            }
        }
    };

    const startEditing = (todo: Todo) => {
        setEditingId(todo.id);
        setEditTitle(todo.title);
        setEditContent(todo.content);
        setEditPriority(todo.priority);
    };

    const handleUpdate = async (id: string) => {
        const title = editTitle.trim();
        const content = editContent.trim();
        const priority = editPriority;

        if (title) {
            // Immediate feedback
            setEditingId(null);
            setEditTitle('');
            setEditContent('');
            setEditPriority('low');

            try {
                await updateTodo(id, title, content, priority);
            } catch (error) {
                console.error("Failed to update todo:", error);
            }
        }
    };

    const confirmDelete = (id: string) => {
        setTodoToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (todoToDelete) {
            await deleteTodo(todoToDelete);
            setDeleteModalOpen(false);
            setTodoToDelete(null);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('todos.title')}</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                    {isAdding ? <X size={20} /> : <Plus size={20} />}
                    <span className="font-medium">{isAdding ? t('todos.cancel') : t('todos.add')}</span>
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder={t('todos.titlePlaceholder')}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium"
                        autoFocus
                    />
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder={t('todos.contentPlaceholder')}
                        rows={2}
                        className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                    <div className="flex flex-col gap-4 pt-2">
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewPriority(p)}
                                    className={clsx(
                                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                        newPriority === p
                                            ? getPriorityColor(p)
                                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    )}
                                >
                                    {t(`todos.priority.${p}`)}
                                </button>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={!newTitle.trim()}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg"
                        >
                            {t('todos.save')}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {todos.length === 0 && !isAdding && (
                    <div className="text-center py-20 opacity-50">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('todos.empty')}</p>
                    </div>
                )}

                {sortedTodos.map((todo) => (
                    <div
                        key={todo.id}
                        className={clsx(
                            "group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300",
                            todo.completed && "bg-gray-50/50 dark:bg-gray-900/30 border-transparent shadow-none"
                        )}
                    >
                        {editingId === todo.id ? (
                            <div className="p-6 space-y-4 bg-blue-50/30 dark:bg-blue-900/10">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                />
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    rows={2}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                                <div className="space-y-4 mt-4">
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high'] as const).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setEditPriority(p)}
                                                className={clsx(
                                                    "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                                                    editPriority === p
                                                        ? getPriorityColor(p)
                                                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                                                )}
                                            >
                                                {t(`todos.priority.${p}`)}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm"
                                        >
                                            {t('todos.cancel')}
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(todo.id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
                                        >
                                            <Save size={16} /> {t('todos.saveChanges')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 flex items-start gap-4">
                                <button
                                    onClick={() => toggleTodo(todo.id)}
                                    className={clsx(
                                        "flex-shrink-0 w-6 h-6 rounded-lg border-2 mt-1 flex items-center justify-center transition-all duration-200",
                                        todo.completed
                                            ? "bg-blue-500 border-blue-500 text-white scale-90"
                                            : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                                    )}
                                >
                                    {todo.completed && <Check size={14} strokeWidth={3} />}
                                </button>

                                <div className="flex-1 min-w-0">
                                    <button
                                        type="button"
                                        className="w-full text-left cursor-pointer outline-none group/title"
                                        onClick={() => startEditing(todo)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h3 className={clsx(
                                                "text-lg font-medium transition-all duration-200 group-hover/title:text-blue-600 dark:group-hover/title:text-blue-400",
                                                todo.completed
                                                    ? "text-gray-400 dark:text-gray-500 line-through decoration-2 decoration-gray-200 dark:decoration-gray-700"
                                                    : "text-gray-900 dark:text-white"
                                            )}>
                                                {todo.title}
                                            </h3>
                                            {todo.isPending && (
                                                <div className="text-blue-400 animate-in fade-in duration-300" title="Syncing...">
                                                    <CloudUpload size={14} />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    
                                    {todo.content && (
                                        <p className={clsx(
                                            "text-sm whitespace-pre-wrap mt-1 leading-relaxed",
                                            todo.completed ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-300"
                                        )}>
                                            {todo.content}
                                        </p>
                                    )}

                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={clsx(
                                            "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                            getPriorityBadgeStyle(todo.priority)
                                        )}>
                                            {t(`todos.priority.${todo.priority}`)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); startEditing(todo); }}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); confirmDelete(todo.id); }}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={t('todos.deleteTitle')}
                message={t('todos.deleteMessage')}
                confirmText={t('todos.deleteConfirm')}
                isDestructive
            />
        </div >
    );
};
