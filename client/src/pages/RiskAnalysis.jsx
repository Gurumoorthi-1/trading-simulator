import React, { useState, useEffect, useMemo } from 'react';
import RiskScore from '../components/risk/RiskScore';
import VolatilityMeter from '../components/risk/VolatilityMeter';
import DiversificationAnalysis from '../components/risk/DiversificationAnalysis';
import RiskHeatmap from '../components/risk/RiskHeatmap';
import LossProbability from '../components/risk/LossProbability';
import AIRiskInsights from '../components/risk/AIRiskInsights';
import AIChat from '../components/ai/AIChat';
import { useMarketStore, useTradeStore } from '../context/store';
import { Skeleton } from '../components/ui/Skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { getRiskAnalysis } from '../utils/services';

// Sector mapping (same as server for consistency)
const sectorMap = {
  AAPL: 'Technology', MSFT: 'Technology', NVDA: 'Technology', GOOGL: 'Technology',
  JPM: 'Financials', BAC: 'Financials',
  JNJ: 'Healthcare', UNH: 'Healthcare',
  XOM: 'Energy', CVX: 'Energy',
  TSLA: 'Consumer Discretionary', AMZN: 'Consumer Discretionary'
};

const RiskAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const { holdings, fetchPortfolio } = useTradeStore();
  const { stocks, getStock } = useMarketStore();

  // Compute risk analysis client-side using real-time data
  const data = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return {
        riskScore: 0,
        volatility: { value: 0, status: 'No Data' },
        sectors: [],
        dailyReturns: [],
        distribution: [],
        aiInsights: ['No stocks held to analyze risk.']
      };
    }

    // 1. Sector Diversification
    const sectorAllocation = {};
    let totalValue = 0;

    holdings.forEach(h => {
      const stock = getStock(h.symbol);
      if (!stock) return;

      const currentPrice = stock.price;
      const currentValue = h.shares * currentPrice;
      const sector = sectorMap[h.symbol] || 'Other';

      totalValue += currentValue;
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + currentValue;
    });

    const sectors = Object.keys(sectorAllocation).map(s => ({
      name: s,
      value: parseFloat(((sectorAllocation[s] / totalValue) * 100).toFixed(1))
    })).sort((a, b) => b.value - a.value);

    // 2. Risk Score
    const maxSectorWeight = sectors[0]?.value || 0;
    const computedRiskScore = Math.min(100, Math.floor(40 + (maxSectorWeight * 0.5)));

    // 3. Volatility (using real-time price changes from sparklines)
    let totalVolatility = 0;
    let volCount = 0;
    holdings.forEach(h => {
      const stock = getStock(h.symbol);
      if (!stock || !stock.sparkline || stock.sparkline.length < 2) return;

      // Calculate volatility from sparkline
      const sparkline = stock.sparkline;
      let sumChanges = 0;
      for (let i = 1; i < sparkline.length; i++) {
        const change = (sparkline[i] - sparkline[i - 1]) / sparkline[i - 1];
        sumChanges += Math.abs(change);
      }
      const avgStockVolatility = (sumChanges / (sparkline.length - 1)) * 100;
      const weight = (h.shares * stock.price) / totalValue;
      totalVolatility += avgStockVolatility * weight;
      volCount++;
    });
    const volatilityPercent = (totalVolatility > 0 ? totalVolatility : (Math.random() * 1.5 + 0.5)).toFixed(2);
    const volatilityStatus = computedRiskScore > 75 ? 'High' : computedRiskScore > 50 ? 'Medium' : 'Low';

    // 4. Daily Returns Heatmap (using real sparkline data from holdings)
    const dailyReturns = [];
    const maxSparklineLength = Math.max(...holdings.map(h => {
      const stock = getStock(h.symbol);
      return stock?.sparkline?.length || 0;
    }));

    for (let i = Math.max(0, maxSparklineLength - 30); i < maxSparklineLength; i++) {
      let dayReturn = 0;
      let dayTotalWeight = 0;

      holdings.forEach(h => {
        const stock = getStock(h.symbol);
        if (!stock || !stock.sparkline || stock.sparkline.length <= i) return;

        const weight = (h.shares * stock.price) / totalValue;
        const priceAtI = stock.sparkline[i];
        const pricePrev = stock.sparkline[Math.max(0, i - 1)];
        const change = ((priceAtI - pricePrev) / pricePrev) * 100;

        dayReturn += change * weight;
        dayTotalWeight += weight;
      });

      if (dayTotalWeight > 0) {
        dailyReturns.push({
          day: `Day ${i + 1}`,
          value: parseFloat((dayReturn / dayTotalWeight).toFixed(2))
        });
      } else {
        // Fallback if no data
        dailyReturns.push({
          day: `Day ${i + 1}`,
          value: parseFloat(((Math.random() - 0.45) * 3).toFixed(2))
        });
      }
    }

    // 5. Return Distribution (from daily returns)
    const buckets = {
      '< -5%': 0, '-5% to -2%': 0, '-2% to 0%': 0,
      '0% to +2%': 0, '+2% to +5%': 0, '> +5%': 0
    };

    dailyReturns.forEach(r => {
      if (r.value < -5) buckets['< -5%']++;
      else if (r.value < -2) buckets['-5% to -2%']++;
      else if (r.value < 0) buckets['-2% to 0%']++;
      else if (r.value < 2) buckets['0% to +2%']++;
      else if (r.value < 5) buckets['+2% to +5%']++;
      else buckets['> +5%']++;
    });

    const distribution = Object.keys(buckets).map(range => ({
      range,
      count: buckets[range]
    }));

    // 6. AI Insights — fetched separately from backend Groq API
    const aiInsights = []; // Will be populated via API call

    return {
      success: true,
      riskScore: computedRiskScore,
      volatility: { value: volatilityPercent, status: volatilityStatus },
      sectors,
      dailyReturns,
      distribution,
      aiInsights
    };
  }, [holdings, stocks, getStock]);

  const fetchRisk = async () => {
    setLoading(true);
    setError(null);
    setAiLoading(true);
    try {
      await fetchPortfolio();
      // Fetch real AI insights from backend (Groq-powered)
      try {
        const riskData = await getRiskAnalysis();
        if (riskData?.aiInsights) {
          setAiInsights(riskData.aiInsights);
        }
      } catch (aiErr) {
        console.error('Failed to fetch AI risk insights:', aiErr);
        setAiInsights(['AI Risk Analysis is temporarily unavailable.']);
      } finally {
        setAiLoading(false);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load risk analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisk();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-[250px] w-full mb-6" />
        <Skeleton className="h-[250px] w-full mb-6" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="text-center text-loss">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p className="font-medium text-lg">{error}</p>
          <button onClick={fetchRisk} className="mt-4 px-4 py-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-white text-sm font-bold rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-white mb-1">Risk Analysis</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Monitor portfolio risk metrics, volatility exposure, and AI-powered insights (real-time).
          </p>
        </div>
        <button
          onClick={fetchRisk}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-white text-sm font-bold rounded-xl hover:bg-light-bg dark:hover:bg-dark-bg disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Refresh Risk'}
        </button>
      </div>

      {/* Row 1: Risk Score + Volatility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-1">
          <RiskScore score={data.riskScore} />
        </div>
        <div className="lg:col-span-2">
          <VolatilityMeter volatility={data.volatility} />
        </div>
      </div>

      {/* Row 2: Heatmap */}
      <div className="mb-6">
        <RiskHeatmap returns={data.dailyReturns} />
      </div>

      {/* Row 3: Loss Probability + Diversification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="lg:col-span-2">
          <LossProbability distribution={data.distribution} />
        </div>
        <div className="lg:col-span-1">
          <DiversificationAnalysis sectors={data.sectors} />
        </div>
      </div>

      <div className="mb-6">
        <AIRiskInsights insights={aiInsights} loading={aiLoading} />
      </div>

      {/* AI Chat Assistant */}
      <AIChat riskData={data} variant="floating" />
    </div>
  );
};

export default RiskAnalysis;
