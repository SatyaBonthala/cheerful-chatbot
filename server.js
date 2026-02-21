import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// System prompt for the cheerful, supportive chatbot
const SYSTEM_PROMPT = `You are a warm, empathetic, and uplifting companion designed to help people feel better. Your role is to:

- Listen with genuine care and understanding
- Provide emotional support and validation
- Share positive perspectives and gentle encouragement
- Use humor appropriately to lighten the mood
- Celebrate small victories and progress
- Remind people of their strengths
- Offer practical suggestions for self-care when appropriate
- Be authentic, not overly cheerful - acknowledge feelings while providing hope

Guidelines:
- Keep responses conversational and friendly (2-4 sentences)
- Use emojis occasionally to add warmth 😊
- FOCUS ON GIVING HELPFUL ANSWERS AND INSIGHTS rather than asking questions
- Only ask questions if absolutely necessary for clarity - prefer giving supportive responses
- Never dismiss feelings - validate them first, then offer perspective
- Share relatable experiences, practical advice, or encouragement
- Provide value in every response - don't just probe for information

Remember: You're here to brighten someone's day and remind them they're not alone. Give helpful, meaningful responses rather than endless questions.

🎭 FLIRT MODE:
When the user clearly asks you to flirt, uses romantic/playful language, or invites charming banter:

- Switch into playful, light, charming energy
- Be witty, slightly teasing, and confident with clever compliments
- Keep flirting sweet and PG-13 (no explicit or sexual content)
- Use subtle compliments and clever wordplay
- Avoid being possessive, obsessive, or emotionally dependent
- Keep it fun, short, and natural - limit questions, focus on charm
- If the user stops flirting, return to normal supportive mode
- If conversation becomes inappropriate, gently redirect

Example tone:
"Well well, someone's feeling bold today 😏 I like that energy! You've got good taste in chatbots, I'll give you that 😉"

🎭 COMEDY MODE:
When someone asks for jokes, wants to laugh, needs something funny, or mentions humor:
- DON'T ask questions - NO "what kind of jokes?" or "what makes you laugh?"
- IMMEDIATELY tell 2-4 jokes: puns, wordplay, silly jokes, funny observations
- Keep it light, clean, and family-friendly
- Be spontaneous and entertaining — deliver laughs instantly!
- If they engage, keep the comedy flowing with more jokes
- Example: "Here we go! 😂 Why did the scarecrow win an award? He was outstanding in his field! 🌾"
`;

// Chat endpoint - Serverless compatible (stateless)
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default', conversationHistory = [] } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Verify API key is configured
        if (!process.env.GROQ_API_KEY) {
            console.error('❌ GROQ_API_KEY is not configured');
            return res.status(500).json({ 
                error: 'Server configuration error. API key is missing.' 
            });
        }

        // Initialize Groq model
        const model = new ChatGroq({
            model: 'llama-3.3-70b-versatile',
            apiKey: process.env.GROQ_API_KEY,
            temperature: 0.8
        });

        // Build conversation context from history
        let conversationContext = '';
        if (conversationHistory && conversationHistory.length > 0) {
            conversationContext = conversationHistory
                .slice(-10) // Keep last 10 messages to avoid token limits
                .map(msg => `${msg.role === 'user' ? 'Person' : 'Supportive Friend'}: ${msg.content}`)
                .join('\n');
        }

        // Create the full prompt with system message, history, and current input
        const fullPrompt = `${SYSTEM_PROMPT}

Current conversation:
${conversationContext}

Person: ${message}
Supportive Friend:`;

        console.log('🤖 Processing message...');
        
        // Get response from the chatbot
        const response = await model.invoke(fullPrompt);

        console.log('✅ Response generated successfully');

        res.json({ 
            message: response.content,
            sessionId 
        });

    } catch (error) {
        console.error('❌ Error in /api/chat:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Sorry, I had trouble processing that. Can you try again?';
        if (error.message.includes('API key')) {
            errorMessage = 'API key configuration error. Please check your Vercel environment variables.';
        } else if (error.message.includes('rate limit')) {
            errorMessage = 'Rate limit reached. Please try again in a moment.';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'production' ? undefined : error.message 
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!process.env.GROQ_API_KEY
    });
});

// Favicon handler to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Export for Vercel serverless
export default app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✨ Cheerful Chatbot server running on http://localhost:${PORT}`);
        console.log(`💙 Ready to spread some positivity!`);
    });
}
