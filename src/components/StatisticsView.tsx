import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import {
    PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    List, CheckCircle2,
    ListTodo, ShoppingCart, Activity
} from 'lucide-react';

export const StatisticsView: React.FC = () => {
    const { t } = useTranslation();
    const { lists, todos, itemHistory } = useApp();

    // Color constants for charts
    const PRIORITY_COLORS = {
        high: '#EF4444',
        medium: '#F59E0B',
        low: '#10B981'
    };

    // Calculate overall metrics
    const metrics = useMemo(() => {
        const totalItems = lists.reduce((acc, list) => acc + list.items.length, 0);
        const totalCompletedItems = lists.reduce((acc, list) =>
            acc + list.items.filter(item => item.completed).length, 0);
        const completionRate = totalItems > 0 ? Math.round((totalCompletedItems / totalItems) * 100) : 0;

        return [
            { id: 'items', label: t('stats.metrics.totalItems', 'Totala varor'), value: totalItems, icon: List, color: 'text-blue-600', bg: 'bg-blue-100/50' },
            { id: 'completed', label: t('stats.metrics.completedItems'), value: totalCompletedItems, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100/50' },
            { id: 'rate', label: t('stats.completionRate', 'Genomförandegrad'), value: `${completionRate}%`, icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100/50' },
            { id: 'todos', label: t('stats.metrics.totalTodos'), value: todos.length, icon: ListTodo, color: 'text-purple-600', bg: 'bg-purple-100/50' },
        ];
    }, [lists, todos, t]);

    // Data for Priority Distribution
    const priorityData = useMemo(() => {
        return [
            { name: t('todos.priority.high'), value: todos.filter(t => t.priority === 'high').length, fill: PRIORITY_COLORS.high },
            { name: t('todos.priority.medium'), value: todos.filter(t => t.priority === 'medium').length, fill: PRIORITY_COLORS.medium },
            { name: t('todos.priority.low'), value: todos.filter(t => t.priority === 'low').length, fill: PRIORITY_COLORS.low },
        ].filter(d => d.value > 0);
    }, [todos, t, PRIORITY_COLORS]);

    // Data for Most Used Items
    const topItemsData = useMemo(() => {
        return [...itemHistory]
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, 10)
            .map(item => ({
                name: item.text,
                count: item.usageCount
            }));
    }, [itemHistory]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {t('stats.title')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {t('stats.subtitle')}
                </p>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric) => (
                    <div key={metric.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center group hover:shadow-md transition-all">
                        <div className={`p-3 rounded-xl ${metric.bg} ${metric.color} mb-3 group-hover:scale-110 transition-transform`}>
                            <metric.icon size={24} />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{metric.value}</div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               {/* Priorities Distribution - Only show if there are todos */}
               {todos.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6">
                            <ListTodo className="text-orange-500" size={20} />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{t('stats.todosPriority')}</h3>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                    >
                                        {priorityData.map((entry) => (
                                            <Cell key={`cell-priority-${entry.name}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
               
               {/* Most Used Items Chart */}
               {topItemsData.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingCart className="text-blue-500" size={20} />
                            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">{t('stats.topItems', 'Most Added Items')}</h3>
                        </div>
                        <div className="h-[280px] w-full mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topItemsData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                    <XAxis type="number" hide />
                                    <YAxis 
                                        dataKey="name" 
                                        type="category" 
                                        width={100} 
                                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip 
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="space-y-3">
                            {topItemsData.map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                    </div>
                                    <div className="text-sm font-bold text-gray-500 dark:text-gray-400">
                                        {item.count} <span className="text-xs font-normal opacity-70">{t('history.used', 'used')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
               )}
            </div>

            <div className="pb-8"></div>
        </div>
    );
};
