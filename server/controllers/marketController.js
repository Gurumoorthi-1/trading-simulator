export const getMarketMovers = async (req, res, next) => {
    try {
        // Top traded stocks list for simulation
        const universe = [
            'AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META',
            'NET', 'PLTR', 'AMD', 'SPY', 'QQQ', 'COIN', 'NFLX', 'DIS'
        ];

        // Generate random daily fluctuations for these stocks
        // Then sort to get gainers and losers.
        const moversData = universe.map(sym => {
            const startPrice = 50 + Math.random() * 400; // random price 50-450
            const changePercent = (Math.random() - 0.45) * 12; // -5.4% to +6.6% generally
            const price = startPrice * (1 + changePercent / 100);

            return {
                symbol: sym,
                name: sym === 'AAPL' ? 'Apple Inc.' : sym === 'TSLA' ? 'Tesla Inc.' : `${sym} Corp.`, // Simplified names
                price: parseFloat(price.toFixed(2)),
                change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
                isPositive: changePercent >= 0,
                volume: Math.floor(Math.random() * 50) + 'M',
                changeRaw: changePercent
            };
        });

        const gainers = moversData.filter(d => d.isPositive).sort((a, b) => b.changeRaw - a.changeRaw).slice(0, 5);
        const losers = moversData.filter(d => !d.isPositive).sort((a, b) => a.changeRaw - b.changeRaw).slice(0, 5);

        // Clean up changeRaw to not send to client
        gainers.forEach(g => delete g.changeRaw);
        losers.forEach(l => delete l.changeRaw);

        res.status(200).json({
            success: true,
            gainers,
            losers
        });
    } catch (error) {
        next(error);
    }
};
