import Groq from 'groq-sdk';

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in .env');
  }
  return new Groq({ apiKey });
};

export const getGroqResponse = async (messages, riskData = null) => {
  console.log('=== AI Service Started (Real Groq Chat) ===');
  try {
    const groq = getGroqClient();

    let systemInstruction = "You are an expert AI Trading Assistant for a stock trading simulation platform. Provide helpful, concise, and professional answers regarding the stock market, portfolio management, and trading. Never provide real financial advice. Format responses clearly.";
    if (riskData) {
      systemInstruction += `\n\nThe user's current portfolio context: ${JSON.stringify(riskData)}. Use this context if their question is related to their portfolio.`;
    }

    const formattedMessages = [{ role: 'system', content: systemInstruction }];

    // Ensure all messages have text and valid roles for Groq
    const cleanMessages = messages.filter(m => (m.role === 'user' || m.role === 'assistant') && m.content);

    cleanMessages.forEach(m => {
      formattedMessages.push({
        role: m.role,
        content: String(m.content)
      });
    });

    if (formattedMessages.length === 1) { // Only system message exists
      formattedMessages.push({ role: 'user', content: 'Hello' });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: "llama-3.3-70b-versatile", // Updated to supported Groq model
      temperature: 0.7,
    });

    return chatCompletion.choices[0]?.message?.content || "";

  } catch (error) {
    console.error('=== Full Error in Groq API ===', error);
    // Explicitly throw error so frontend receives real-time failure state instead of mock text
    throw new Error('AI Service is currently unavailable due to high API load or network issues.');
  }
};

export const getGroqSuggestions = async (portfolio) => {
  console.log('=== AI Service Started (Real Groq Suggestions) ===');
  try {
    const groq = getGroqClient();

    const jsonSchemaPrompt = `You are an expert quantitative financial analyst. 
You must respond in strictly valid JSON containing a single array called "suggestions".
Each object in the array must have EXACTLY these fields:
- "type": (Must be exactly one of: Buy, Sell, Hold, Rebalance, Review)
- "title": (Short, catchy title for the suggestion)
- "description": (Actionable description/reasoning based on portfolio data. Under 2 sentences.)
- "priority": (Must be exactly one of: High, Medium, Low)

Example JSON format:
{
  "suggestions": [
    { "type": "Buy", "title": "Example", "description": "Example desc", "priority": "High" }
  ]
}`;

    let prompt = '';

    // Pass everything to AI dynamically, even if the portfolio is empty
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
      prompt = `The user currently has no investments and an empty portfolio. Provide 3 welcoming, actionable insights on how to get started in the stock market (e.g. buying diversified ETFs, researching sectors).`;
    } else {
      prompt = `Analyze this portfolio and provide 3 to 4 actionable insights. 
Total Invested: ${portfolio.totalInvested}. 
Holdings: ${JSON.stringify(portfolio.holdings)}.
Focus on concentration risk, profit taking, or cutting losses based on market conditions. Keep descriptions concise and under 2 sentences.`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: jsonSchemaPrompt },
        { role: 'user', content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const rawContent = chatCompletion.choices[0]?.message?.content;
    let parsed = JSON.parse(rawContent);

    // Extract array if it returns an object containing 'suggestions'
    let suggestionsArray = [];
    if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
      suggestionsArray = parsed.suggestions;
    } else if (Array.isArray(parsed)) {
      suggestionsArray = parsed;
    } else {
      suggestionsArray = [parsed];
    }

    return suggestionsArray;

  } catch (error) {
    console.error('Groq Suggestions Error:', error);
    // Explicitly throw error to guarantee no mock fallbacks
    throw new Error('AI could not generate portfolio suggestions at this time.');
  }
};
