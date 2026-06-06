import Portfolio from '../models/Portfolio.js';
import AIEvent from '../models/AIEvent.js';
import User from '../models/User.js';
import { getGroqResponse, getGroqSuggestions } from '../utils/aiService.js';

export const getAiSuggestions = async (req, res, next) => {
    const startTime = Date.now();
    try {
        const portfolio = await Portfolio.findOne({ user: req.user._id });
        const user = await User.findById(req.user._id);

        if (!portfolio || portfolio.holdings.length === 0) {
            // Log AI event
            await AIEvent.create({
                user: req.user._id,
                type: 'portfolio-analysis',
                query: 'Get AI suggestions',
                responseTime: Date.now() - startTime,
                success: true
            });

            // Emit event to admin dashboard
            const adminNamespace = req.app.get('adminNamespace');
            if (adminNamespace) {
                adminNamespace.emit('newAIEvent', {
                    userId: user._id,
                    userName: user.name,
                    type: 'portfolio-analysis',
                    query: 'Get AI suggestions',
                    responseTime: Date.now() - startTime,
                    success: true,
                    timestamp: new Date()
                });
                adminNamespace.emit('statsUpdate');
            }

            return res.status(200).json({
                success: true,
                suggestions: [
                    {
                        type: 'Buy',
                        title: 'Start Building Your Portfolio',
                        description: 'You currently hold no stocks. Consider buying stable ETFs like SPY or QQQ to start.',
                        priority: 'High'
                    }
                ]
            });
        }

        const suggestions = await getGroqSuggestions(portfolio);

        if (!suggestions || suggestions.length === 0) {
            throw new Error('AI could not generate suggestions at this time. Please check API quota or try again later.');
        }

        // Log AI event
        await AIEvent.create({
            user: req.user._id,
            type: 'portfolio-analysis',
            query: 'Get AI suggestions',
            responseTime: Date.now() - startTime,
            success: true
        });

        // Emit event to admin dashboard
        const adminNamespace = req.app.get('adminNamespace');
        if (adminNamespace) {
            adminNamespace.emit('newAIEvent', {
                userId: user._id,
                userName: user.name,
                type: 'portfolio-analysis',
                query: 'Get AI suggestions',
                responseTime: Date.now() - startTime,
                success: true,
                timestamp: new Date()
            });
            adminNamespace.emit('statsUpdate');
        }

        res.status(200).json({
            success: true,
            suggestions: suggestions.slice(0, 4) // Return max 4 AI suggestions
        });
    } catch (error) {
        const user = await User.findById(req.user._id);
        
        // Log failed AI event
        await AIEvent.create({
            user: req.user._id,
            type: 'portfolio-analysis',
            query: 'Get AI suggestions',
            responseTime: Date.now() - startTime,
            success: false
        });
        
        // Emit failed event to admin
        const adminNamespace = req.app.get('adminNamespace');
        if (adminNamespace) {
            adminNamespace.emit('newAIEvent', {
                userId: req.user._id,
                userName: user?.name || 'Unknown',
                type: 'portfolio-analysis',
                query: 'Get AI suggestions',
                responseTime: Date.now() - startTime,
                success: false,
                error: error.message,
                timestamp: new Date()
            });
        }
        
        next(error);
    }
};

export const getRiskChatResponse = async (req, res, next) => {
    const startTime = Date.now();
    try {
        const { messages, riskData } = req.body;
        const user = await User.findById(req.user._id);

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                message: 'Messages array is required.'
            });
        }

        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        const query = lastUserMessage ? lastUserMessage.content : 'Risk chat query';

        const responseContent = await getGroqResponse(messages, riskData);

        // Log AI event
        await AIEvent.create({
            user: req.user._id,
            type: 'risk-assessment',
            query,
            responseTime: Date.now() - startTime,
            success: true
        });

        // Emit event to admin dashboard
        const adminNamespace = req.app.get('adminNamespace');
        if (adminNamespace) {
            adminNamespace.emit('newAIEvent', {
                userId: user._id,
                userName: user.name,
                type: 'risk-assessment',
                query,
                responseTime: Date.now() - startTime,
                success: true,
                timestamp: new Date()
            });
            adminNamespace.emit('statsUpdate');
        }

        res.status(200).json({
            success: true,
            message: responseContent
        });
    } catch (error) {
        const user = await User.findById(req.user._id);
        
        // Log failed AI event
        await AIEvent.create({
            user: req.user._id,
            type: 'risk-assessment',
            query: 'Risk chat query',
            responseTime: Date.now() - startTime,
            success: false
        });
        
        // Emit failed event to admin
        const adminNamespace = req.app.get('adminNamespace');
        if (adminNamespace) {
            adminNamespace.emit('newAIEvent', {
                userId: req.user._id,
                userName: user?.name || 'Unknown',
                type: 'risk-assessment',
                query: 'Risk chat query',
                responseTime: Date.now() - startTime,
                success: false,
                error: error.message,
                timestamp: new Date()
            });
        }
        
        next(error);
    }
};
