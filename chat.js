// chat.js
let messages = [];
let currentLang = 'en';
let userData = {};

// Initialize
window.onload = () => {
    addBotMessage(getGreeting());
    document.getElementById('input').focus();
};

// Send message
async function send() {
    const input = document.getElementById('input');
    const text = input.value.trim();
    
    if (!text) return;
    
    addUserMessage(text);
    input.value = '';
    input.style.height = 'auto';
    
    showTyping();
    
    messages.push({ role: 'user', content: text });
    
    const response = await callClaude(messages);
    
    hideTyping();
    addBotMessage(response);
    
    messages.push({ role: 'assistant', content: response });
    
    // Check if contact info provided
    extractContactInfo(text);
}

// Add messages
function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg user';
    div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
    document.getElementById('messages').appendChild(div);
    scrollToBottom();
}

function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg bot';
    div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
    document.getElementById('messages').appendChild(div);
    scrollToBottom();
}

// Typing indicator
function showTyping() {
    document.getElementById('typing').style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    document.getElementById('typing').style.display = 'none';
}

// Scroll to bottom
function scrollToBottom() {
    const msgs = document.getElementById('messages');
    msgs.scrollTop = msgs.scrollHeight;
}

// Language
function toggleLang() {
    document.getElementById('langMenu').classList.toggle('active');
}

function setLang(lang) {
    currentLang = lang;
    document.getElementById('langMenu').classList.remove('active');
}

// Greeting
function getGreeting() {
    const greetings = {
        en: "Hello. I'm the digital consultant for Kalen Holden.\n\nDo you need something? Products, suppliers, buyers... Or maybe you have a customer but can't find the right partner?\n\nIf you're struggling with local authorities, permits, or contracts, we can help too.\n\nTell me, I'm listening.",
        tr: "Merhaba. Ben Kalen Holden'ın dijital danışmanıyım.\n\nBir şeye mi ihtiyacınız var? Ürün, tedarikçi, alıcı... Ya da müşteriniz var ama doğru partneri bulamıyor musunuz?\n\nYerel yönetimlerle, izinlerle, sözleşmelerle sıkıntınız varsa onlarda da yardımcı olabiliriz.\n\nAnlatın, dinliyorum.",
        de: "Hallo. Ich bin der digitale Berater für Kalen Holden.\n\nBrauchen Sie etwas? Produkte, Lieferanten, Käufer... Oder haben Sie einen Kunden, können aber den richtigen Partner nicht finden?\n\nWenn Sie Probleme mit lokalen Behörden, Genehmigungen oder Verträgen haben, können wir auch dabei helfen.\n\nErzählen Sie mir, ich höre zu."
    };
    return greetings[currentLang] || greetings.en;
}

// Extract contact info
function extractContactInfo(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/;
    
    const email = text.match(emailRegex);
    const phone = text.match(phoneRegex);
    
    if (email) userData.email = email[0];
    if (phone) userData.phone = phone[0];
    
    // If we have contact info, save to sheets
    if (userData.email || userData.phone) {
        userData.message = messages.map(m => m.content).join('\n\n');
        saveToSheets(userData);
    }
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

// Enter to send
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    });
});
