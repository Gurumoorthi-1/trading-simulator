import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '../ui/Skeleton';
import { getPortfolioGrowth } from '../../utils/services';

const timeframes = ['1M', '3M', '6M', '1Y', 'ALL'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-card border border-dark-border p-3 rounded-lg shadow-xl">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="font-bold text-white text-lg">${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
        );
    }
    return null;
};

const PortfolioGrowth = ({ isLoading: initialLoading }) => {
    const [activeRange, setActiveRange] = useState('1M');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentWorth, setCurrentWorth] = useState(0);

    useEffect(() => {
        const fetchGrowth = async () => {
            setLoading(true);
            try {
                const res = await getPortfolioGrowth(activeRange);
                setChartData(res.growth || []);
                setCurrentWorth(res.currentWorth || 0);
            } catch (error) {
                console.error('Failed to get portfolio growth data', error);
            } finally {
                setLoading(false);
            }
        };
        if (!initialLoading) fetchGrowth();
    }, [activeRange, initialLoading]);

    const startVal = chartData[0]?.value || 0;
    const absoluteChange = currentWorth - startVal;
    const percentageChange = startVal === 0 ? 0 : (absoluteChange / startVal) * 100;
    const isPositive = absoluteChange >= 0;

    if (initialLoading || (!chartData.length && loading)) {
        return (
            <div className="card h-full">
                <div className="flex justify-between items-center mb-6">
                    <Skeleton className="h-6 w-32" />
                    <div className="flex gap-1">
                        <Skeleton className="h-6 w-10 rounded" />
                        <Skeleton className="h-6 w-10 rounded" />
                        <Skeleton className="h-6 w-10 rounded" />
                    </div>
                </div>
                <Skeleton className="h-8 w-40 mb-2" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="card h-full flex flex-col"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Portfolio Growth</h3>
                <div className="flex gap-1 bg-dark-bg p-1 rounded-lg">
                    {timeframes.map((tf) => (
                        <button
                            key={tf}
                            onClick={() => setActiveRange(tf)}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${activeRange === tf
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'text-slate-400 hover:text-white hover:bg-dark-card'
                                }`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6 relative">
                {loading && (
                    <div className="absolute top-0 right-0 flex items-center justify-center p-2 z-10">
                        <div className="w-4 h-4 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                )}
                <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-bold text-white">
                        ${currentWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}{percentageChange.toFixed(2)}%
                    </span>
                    <span className="text-slate-500 text-xs font-medium bg-dark-bg px-2 py-0.5 rounded-full">
                        Past {activeRange}
                    </span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[140px] -ml-2">
                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorValueWallet" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={isPositive ? '#8b5cf6' : '#ef4444'} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={isPositive ? '#8b5cf6' : '#ef4444'} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={isPositive ? '#8b5cf6' : '#ef4444'}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorValueWallet)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default PortfolioGrowth;
