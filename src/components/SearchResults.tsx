import React from 'react';
import { useApp } from '../context/AppContext';
import { Link, useSearchParams } from 'react-router-dom';
import { ListTodo, CheckSquare, CloudUpload, ChevronRight } from 'lucide-react';

export const SearchResults: React.FC = () => {
    const { lists, todos } = useApp();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').toLowerCase();

    if (!query) return null;

    const matchedGroceries = lists.flatMap(list =>
        list.items
            .filter(item => item.text.toLowerCase().includes(query))
            .map(item => ({ ...item, listId: list.id, listName: list.name, listIsPending: list.isPending }))
    );

    const matchedTodos = todos.filter(todo =>
        todo.title.toLowerCase().includes(query) ||
        todo.content.toLowerCase().includes(query)
    );

    const totalResults = matchedGroceries.length + matchedTodos.length;

    if (totalResults === 0) {
        return (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ListTodo size={20} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try searching for something else like &quot;milk&quot; or &quot;call&quot;</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Results for &quot;<span className="text-blue-600 dark:text-blue-400">{query}</span>&quot;
                </h2>
                <span className="text-sm font-medium px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                    {totalResults} items
                </span>
            </div>

            {matchedGroceries.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <ListTodo size={16} /> Tasks
                    </h3>
                    <div className="grid gap-3">
                        {matchedGroceries.map((item) => (
                            <Link
                                key={`${item.listId}-${item.id}`}
                                to={`/list/${item.listId}`}
                                className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.completed ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                    <ListTodo size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-semibold truncate ${item.completed ? 'text-gray-400 line-through decoration-2' : 'text-gray-900 dark:text-white'}`}>
                                        {item.text}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">In {item.listName}</span>
                                        {(item.isPending || item.listIsPending) && (
                                            <CloudUpload size={12} className="text-blue-400 animate-in fade-in duration-300" />
                                        )}
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={20} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {matchedTodos.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckSquare size={16} /> Todos
                    </h3>
                    <div className="grid gap-3">
                        {matchedTodos.map((todo) => (
                            <Link
                                key={todo.id}
                                to="/todos"
                                className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${todo.completed ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-purple-50 dark:bg-purple-900/20 text-purple-500'}`}>
                                    <CheckSquare size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`font-semibold truncate ${todo.completed ? 'text-gray-400 line-through decoration-2' : 'text-gray-900 dark:text-white'}`}>
                                            {todo.title}
                                        </h4>
                                        {todo.isPending && (
                                            <CloudUpload size={14} className="text-blue-400 animate-in fade-in duration-300" />
                                        )}
                                    </div>
                                    {todo.content && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{todo.content}</p>
                                    )}
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-purple-500 transition-colors" size={20} />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
