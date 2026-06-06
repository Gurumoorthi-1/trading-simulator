// Dummy AI Recommendations Data

export const marketSentiment = {
  score: 72,
  status: 'Bullish',
  summary: 'Market momentum is positive due to strong tech sector earnings and stabilizing interest rates. Volatility remains low, suggesting steady accumulation.',
  indicators: {
    volatility: 'Low',
    momentum: 'Strong',
    volume: 'Average'
  }
};

export const aiRecommendations = [
  {
    id: 1,
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    action: 'BUY',
    risk: 'High',
    confidence: 88,
    predictedMove: '+5.4%',
    reason: 'Unusual options activity detected. Earnings projected to beat estimates by 12% due to data center demand.',
    timeframe: 'Short-term (1-2 weeks)'
  },
  {
    id: 2,
    symbol: 'AAPL',
    name: 'Apple Inc.',
    action: 'HOLD',
    risk: 'Low',
    confidence: 65,
    predictedMove: '+0.8%',
    reason: 'Price action is consolidating near resistance. Supply chain metrics show normal volume.',
    timeframe: 'Medium-term (1-3 months)'
  },
  {
    id: 3,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    action: 'SELL',
    risk: 'High',
    confidence: 82,
    predictedMove: '-4.2%',
    reason: 'Sentiment analysis on EV market shows declining consumer interest. Technical breakdown below 50-day moving average.',
    timeframe: 'Short-term (1-2 weeks)'
  },
  {
    id: 4,
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    action: 'BUY',
    risk: 'Medium',
    confidence: 91,
    predictedMove: '+3.1%',
    reason: 'Cloud revenue growth accelerating faster than sector average. Strong institutional buying detected.',
    timeframe: 'Medium-term (1-3 months)'
  },
  {
    id: 5,
    symbol: 'XOM',
    name: 'Exxon Mobil',
    action: 'HOLD',
    risk: 'Medium',
    confidence: 54,
    predictedMove: '-1.5%',
    reason: 'Crude oil inventories rising. Sector rotation algorithms suggest capital is flowing out of energy.',
    timeframe: 'Short-term (1-2 weeks)'
  }
];

export const initialChatMessages = [
  { id: 1, sender: 'bot', text: 'Hello! I am TradeBot. I continuously analyze market data, sentiment, and technical indicators. How can I help you today?' }
];
