import React, { useEffect, useState } from 'react';
import PortfolioStats from '../components/portfolio/PortfolioStats';
import AssetAllocation from '../components/portfolio/AssetAllocation';
import PerformanceChart from '../components/portfolio/PerformanceChart';
import HoldingsTable from '../components/portfolio/HoldingsTable';
import { useTradeStore, useWalletStore } from '../context/store';
import PageLoader from '../components/ui/PageLoader';

const Portfolio = () => {
  const { fetchPortfolio } = useTradeStore();
  const { fetchSummary } = useWalletStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPortfolio(),
        fetchSummary()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      {/* Page header */}
      <div className="mb-6 md:mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Portfolio Management</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Track your investments, analyze performance, and manage asset allocation.
          </p>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Top Stats */}
          <div className="mb-6">
            <PortfolioStats />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="lg:col-span-2">
              <PerformanceChart />
            </div>
            <div className="lg:col-span-1">
              <AssetAllocation />
            </div>
          </div>

          {/* Holdings Table */}
          <div className="mb-6">
            <HoldingsTable />
          </div>
        </>
      )}
    </div>
  );
};

export default Portfolio;
