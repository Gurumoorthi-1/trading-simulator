// Generates realistic-looking OHLCV (Open, High, Low, Close, Volume) data for the candlestick chart
export const generateCandlestickData = (basePrice = 150, days = 100) => {
  const data = [];
  const volumeData = [];
  let currentPrice = basePrice;
  
  // Start from 'days' ago
  const date = new Date();
  date.setDate(date.getDate() - days);

  for (let i = 0; i < days; i++) {
    // Generate random daily movement
    const volatility = currentPrice * 0.02; // 2% daily volatility
    const change = (Math.random() - 0.5) * volatility;
    
    // Calculate OHLC
    const open = currentPrice + (Math.random() - 0.5) * (volatility * 0.5);
    const close = open + change;
    
    const high = Math.max(open, close) + Math.random() * (volatility * 0.5);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.5);
    
    // Generate volume (higher volume on big price moves)
    const baseVolume = 1000000;
    const volumeMultiplier = 1 + Math.abs(change / currentPrice) * 50;
    const volume = Math.floor(baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4));

    // Format date as YYYY-MM-DD
    const timeString = date.toISOString().split('T')[0];

    data.push({
      time: timeString,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    volumeData.push({
      time: timeString,
      value: volume,
      color: close >= open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' // profit/loss colors with opacity
    });

    // Update current price for next iteration
    currentPrice = close;
    
    // Advance 1 day (skipping weekends for realism could be done, but simple is fine for demo)
    date.setDate(date.getDate() + 1);
  }

  return { candleData: data, volumeData };
};

// Generates random buy/sell markers for the chart
export const generateMarkers = (candleData) => {
  const markers = [];
  
  // Add a few random markers based on the data length
  const numMarkers = Math.floor(candleData.length / 15); // Roughly 1 marker per 15 days
  
  for(let i = 0; i < numMarkers; i++) {
    // Pick a random day, not too close to the edges
    const randomIndex = Math.floor(Math.random() * (candleData.length - 10)) + 5;
    const day = candleData[randomIndex];
    const isBuy = Math.random() > 0.5;
    
    markers.push({
      time: day.time,
      position: isBuy ? 'belowBar' : 'aboveBar',
      color: isBuy ? '#22c55e' : '#ef4444', // Tailwind profit/loss colors
      shape: isBuy ? 'arrowUp' : 'arrowDown',
      text: isBuy ? 'Buy Signal' : 'Sell Signal',
      size: 1.5
    });
  }
  
  // Sort markers chronologically
  return markers.sort((a, b) => new Date(a.time) - new Date(b.time));
};
