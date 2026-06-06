// Dummy stock data for the market page simulation
export const allStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.15, changePercent: 1.22, sector: 'Technology', volume: '52.3M', marketCap: '2.81T', pe: 29.4, high52: 199.62, low52: 124.17, sparkline: [170, 172, 168, 174, 171, 175, 178] },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.52, changePercent: 1.21, sector: 'Technology', volume: '21.1M', marketCap: '2.81T', pe: 35.2, high52: 384.30, low52: 245.61, sparkline: [365, 370, 368, 372, 374, 376, 378] },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.95, changePercent: -0.67, sector: 'Technology', volume: '18.7M', marketCap: '1.77T', pe: 25.1, high52: 153.78, low52: 102.21, sparkline: [145, 143, 144, 142, 140, 141, 141] },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.40, changePercent: 1.95, sector: 'Consumer', volume: '45.6M', marketCap: '1.84T', pe: 62.3, high52: 189.77, low52: 118.35, sparkline: [168, 170, 172, 175, 174, 176, 178] },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 238.45, change: -8.12, changePercent: -3.29, sector: 'Automotive', volume: '98.2M', marketCap: '757B', pe: 72.1, high52: 299.29, low52: 152.37, sparkline: [252, 248, 245, 242, 240, 239, 238] },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.80, changePercent: 2.65, sector: 'Technology', volume: '38.4M', marketCap: '1.22T', pe: 64.8, high52: 502.66, low52: 108.13, sparkline: [470, 475, 480, 485, 488, 492, 495] },
  { symbol: 'META', name: 'Meta Platforms', price: 326.49, change: 5.67, changePercent: 1.77, sector: 'Technology', volume: '14.2M', marketCap: '838B', pe: 28.9, high52: 340.54, low52: 198.05, sparkline: [315, 318, 320, 322, 324, 325, 326] },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 148.35, change: 1.20, changePercent: 0.82, sector: 'Finance', volume: '8.9M', marketCap: '428B', pe: 10.2, high52: 157.34, low52: 123.17, sparkline: [145, 146, 147, 146, 147, 148, 148] },
  { symbol: 'V', name: 'Visa Inc.', price: 252.10, change: -1.85, changePercent: -0.73, sector: 'Finance', volume: '5.4M', marketCap: '518B', pe: 30.5, high52: 261.46, low52: 218.73, sparkline: [256, 255, 254, 253, 252, 253, 252] },
  { symbol: 'JNJ', name: 'Johnson & Johnson', price: 156.82, change: 0.45, changePercent: 0.29, sector: 'Healthcare', volume: '6.1M', marketCap: '378B', pe: 15.8, high52: 175.97, low52: 150.26, sparkline: [155, 156, 155, 156, 156, 157, 156] },
  { symbol: 'UNH', name: 'UnitedHealth Group', price: 524.30, change: -6.20, changePercent: -1.17, sector: 'Healthcare', volume: '3.2M', marketCap: '488B', pe: 22.4, high52: 558.10, low52: 445.68, sparkline: [535, 532, 530, 528, 526, 525, 524] },
  { symbol: 'PG', name: 'Procter & Gamble', price: 152.45, change: 0.80, changePercent: 0.53, sector: 'Consumer', volume: '4.8M', marketCap: '358B', pe: 25.1, high52: 165.35, low52: 141.45, sparkline: [150, 151, 151, 152, 151, 152, 152] },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', price: 104.50, change: -2.30, changePercent: -2.15, sector: 'Energy', volume: '12.5M', marketCap: '416B', pe: 9.8, high52: 120.70, low52: 95.77, sparkline: [110, 108, 107, 106, 105, 105, 104] },
  { symbol: 'CVX', name: 'Chevron Corp.', price: 148.90, change: -1.65, changePercent: -1.10, sector: 'Energy', volume: '7.3M', marketCap: '282B', pe: 10.5, high52: 189.68, low52: 140.95, sparkline: [153, 152, 151, 150, 149, 149, 148] },
  { symbol: 'KO', name: 'Coca-Cola Co.', price: 57.82, change: 0.32, changePercent: 0.56, sector: 'Consumer', volume: '9.1M', marketCap: '250B', pe: 23.7, high52: 64.99, low52: 51.55, sparkline: [57, 57, 57, 58, 57, 58, 57] },
  { symbol: 'DIS', name: 'Walt Disney Co.', price: 85.40, change: 1.95, changePercent: 2.34, sector: 'Entertainment', volume: '11.8M', marketCap: '156B', pe: 68.2, high52: 123.74, low52: 78.73, sparkline: [80, 81, 82, 83, 84, 84, 85] },
];

export const marketIndices = [
  { name: 'S&P 500', value: '4,515.77', change: '+0.84%', isPositive: true },
  { name: 'NASDAQ', value: '14,281.76', change: '+1.12%', isPositive: true },
  { name: 'DOW JONES', value: '34,945.47', change: '-0.22%', isPositive: false },
  { name: 'RUSSELL 2000', value: '1,782.55', change: '+0.54%', isPositive: true },
];

export const sectors = ['All', 'Technology', 'Finance', 'Healthcare', 'Consumer', 'Energy', 'Automotive', 'Entertainment'];
