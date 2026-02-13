import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import { BufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';
import { PromptTemplate } from '@langchain/core/prompts';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store conversations per session
const conversations = new Map();

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

// Initialize model and conversation chain for a session
function createConversation() {
    const model = new ChatGroq({
        model: 'llama-3.3-70b-versatile',
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0.8 // Higher temperature for more creative, warm responses
    });

    const memory = new BufferMemory({
        returnMessages: true,
        memoryKey: 'chat_history',
        inputKey: 'input'
    });

    const prompt = PromptTemplate.fromTemplate(`
        {system_message}
        
        Current conversation:
        {chat_history}
        
        Person: {input}
        Supportive Friend: `);

    const chain = new ConversationChain({
        llm: model,
        memory: memory,
        prompt,
        inputKeys: ['input', 'system_message']
    });

    return { chain, memory };
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation for this session
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, createConversation());
        }

        const { chain } = conversations.get(sessionId);

        // Get response from the chatbot
        const response = await chain.call({
            input: message,
            system_message: SYSTEM_PROMPT
        });

        res.json({ 
            message: response.response,
            sessionId 
        });

    } catch (error) {
        console.error('Error details:', error.message);
        console.error('Full error:', error);
        res.status(500).json({ 
            error: 'Sorry, I had trouble processing that. Can you try again?',
            details: error.message 
        });
    }
});

// Clear conversation endpoint (optional)
app.post('/api/clear', (req, res) => {
    const { sessionId = 'default' } = req.body;
    conversations.delete(sessionId);
    res.json({ message: 'Conversation cleared' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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
