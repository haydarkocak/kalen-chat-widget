// sheets.js - Google Sheets Integration
let khUserData = {
    email: '',
    phone: '',
    name: '',
    company: '',
    message: '',
    timestamp: '',
    provider: ''
};

async function saveToSheets(data) {
    try {
        const response = await fetch(SHEETS_WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: khUserData.email || '',
                phone: khUserData.phone || '',
                name: khUserData.name || '',
                company: khUserData.company || '',
                message: data.message || '',
                language: khCurrentLang || 'en',
                provider: data.provider || 'unknown',
                source: 'website'
            })
        });

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Lead saved to Google Sheets:', result.timestamp);
        } else {
            console.error('❌ Failed to save lead:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Sheets save error:', error);
    }
}

function khExtractContactInfo(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
        khUserData.email = emails[0];
        console.log('📧 Email detected:', khUserData.email);
    }
    
    const phoneRegex = /(?:\+90|0)?[\s\-\.]?[(]?[0-9]{3}[)]?[\s\-\.]?[0-9]{3}[\s\-\.]?[0-9]{2}[\s\-\.]?[0-9]{2}|(?:\+49|0)?[\s\-\.]?[(]?[0-9]{2,4}[)]?[\s\-\.]?[0-9]{3,10}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
        khUserData.phone = phones[0].trim();
        console.log('📱 Phone detected:', khUserData.phone);
    }
    
    const namePatterns = [
        /(?:adım|ismim|ben)\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)?)/i,
        /(?:my name is|i am|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
        /(?:ich heiße|mein name ist)\s+([A-Z][a-zäöüß]+(?:\s+[A-Z][a-zäöüß]+)?)/i
    ];
    
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            khUserData.name = match[1].trim();
            console.log('👤 Name detected:', khUserData.name);
            break;
        }
    }
    
    const companyPatterns = [
        /(?:şirket|firma|company|unternehmen)\s+(?:adı|name|is)?\s*:?\s*([A-ZÇĞİÖŞÜ][^\n.,]+)/i,
        /([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)*)\s+(?:Ltd|A\.Ş|A\.S|Inc|LLC|GmbH|AG)/i
    ];
    
    for (const pattern of companyPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            khUserData.company = match[1].trim();
            console.log('🏢 Company detected:', khUserData.company);
            break;
        }
    }
    
    if ((khUserData.email || khUserData.phone) && !khUserData.timestamp) {
        khUserData.timestamp = new Date().toISOString();
        console.log('💾 Saving lead data...');
    }
}

function khCheckAndSaveContact(userMessage) {
    khExtractContactInfo(userMessage);
}
