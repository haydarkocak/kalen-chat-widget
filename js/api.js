// api.js - Cloudflare Workers ile Multi-AI Chat API
const CHAT_WORKER_URL = 'https://kalen-chat-widget.haydar-d33.workers.dev';
const SHEETS_WORKER_URL = 'https://kalen-sheets-api.haydar-d33.workers.dev';

async function checkAPIHealth() {
    try {
        const response = await fetch(CHAT_WORKER_URL, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Status:', data.status);
            console.log('📊 Available Models:', data.models);
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ API Health Check Failed:', error);
        return false;
    }
}

async function callClaude(messages) {
    try {
        const response = await fetch(CHAT_WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                language: khCurrentLang || 'en'
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            console.log('🤖 AI Provider:', data.provider);
            console.log('⏱️ Timestamp:', data.timestamp);
            
            saveToSheets({
                message: messages[messages.length - 1].content,
                response: data.message,
                provider: data.provider
            });
            
            return data.message;
        } else {
            throw new Error(data.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('❌ API Error:', error);
        
        const errorMessages = {
            en: 'Connection error. Please try again or email info@kalenholden.com',
            tr: 'Bağlantı hatası. Lütfen tekrar deneyin veya info@kalenholden.com adresine email gönderin',
            de: 'Verbindungsfehler. Bitte versuchen Sie es erneut oder senden Sie eine E-Mail an info@kalenholden.com'
        };
        
        throw new Error(errorMessages[khCurrentLang] || errorMessages.en);
    }
}

window.addEventListener('load', () => {
    checkAPIHealth();
});
