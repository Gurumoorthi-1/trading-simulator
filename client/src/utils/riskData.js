// Risk Analysis Mock Data

export const portfolioRisk = {
  overallScore: 62, // 0-100, higher = riskier
  rating: 'Moderate',
  beta: 1.24,
  sharpeRatio: 1.85,
  maxDrawdown: -12.4,
  valueAtRisk: -3200, // 1-day 95% VaR
};

export const volatilityData = [
  { date: 'Mon', portfolio: 1.2, market: 0.9 },
  { date: 'Tue', portfolio: 1.8, market: 1.1 },
  { date: 'Wed', portfolio: 0.7, market: 0.8 },
  { date: 'Thu', portfolio: 2.4, market: 1.5 },
  { date: 'Fri', portfolio: 1.1, market: 1.0 },
  { date: 'Sat', portfolio: 0.5, market: 0.3 },
  { date: 'Sun', portfolio: 1.6, market: 1.2 },
];

export const diversificationData = [
  { sector: 'Technology', allocation: 52, risk: 'High', color: '#0ea5e9' },
  { sector: 'Finance', allocation: 15, risk: 'Medium', color: '#8b5cf6' },
  { sector: 'Consumer', allocation: 12, risk: 'Low', color: '#f59e0b' },
  { sector: 'Healthcare', allocation: 11, risk: 'Low', color: '#ec4899' },
  { sector: 'Energy', allocation: 10, risk: 'High', color: '#10b981' },
];

export const heatmapData = [
  { stock: 'AAPL', mon: 0.5, tue: -1.2, wed: 0.8, thu: 1.5, fri: -0.3 },
  { stock: 'MSFT', mon: 1.1, tue: 0.3, wed: -0.5, thu: 2.1, fri: 0.7 },
  { stock: 'NVDA', mon: -2.1, tue: 3.4, wed: 1.2, thu: -1.8, fri: 2.5 },
  { stock: 'TSLA', mon: 3.2, tue: -4.1, wed: 2.8, thu: -3.5, fri: 1.9 },
  { stock: 'JPM', mon: 0.3, tue: 0.8, wed: -0.2, thu: 0.5, fri: -0.7 },
  { stock: 'XOM', mon: -1.5, tue: 0.6, wed: -2.3, thu: 1.1, fri: -1.2 },
];

export const lossProbabilityData = [
  { range: '-15%+', probability: 2 },
  { range: '-10 to -15%', probability: 5 },
  { range: '-5 to -10%', probability: 12 },
  { range: '-2 to -5%', probability: 22 },
  { range: '0 to -2%', probability: 28 },
  { range: '0 to +2%', probability: 18 },
  { range: '+2 to +5%', probability: 8 },
  { range: '+5%+', probability: 5 },
];

export const aiRiskInsights = [
  {
    id: 1,
    severity: 'high',
    title: 'Over-concentrated in Technology',
    message: 'Your portfolio has 52% allocation in the Technology sector. A sector downturn could result in significant losses. Consider diversifying into defensive sectors like Utilities or Consumer Staples.',
  },
  {
    id: 2,
    severity: 'medium',
    title: 'High Beta Exposure',
    message: 'Portfolio beta of 1.24 means your portfolio is 24% more volatile than the market. During corrections, you may experience amplified losses.',
  },
  {
    id: 3,
    severity: 'low',
    title: 'Sharpe Ratio Above Average',
    message: 'Your risk-adjusted returns (Sharpe: 1.85) are performing well above the market average of 1.0. Your current strategy efficiently compensates for the risk taken.',
  },
  {
    id: 4,
    severity: 'medium',
    title: 'TSLA Volatility Warning',
    message: 'TSLA has a daily volatility of 3.5%, significantly higher than the portfolio average. Consider reducing position size or adding a stop-loss order.',
  },
];
