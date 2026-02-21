const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const suggestions = document.getElementById('suggestions');

let isTyping = false;
const sessionId = generateSessionId();
let conversationHistory = []; // Store conversation history for serverless

// Generate a unique session ID
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Send message function
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message || isTyping) return;
    
    // Clear input
    userInput.value = '';
    
    // Hide suggestions after first message
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    // Add user message to chat
    addMessage(message, 'user');
    
    // Add to conversation history
    conversationHistory.push({ role: 'user', content: message });
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId,
                conversationHistory: conversationHistory
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        hideTypingIndicator();
        
        if (data.error) {
            const errorMessage = data.error || 'Sorry, I had trouble understanding that. Could you try again?';
            addMessage(errorMessage, 'bot');
            // Don't add error to conversation history
        } else {
            addMessage(data.message, 'bot');
            // Add bot response to conversation history
            conversationHistory.push({ role: 'assistant', content: data.message });
        }
        
    } catch (error) {
        console.error('Error:', error);
        hideTypingIndicator();
        addMessage('Oops! I seem to be having connection issues. Please try again in a moment.', 'bot');
    }
    
    // Focus back on input
    userInput.focus();
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex items-end gap-3 animate-slide-in ${sender === 'user' ? 'flex-row-reverse' : ''}`;
    
    const avatar = document.createElement('div');
    avatar.className = `w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-sm ${
        sender === 'user' 
            ? 'bg-gray-200' 
            : 'bg-[#7C6FBF]'
    }`;
    avatar.textContent = sender === 'user' ? '😊' : '💬';
    
    const content = document.createElement('div');
    content.className = `max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
        sender === 'user'
            ? 'bg-gray-100 text-gray-800 border border-gray-200'
            : 'bg-[#7C6FBF] text-white'
    }`;
    content.innerHTML = `<p class="text-sm leading-relaxed whitespace-pre-wrap">${escapeHtml(text)}</p>`;
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    
    chatContainer.appendChild(messageDiv);
    scrollToBottom();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show typing indicator
function showTypingIndicator() {
    isTyping = true;
    sendBtn.disabled = true;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex items-end gap-3 animate-slide-in';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="w-10 h-10 rounded-xl bg-[#7C6FBF] flex items-center justify-center text-lg flex-shrink-0 shadow-sm">💬</div>
        <div class="bg-[#7C6FBF] px-5 py-3 rounded-2xl shadow-sm flex gap-2">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

// Hide typing indicator
function hideTypingIndicator() {
    isTyping = false;
    sendBtn.disabled = false;
    
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Send quick message from suggestions
function sendQuickMessage(message) {
    userInput.value = message;
    sendMessage();
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Focus input on load
window.addEventListener('load', () => {
    userInput.focus();
});
