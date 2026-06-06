import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, ArrowDownToLine, ArrowUpFromLine, Activity } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { getCashFlow } from '../../utils/services';
import { useThemeStore } from '../../context/store';

const CashFlowAnalytics = ({ isLoading: initialLoading }) => {
    const [data, setData] = useState(null);
    const { theme } = useThemeStore();
    const isDark = theme === 'dark';

    useEffect(() => {
        const fetchCF = async () => {
            try {
                const res = await getCashFlow();
                setData(res.cashFlow);
            } catch (e) {
                console.error('Failed to get cash flow', e);
            }
        };
        if (!initialLoading) fetchCF();
    }, [initialLoading]);

    if (initialLoading || !data) {
        return (
            <div className="card h-full">
                <Skeleton className="h-6 w-40 mb-6" />
                <Skeleton className="h-[200px] w-full mb-6 rounded-full" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    // Values for Pie Chart
    const chartData = [
        { name: 'Total Deposits', value: data.totalDeposits, color: '#3b82f6', icon: <ArrowDownToLine size={16} /> },
        { name: 'Withdrawals', value: data.totalWithdrawals, color: '#ef4444', icon: <ArrowUpFromLine size={16} /> },
        { name: 'Stock Purchases', value: data.totalInvested, color: '#8b5cf6', icon: <Activity size={16} /> },
        { name: 'Stock Sales', value: data.totalRealized, color: '#22c55e', icon: <TrendingUp size={16} /> },
    ].filter(d => d.value > 0);

    const hasData = chartData.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card h-full flex flex-col"
        >
            <h3 className="text-lg font-bold text-light-text dark:text-white mb-6">Cash Flow Analytics</h3>

            {!hasData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <Activity size={40} className="mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-400">No cash flow activity</p>
                    <p className="text-xs">Deposit money or trade to see analytics</p>
                </div>
            ) : (
                <>
                    <div className="h-[220px] w-full relative mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={85}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `$${value.toLocaleString()}`}
                                    contentStyle={{
                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: isDark ? '#f8fafc' : '#1e293b', fontWeight: 'bold' }}
                                    labelStyle={{ color: isDark ? '#94a3b8' : '#64748b' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Label */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-slate-400 text-xs">Net Cash Flow</span>
                            <span className={`text-lg font-bold ${data.netCashFlow >= 0 ? 'text-profit' : 'text-loss'}`}>
                                {data.netCashFlow >= 0 ? '+' : ''}${Math.abs(data.netCashFlow).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {chartData.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: item.color }}>
                                        {item.icon}
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-light-text dark:text-white font-bold tracking-wide">${item.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export default CashFlowAnalytics;
