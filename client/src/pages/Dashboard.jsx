import React, { useState, useEffect } from 'react';
import { Wallet, PieChart, Activity, DollarSign } from 'lucide-react';

import StatCard from '../components/dashboard/StatCard';
import MarketOverview from '../components/dashboard/MarketOverview';
import TrendingStocks from '../components/dashboard/TrendingStocks';
import TransactionsTable from '../components/dashboard/TransactionsTable';
import Watchlist from '../components/dashboard/Watchlist';
import UserProfile from '../components/dashboard/UserProfile';
import ProfitLossChart from '../components/dashboard/ProfitLossChart';

import { useAuthStore, useTradeStore, useWalletStore } from '../context/store';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();
  const { holdings, fetchPortfolio, portfolio } = useTradeStore();
  const { summary, fetchSummary } = useWalletStore();

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      // Fetching in parallel for fast loading
      await Promise.all([fetchPortfolio(), fetchSummary()]);
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const balance = user?.balance ?? 0;
  const totalInvested = portfolio?.totalInvested ?? 0;
  const totalHoldings = holdings.length;

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Welcome back, {user?.name?.split(' ')[0] || 'Trader'}! Here's your portfolio overview.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <StatCard
          title="Total Balance"
          value={`$${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change="+Active"
          isPositive={true}
          icon={<Wallet size={20} />}
          isLoading={isLoading}
          delay={0}
        />
        <StatCard
          title="Total Invested"
          value={`$${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${totalHoldings} stocks`}
          isPositive={true}
          icon={<DollarSign size={20} />}
          isLoading={isLoading}
          delay={0.05}
        />
        <StatCard
          title="Total Deposits"
          value={`$${(summary?.stats?.totalDeposited ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={`${summary?.stats?.depositCount ?? 0} transactions`}
          isPositive={true}
          icon={<PieChart size={20} />}
          isLoading={isLoading}
          delay={0.1}
        />
        <StatCard
          title="Total Trades"
          value={`${summary?.stats?.tradeCount ?? 0}`}
          change={`$${(summary?.stats?.totalBought ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} bought`}
          isPositive={(summary?.stats?.totalSold ?? 0) >= (summary?.stats?.totalBought ?? 0)}
          icon={<Activity size={20} />}
          isLoading={isLoading}
          delay={0.15}
        />
      </div>

      {/* Charts + Trending Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2">
          <MarketOverview isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <TrendingStocks isLoading={isLoading} />
        </div>
      </div>

      {/* P&L + User Profile Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2">
          <ProfitLossChart isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <UserProfile isLoading={isLoading} />
        </div>
      </div>

      {/* Transactions + Watchlist Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <TransactionsTable isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1">
          <Watchlist isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
