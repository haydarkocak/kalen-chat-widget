async function khSend() {
    const input = document.getElementById('khInput');
    const msg = input.value.trim();
    
    if (!msg) return;
    
    // Disable input
    input.disabled = true;
    const sendBtn = document.getElementById('khSendBtn');
    sendBtn.disabled = true;
    
    try {
        // Add user message to UI
        khAddMessage(msg, 'user');
        input.value = '';
        
        // Show typing indicator
        khShowTyping();
        
        // Get current language
        const language = localStorage.getItem('kh_lang') || 'en';
        
        // Send message and get AI response
        const aiResponse = await window.API.sendMessage(msg, language);
        
        // Hide typing
        khHideTyping();
        
        // Add AI response to UI
        khAddMessage(aiResponse, 'bot');
        
    } catch (error) {
        console.error('❌ Send error:', error);
        khHideTyping();
        
        const errorMessages = {
            en: '⚠️ Connection error. Please try again.',
            tr: '⚠️ Bağlantı hatası. Lütfen tekrar deneyin.',
            de: '⚠️ Verbindungsfehler. Bitte versuchen Sie es erneut.'
        };
        
        const lang = localStorage.getItem('kh_lang') || 'en';
        khAddMessage(errorMessages[lang], 'bot');
        
    } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

// Load messages on page load
window.addEventListener('load', async () => {
    console.log('📱 Chat UI loaded');
    
    try {
        const messages = await window.API.getMessages();
        console.log('📥 Loaded messages:', messages.length);
        
        messages.forEach(msg => {
            khAddMessage(msg.content, msg.sender === 'user' ? 'user' : 'bot');
        });
        
        // Show welcome message if no messages
        if (messages.length === 0) {
            const welcomeMessages = {
                en: "Hello! I'm your digital business consultant. How can I help you today?",
                tr: "Merhaba! Ben dijital iş danışmanınızım. Size nasıl yardımcı olabilirim?",
                de: "Hallo! Ich bin Ihr digitaler Unternehmensberater. Wie kann ich Ihnen helfen?"
            };
            
            const lang = localStorage.getItem('kh_lang') || 'en';
            khAddMessage(welcomeMessages[lang], 'bot');
        }
        
    } catch (error) {
        console.error('❌ Failed to load messages:', error);
    }
});
