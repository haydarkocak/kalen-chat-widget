// Mesaj gönder
async function khSendMessage() {
    const input = document.getElementById('kh-chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Kullanıcı mesajını ekle
    khAddMessage(message, 'user');
    input.value = '';
    
    // İletişim bilgilerini kontrol et
    khCheckAndSaveContact(message);
    
    // Mesajları diziye ekle
    khMessages.push({
        role: 'user',
        content: message
    });
    
    // "Yazıyor..." göster
    khShowTyping();
    
    try {
        // API çağrısı
        const response = await callClaude(khMessages);
        
        // "Yazıyor..." gizle
        khHideTyping();
        
        // Bot yanıtını ekle
        khAddMessage(response, 'assistant');
        
        // Yanıtı diziye ekle
        khMessages.push({
            role: 'assistant',
            content: response
        });
        
        // Yanıttan da iletişim bilgisi çıkarabilir (opsiyonel)
        khCheckAndSaveContact(response);
        
    } catch (error) {
        khHideTyping();
        khAddMessage(error.message, 'error');
    }
}
