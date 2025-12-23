// api.js - API Communication for Kalen Chat Widget
// Backend: Cloudflare Worker + FastAPI (13.60.91.0:8000)

const API_CONFIG = {
    // Cloudflare Worker URL (CORS proxy)
    workerURL: 'https://kalen-chat-api.haydar-d33.workers.dev',
    
    // Direct backend URL (fallback)
    backendURL: 'http://13.60.91.0:8000',
    
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
};

// Session Management
let SESSION_ID = localStorage.getItem('kh_session_id') || 
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
localStorage.setItem('kh_session_id', SESSION_ID);

console.log('🆔 Session ID:', SESSION_ID);

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options = {}, timeout = API_CONFIG.timeout) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        throw error;
    }
}

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry(url, options = {}, attempts = API_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
        try {
            console.log(`🔄 Attempt ${i + 1}/${attempts} - ${url}`);
            const response = await fetchWithTimeout(url, options);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP ${response.status}:`, errorText);
                throw new Error(`Server error: ${response.status}`);
            }
            
            return response;
        } catch (error) {
            console.warn(`⚠️ Attempt ${i + 1} failed:`, error.message);
            
            if (i === attempts - 1) {
                throw error; // Last attempt failed
            }
            
            // Exponential backoff: 1s, 2s, 4s
            const delay = API_CONFIG.retryDelay * Math.pow(2, i);
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

/**
 * Get messages from backend
 * @returns {Promise<Array>} Array of messages
 */
async function getMessages() {
    try {
        console.log('📥 Fetching messages for session:', SESSION_ID);
        
        const response = await fetchWithRetry(
            `${API_CONFIG.workerURL}/api/messages?session_id=${SESSION_ID}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        );

        const data = await response.json();
        console.log('✅ Messages received:', data);
        
        return data.messages || [];
    } catch (error) {
        console.error('❌ Failed to fetch messages:', error);
        return []; // Return empty array on error
    }
}

/**
 * Send message to backend
 * @param {string} content - Message content
 * @param {string} sender - 'user' or 'assistant'
 * @returns {Promise<Object>} Saved message object
 */
async function sendMessageToBackend(content, sender = 'user') {
    try {
        console.log('📤 Sending to backend:', { content, sender, session_id: SESSION_ID });
        
        const response = await fetchWithRetry(
            `${API_CONFIG.workerURL}/api/messages`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content,
                    sender: sender,
                    session_id: SESSION_ID
                })
            }
        );

        const data = await response.json();
        console.log('✅ Message saved:', data);
        
        return data.message || data;
    } catch (error) {
        console.error('❌ Failed to save message:', error);
        throw new Error('Could not save message');
    }
}

/**
 * Get AI response from Claude
 * @param {string} userMessage - User's message
 * @param {string} language - Current language (en, tr, de)
 * @returns {Promise<string>} AI response
 */
async function getAIResponse(userMessage, language = 'en') {
    try {
        console.log('🤖 Requesting AI response');
        console.log('💬 User message:', userMessage);
        console.log('🌍 Language:', language);
        
        // Get conversation history
        const messages = await getMessages();
        
        // Format for Claude API
        const conversationHistory = messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Add current message
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });
        
        console.log('📜 Conversation history:', conversationHistory);
        
        const response = await fetchWithRetry(
            `${API_CONFIG.workerURL}/api/chat`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    language: language,
                    session_id: SESSION_ID
                })
            },
            2 // Only 2 attempts for AI (it's slower)
        );

        const data = await response.json();
        console.log('✅ AI response received:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'AI response failed');
        }
        
        return data.message || data.response;
        
    } catch (error) {
        console.error('❌ AI response failed:', error);
        
        // Fallback responses by language
        const fallbackMessages = {
            en: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact us at info@kalenholden.com",
            tr: "Üzgünüm, şu anda bağlantı sorunu yaşıyorum. Lütfen bir süre sonra tekrar deneyin veya info@kalenholden.com adresinden bize ulaşın",
            de: "Entschuldigung, ich habe gerade Verbindungsprobleme. Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns unter info@kalenholden.com"
        };
        
        return fallbackMessages[language] || fallbackMessages.en;
    }
}

/**
 * Health check
 * @returns {Promise<boolean>}
 */
async function checkAPIHealth() {
    try {
        console.log('🏥 Health check...');
        
        const response = await fetchWithTimeout(
            `${API_CONFIG.workerURL}/health`,
            { method: 'GET' },
            5000 // 5 second timeout for health check
        );
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API healthy:', data);
            return true;
        }
        
        console.warn('⚠️ API unhealthy:', response.status);
        return false;
    } catch (error) {
        console.error('❌ Health check failed:', error);
        return false;
    }
}

/**
 * Send complete message flow (save user message + get AI response + save AI response)
 * @param {string} userMessage - User's message
 * @param {string} language - Current language
 * @returns {Promise<string>} AI response
 */
async function sendMessage(userMessage, language = 'en') {
    try {
        // 1. Save user message
        await sendMessageToBackend(userMessage, 'user');
        
        // 2. Get AI response
        const aiResponse = await getAIResponse(userMessage, language);
        
        // 3. Save AI response
        await sendMessageToBackend(aiResponse, 'assistant');
        
        return aiResponse;
        
    } catch (error) {
        console.error('❌ sendMessage error:', error);
        throw error;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.API = {
        sendMessage,
        getMessages,
        sendMessageToBackend,
        getAIResponse,
        checkAPIHealth,
        SESSION_ID
    };
    
    // Backward compatibility
    window.sendMessage = sendMessage;
    window.checkAPIHealth = checkAPIHealth;
}

// Initialize on load
window.addEventListener('load', async () => {
    console.log('🚀 API Module Loaded');
    console.log('📍 Worker URL:', API_CONFIG.workerURL);
    console.log('📍 Backend URL:', API_CONFIG.backendURL);
    console.log('🆔 Session ID:', SESSION_ID);
    
    // Health check
    const isHealthy = await checkAPIHealth();
    
    if (!isHealthy) {
        console.warn('⚠️ API health check failed - some features may not work');
    }
});

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendMessage,
        getMessages,
        sendMessageToBackend,
        getAIResponse,
        checkAPIHealth
    };
}
