// loader.js
// Odoo'ya eklenecek tek satır: <script src="https://haydarkocak.github.io/kalen-chat-widget/loader.js"></script>

(function() {
    'use strict';
    
    // Widget button oluştur
    const btn = document.createElement('button');
    btn.id = 'kh-chat-btn';
    btn.innerHTML = '💬';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
        color: white;
        border: none;
        font-size: 28px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(237, 137, 54, 0.4);
        z-index: 999999;
        transition: all 0.3s ease;
    `;
    
    btn.onmouseover = () => {
        btn.style.transform = 'scale(1.1)';
        btn.style.boxShadow = '0 6px 20px rgba(237, 137, 54, 0.6)';
    };
    
    btn.onmouseout = () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 12px rgba(237, 137, 54, 0.4)';
    };
    
    document.body.appendChild(btn);
    
    // Widget iframe oluştur
    const iframe = document.createElement('iframe');
    iframe.id = 'kh-chat-iframe';
    iframe.src = 'https://haydarkocak.github.io/kalen-chat-widget/index.html'; // USERNAME'i değiştir
    iframe.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 400px;
        height: 600px;
        border: none;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 999998;
        display: none;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(iframe);
    
    // Toggle
    let isOpen = false;
    btn.onclick = () => {
        isOpen = !isOpen;
        iframe.style.display = isOpen ? 'block' : 'none';
        btn.innerHTML = isOpen ? '✕' : '💬';
        btn.style.background = isOpen 
            ? 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)'
            : 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)';
    };
    
    // Mobil
    if (window.innerWidth <= 768) {
        iframe.style.width = 'calc(100vw - 20px)';
        iframe.style.height = 'calc(100vh - 100px)';
        iframe.style.right = '10px';
        btn.style.right = '10px';
    }
})();
