const API_CONFIG = {
    baseURL: 'https://kalen-chat-widget.haydar-d33.workers.dev',
    timeout: 30000
};

async function sendMessage(messages, language = 'en') {
    try {
        console.log('Sending to API:', API_CONFIG.baseURL);
        console.log('Messages:', messages);
        
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

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
        }

        return data.message;
        
    } catch (error) {
        console.error('sendMessage Error:', error);
        throw error;
    }
}

// Export fonksiyonu
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendMessage };
} else {
    window.sendMessage = sendMessage;
}
