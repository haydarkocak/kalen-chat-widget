// api.js - API Communication for Kalen Chat Widget
// Handles all communication with Cloudflare Worker backend

const API_CONFIG = {
    baseURL: 'https://kalen-chat-widget.haydar-d33.workers.dev',
    timeout: 30000
};

/**
 * Send message to AI backend
 * @param {Array} messages - Conversation history
 * @param {string} language - Current language (en, tr, de)
 * @returns {Promise<string>} AI response
 */
async function sendMessage(messages, language = 'en') {
    try {
        console.log('📤 Sending to API:', API_CONFIG.baseURL);
        console.log('💬 Messages:', messages);
        console.log('🌍 Language:', language);
        
        const response = await fetch(API_CONFIG.baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                language: language
            })
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error:', errorText);
            throw new Error(`API returned ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ API Response:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown API error');
        }

        return data.message;
        
    } catch (error) {
        console.error('❌ sendMessage Error:', error);
        throw error;
    }
}

/**
 * Check API health
 * @returns {Promise<boolean>}
 */
async function checkAPIHealth() {
    try {
        const response = await fetch(API_CONFIG.baseURL, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Health:', data);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ API Health check failed:', error);
        return false;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.sendMessage = sendMessage;
    window.checkAPIHealth = checkAPIHealth;
}
