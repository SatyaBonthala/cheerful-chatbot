# Cheerful Companion Chatbot 💙

A supportive AI chatbot that helps cheer up people using **LLaMA3** and **LangChain**.

## Features

✨ **Empathetic Conversations** - Warm, understanding responses that validate feelings  
🧠 **Context Memory** - Remembers the conversation to provide better support  
💬 **Simple Interface** - Clean, calming design with easy-to-use chat  
⚡ **Fast Responses** - Powered by Groq's LLaMA3-70B for quick replies  
🎯 **Quick Suggestions** - Pre-built prompts to get started easily

## Tech Stack

- **Frontend**: Pure HTML, CSS, JavaScript
- **Backend**: Node.js + Express
- **AI**: Groq LLaMA3-70B-8192
- **Framework**: LangChain for conversation management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Groq API Key

1. Go to [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up/login and create a new API key
3. Copy your API key

### 3. Configure Environment

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your API key:
```
GROQ_API_KEY=your_actual_api_key_here
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 5. Open in Browser

Navigate to: **http://localhost:3000**

## Project Structure

```
chatbot/
├── server.js           # Backend server with LangChain
├── public/
│   ├── index.html      # Frontend UI
│   ├── style.css       # Styling
│   └── script.js       # Frontend logic
├── package.json        # Dependencies
├── .env                # API keys (create this)
└── .env.example        # Template
```

## How It Works

1. **User sends message** → Frontend posts to `/api/chat`
2. **Backend receives message** → LangChain ConversationChain processes it
3. **LLaMA3 generates response** → Empathetic, supportive reply
4. **Memory stores context** → Next messages have full conversation history
5. **Response sent back** → Displayed in chat interface

## Customization

### Change the Personality

Edit the `SYSTEM_PROMPT` in `server.js` to adjust the chatbot's tone and behavior.

### Adjust Response Creativity

Change `temperature` in `server.js` (0.0 = focused, 1.0 = creative):
```javascript
temperature: 0.8
```

### Modify UI Colors

Edit the gradient colors in `style.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## API Endpoints

- `POST /api/chat` - Send a message, get a response
- `POST /api/clear` - Clear conversation history for a session
- `GET /api/health` - Health check

## Notes

- Each browser session gets its own conversation memory
- Conversations are stored in-memory (cleared on server restart)
- Add Redis or database for persistent storage if needed

## License

MIT
