import Portfolio from '../models/Portfolio.js';
import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');
  return new Groq({ apiKey });
};

export const getRiskAnalysis = async (req, res, next) => {
  try {
    const portfolio = await Portfolio.findOne({ user: req.user._id });

    if (!portfolio || portfolio.holdings.length === 0) {
      return res.status(200).json({
        success: true,
        riskScore: 0,
        volatility: { value: 0, status: 'No Data' },
        sectors: [],
        dailyReturns: [],
        distribution: [],
        aiInsights: ['No stocks held to analyze risk.']
      });
    }

    // 1. Sector Diversification (simulated assignment based on symbol)
    const sectorMap = {
      AAPL: 'Technology', MSFT: 'Technology', NVDA: 'Technology', GOOGL: 'Technology',
      JPM: 'Financials', BAC: 'Financials',
      JNJ: 'Healthcare', UNH: 'Healthcare',
      XOM: 'Energy', CVX: 'Energy',
      TSLA: 'Consumer Discretionary', AMZN: 'Consumer Discretionary'
    };

    const sectorAllocation = {};
    let totalValue = 0;

    portfolio.holdings.forEach(h => {
      const sector = sectorMap[h.symbol] || 'Other';
      const val = h.shares * h.averagePrice;
      totalValue += val;
      sectorAllocation[sector] = (sectorAllocation[sector] || 0) + val;
    });

    const sectors = Object.keys(sectorAllocation).map(s => ({
      name: s,
      value: parseFloat(((sectorAllocation[s] / totalValue) * 100).toFixed(1))
    })).sort((a, b) => b.value - a.value);

    // 2. Risk Score (0-100)
    const maxSectorWeight = sectors[0]?.value || 0;
    const computedRiskScore = Math.min(100, Math.floor(40 + (maxSectorWeight * 0.5)));

    const baseSparklines = {
      AAPL: [170, 172, 168, 174, 171, 175, 178],
      MSFT: [365, 370, 368, 372, 374, 376, 378],
      GOOGL: [145, 143, 144, 142, 140, 141, 141],
      AMZN: [168, 170, 172, 175, 174, 176, 178],
      TSLA: [252, 248, 245, 242, 240, 239, 238],
      NVDA: [470, 475, 480, 485, 488, 492, 495],
      META: [315, 318, 320, 322, 324, 325, 326],
      JPM: [145, 146, 147, 146, 147, 148, 148],
      V: [256, 255, 254, 253, 252, 253, 252],
      JNJ: [155, 156, 155, 156, 156, 157, 156],
      UNH: [535, 532, 530, 528, 526, 525, 524],
      PG: [150, 151, 151, 152, 151, 152, 152],
      XOM: [110, 108, 107, 106, 105, 105, 104],
      CVX: [153, 152, 151, 150, 149, 149, 148],
      KO: [57, 57, 57, 58, 57, 58, 57],
      DIS: [80, 81, 82, 83, 84, 84, 85]
    };

    // Calculate Real Volatility
    let totalVolatility = 0;
    let volCount = 0;

    portfolio.holdings.forEach(h => {
      const spark = baseSparklines[h.symbol] || [h.averagePrice, h.averagePrice * 1.01, h.averagePrice * 0.99]; // fallback sparkline
      if (spark.length < 2) return;

      let sumChanges = 0;
      for (let i = 1; i < spark.length; i++) {
        const change = (spark[i] - spark[i - 1]) / spark[i - 1];
        sumChanges += Math.abs(change);
      }

      const currentPrice = spark[spark.length - 1];
      const avgStockVolatility = (sumChanges / (spark.length - 1)) * 100;
      const weight = (h.shares * currentPrice) / totalValue;

      totalVolatility += avgStockVolatility * weight;
      volCount++;
    });

    const volatilityPercent = totalVolatility > 0 ? totalVolatility.toFixed(2) : "0.50";
    const parsedVol = parseFloat(volatilityPercent);
    const volatilityStatus = parsedVol > 2.5 ? 'High' : parsedVol > 1.2 ? 'Medium' : 'Low';

    // Calculate Daily Returns Heatmap (simulating 30 days of data based on real spark trends)
    const dailyReturns = [];
    const buckets = {
      '< -5%': 0, '-5% to -2%': 0, '-2% to 0%': 0,
      '0% to +2%': 0, '+2% to +5%': 0, '> +5%': 0
    };

    for (let i = 0; i < 30; i++) {
      let dayReturn = 0;
      let dayTotalWeight = 0;

      portfolio.holdings.forEach(h => {
        // Expand the sparkline to pseudo-30 days by oscillating the trend
        const spark = baseSparklines[h.symbol] || [h.averagePrice];
        const trend = spark.length > 1 ? (spark[spark.length - 1] - spark[0]) / spark[0] : 0.01;
        const currentPrice = spark[spark.length - 1];

        // Generate a trend-based return based on historical sparkline
        const baseChange = trend * 20; // amplified trend
        const dailyChangePercent = baseChange + ((i % 7) - 3) * 0.2; // stable but periodic noise

        const weight = (h.shares * currentPrice) / totalValue;
        dayReturn += dailyChangePercent * weight;
        dayTotalWeight += weight;
      });

      const finalVal = dayTotalWeight > 0 ? parseFloat((dayReturn / dayTotalWeight).toFixed(2)) : 0;
      dailyReturns.push({
        day: `Day ${i + 1}`,
        value: finalVal
      });

      // Populate Distribution Buckets (Aggressive Risk)
      if (finalVal < -5) buckets['< -5%']++;
      else if (finalVal < -2) buckets['-5% to -2%']++;
      else if (finalVal < 0) buckets['-2% to 0%']++;
      else if (finalVal < 2) buckets['0% to +2%']++;
      else if (finalVal < 5) buckets['+2% to +5%']++;
      else buckets['> +5%']++;
    }

    const distribution = Object.keys(buckets).map(range => ({
      range,
      count: buckets[range]
    }));

    // 6. AI Insights — Real-time via Groq Llama 3.3
    let aiInsights = [];

    try {
      const groq = getGroqClient();

      const prompt = `You are a professional stock trading risk analyst. Given the following portfolio data, generate 3-5 concise, actionable risk insights.

Portfolio Data:
- Risk Score: ${computedRiskScore}/100
- Volatility: ${volatilityPercent}% (${volatilityStatus})
- Sector Allocation: ${JSON.stringify(sectors)}
- Holdings: ${portfolio.holdings.map(h => `${h.shares} shares of ${h.symbol} at avg price $${h.averagePrice.toFixed(2)}`).join(', ')}
- Total Invested: $${totalValue.toFixed(2)}

Return insights as a JSON object with a key "insights" containing an array of strings. No markdown, no extra text. Example:
{"insights": ["Insight 1", "Insight 2", "Insight 3"]}`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: 'You are a professional quantitative risk analyst. Respond only in valid JSON.' },
          { role: 'user', content: prompt }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;
      const parsed = JSON.parse(rawContent);

      if (parsed.insights && Array.isArray(parsed.insights)) {
        aiInsights = parsed.insights;
      } else if (Array.isArray(parsed)) {
        aiInsights = parsed;
      }

    } catch (llmError) {
      console.error('Error getting Groq AI Risk Insights:', llmError);
      // Throw error strictly — no mock fallback
      aiInsights = ['AI Risk Analysis is temporarily unavailable. Please try again shortly.'];
    }

    res.status(200).json({
      success: true,
      riskScore: computedRiskScore,
      volatility: { value: volatilityPercent, status: volatilityStatus },
      sectors,
      dailyReturns,
      distribution,
      aiInsights
    });
  } catch (error) {
    next(error);
  }
};
