// Dummy data for the Portfolio page

export const portfolioStats = {
  totalValue: 142530.50,
  totalInvested: 98420.00,
  totalProfit: 44110.50,
  profitPercentage: 44.82,
  dayChange: 1240.20,
  dayChangePercentage: 0.88,
  cashBalance: 15469.50
};

export const holdingsData = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', shares: 150, avgPrice: 145.20, currentPrice: 178.72, change: 2.15, changePercent: 1.22 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', shares: 80, avgPrice: 280.50, currentPrice: 378.91, change: 4.52, changePercent: 1.21 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', shares: 45, avgPrice: 210.30, currentPrice: 495.22, change: 12.80, changePercent: 2.65 },
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', shares: 120, avgPrice: 135.40, currentPrice: 148.35, change: 1.20, changePercent: 0.82 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', shares: 100, avgPrice: 165.20, currentPrice: 156.82, change: 0.45, changePercent: 0.29 },
  { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', shares: 200, avgPrice: 85.50, currentPrice: 104.50, change: -2.30, changePercent: -2.15 },
  { symbol: 'AMZN', name: 'Amazon.com', sector: 'Consumer', shares: 90, avgPrice: 110.25, currentPrice: 178.25, change: 3.40, changePercent: 1.95 }
];

export const performanceData = [
  { date: 'Jan', value: 100000 },
  { date: 'Feb', value: 105400 },
  { date: 'Mar', value: 102100 },
  { date: 'Apr', value: 112500 },
  { date: 'May', value: 118200 },
  { date: 'Jun', value: 125400 },
  { date: 'Jul', value: 122800 },
  { date: 'Aug', value: 131500 },
  { date: 'Sep', value: 128900 },
  { date: 'Oct', value: 135200 },
  { date: 'Nov', value: 142530 }
];

export const allocationData = [
  { name: 'Technology', value: 75000, color: '#0ea5e9' }, // primary-500
  { name: 'Finance', value: 18000, color: '#8b5cf6' }, // purple-500
  { name: 'Consumer', value: 16000, color: '#f59e0b' }, // amber-500
  { name: 'Healthcare', value: 15000, color: '#ec4899' }, // pink-500
  { name: 'Energy', value: 20000, color: '#10b981' }  // emerald-500
];
