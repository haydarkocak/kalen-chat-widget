// chat.js - Main Chat Logic for Kalen Widget
// Handles UI interactions, message flow, and user input

let khMessages = [];
let khCurrentLang = 'en';
let khIsTyping = false;
let khConversationId = null;

// Initialize chat on page load
window.addEventListener('load', function() {
  khInitializeChat();
});

function khInitializeChat() {
  // Generate conversation ID
  khConversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  // Load saved language preference
  const savedLang = localStorage.getItem('khLang');
  if (savedLang && ['en', 'tr', 'de'].includes(savedLang)) {
    khCurrentLang = savedLang;
  }
  
  // Show greeting
  khAddBotMessage(khGetGreeting(khCurrentLang));
  
  // Focus input
  const input = document.getElementById('khInput');
  if (input) {
    input.focus();
  }
  
  // Check API health
  if (typeof checkAPIHealth === 'function') {
    checkAPIHealth().then(healthy => {
      if (!healthy) {
        console.warn('⚠️ API health check failed');
      }
    });
  }
  
  console.log('✅ Kalen Chat initialized', {
    conversationId: khConversationId,
    language: khCurrentLang,
    timestamp: new Date().toISOString()
  });
}

async function khSend() {
  const input = document.getElementById('khInput');
  const text = input.value.trim();
  
  if (!text || khIsTyping) return;
  
  const btn = document.getElementById('khSendBtn');
  btn.disabled = true;
  khIsTyping = true;
  
  // Add user message
  khAddUserMessage(text);
  
  // Clear input
  input.value = '';
  input.style.height = 'auto';
  
  // Show typing indicator
  khShowTyping();
  
  // Add to conversation history
  khMessages.push({ 
    role: 'user', 
    content: text,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Call AI API (from api.js)
    const response = await callClaude(khMessages);
    
    khHideTyping();
    khAddBotMessage(response);
    
    khMessages.push({ 
      role: 'assistant', 
      content: response,
      timestamp: new Date().toISOString()
    });
    
    // Extract contact info (from sheets.js)
    if (typeof khCheckAndSaveContact === 'function') {
      khCheckAndSaveContact(text);
    }
    
  } catch (error) {
    khHideTyping();
    
    const errorMsg = khGetErrorMessage('connection', khCurrentLang);
    khAddBotMessage(errorMsg, true);
    
    console.error('❌ Chat error:', error);
  } finally {
    btn.disabled = false;
    khIsTyping = false;
    input.focus();
  }
}

function khAddUserMessage(text) {
  const container = document.getElementById('khMessages');
  const div = document.createElement('div');
  div.className = 'kh-msg user';
  
  const timestamp = new Date().toISOString();
  
  div.innerHTML = `
    <div class="kh-bubble">
      ${khEscapeHtml(text)}
      <span class="kh-msg-time">${khFormatTime(timestamp, khCurrentLang)}</span>
    </div>
  `;
  
  container.appendChild(div);
  khScrollToBottom();
}

function khAddBotMessage(text, isError = false) {
  const container = document.getElementById('khMessages');
  const div = document.createElement('div');
  div.className = 'kh-msg bot' + (isError ? ' kh-error' : '');
  
  const timestamp = new Date().toISOString();
  
  div.innerHTML = `
    <div class="kh-bubble">
      ${khEscapeHtml(text)}
      <span class="kh-msg-time">${khFormatTime(timestamp, khCurrentLang)}</span>
    </div>
  `;
  
  container.appendChild(div);
  khScrollToBottom();
}

function khShowTyping() {
  const typing = document.getElementById('khTyping');
  if (typing) {
    typing.style.display = 'flex';
    khScrollToBottom();
  }
}

function khHideTyping() {
  const typing = document.getElementById('khTyping');
  if (typing) {
    typing.style.display = 'none';
  }
}

function khScrollToBottom() {
  const msgs = document.getElementById('khMessages');
  if (msgs) {
    setTimeout(() => {
      msgs.scrollTop = msgs.scrollHeight;
    }, 100);
  }
}

function khToggleLang() {
  const menu = document.getElementById('khLangMenu');
  if (menu) {
    menu.classList.toggle('active');
  }
}

function khSetLang(lang) {
  if (!['en', 'tr', 'de'].includes(lang)) {
    console.error('Invalid language:', lang);
    return;
  }
  
  khCurrentLang = lang;
  localStorage.setItem('khLang', lang);
  
  // Close menu
  const menu = document.getElementById('khLangMenu');
  if (menu) {
    menu.classList.remove('active');
  }
  
  // Reset conversation
  khMessages = [];
  const container = document.getElementById('khMessages');
  if (container) {
    container.innerHTML = '';
  }
  
  // Show new greeting
  khAddBotMessage(khGetGreeting(khCurrentLang));
  
  console.log('🌍 Language changed to:', lang);
}

function khEscapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

function khClearChat() {
  khMessages = [];
  const container = document.getElementById('khMessages');
  if (container) {
    container.innerHTML = '';
  }
  khAddBotMessage(khGetGreeting(khCurrentLang));
  console.log('🗑️ Chat cleared');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  // Input field
  const input = document.getElementById('khInput');
  if (input) {
    // Enter key to send
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        khSend();
      }
    });
    
    // Auto-resize textarea
    input.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
  }
  
  // Close language menu on outside click
  document.addEventListener('click', function(e) {
    const langMenu = document.getElementById('khLangMenu');
    const langBtn = document.querySelector('.kh-lang-btn');
    
    if (langMenu && !langMenu.contains(e.target) && e.target !== langBtn) {
      langMenu.classList.remove('active');
    }
  });
});

// Export functions for external use
if (typeof window !== 'undefined') {
  window.khSend = khSend;
  window.khToggleLang = khToggleLang;
  window.khSetLang = khSetLang;
  window.khClearChat = khClearChat;
}
