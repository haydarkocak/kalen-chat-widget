// sheets.js
async function saveToSheets(data) {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SHEET_ID}/values/Leads!A:H:append?valueInputOption=USER_ENTERED&key=${CONFIG.GOOGLE_SHEETS_KEY}`;
        
        const row = [
            new Date().toISOString(),
            data.name || '',
            data.email || '',
            data.phone || '',
            data.company || '',
            data.country || '',
            data.message || '',
            'New'
        ];

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [row]
            })
        });

        console.log('Saved to Google Sheets');
    } catch (error) {
        console.error('Sheets Error:', error);
    }
}
