const API_CONFIG = {
    baseURL: 'https://kalen-chat-widget.haydar-d33.workers.dev',
    timeout: 30000
};

async function sendMessage(messages, language = 'en') {
    try {
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

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Unknown error');
        }

        return data.message;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

export { sendMessage };
