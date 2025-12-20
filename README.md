# Kalen Holden Chat Widget

AI-powered chat widget with multi-provider fallback system (Claude → ChatGPT → Gemini).

## Features

- 🤖 **Multi-AI Fallback**: Claude (primary), ChatGPT (backup), Gemini (fallback)
- 🌍 **Multi-language**: Turkish, English, German
- 📊 **Lead Tracking**: Automatic contact info extraction → Google Sheets
- 🔒 **Secure**: API keys stored in Cloudflare Workers (encrypted)
- ⚡ **Fast**: Cloudflare edge network
- 📱 **Responsive**: Mobile-friendly design

## Setup

### 1. Cloudflare Workers

Create two workers:

#### Worker 1: `kalen-chat-widget`
- **URL**: `https://kalen-chat-widget.YOUR-SUBDOMAIN.workers.dev`
- **Environment Variables**:
  - `CLAUDE_API_KEY`
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`

#### Worker 2: `kalen-sheets-api`
- **URL**: `https://kalen-sheets-api.YOUR-SUBDOMAIN.workers.dev`
- **Environment Variables**:
  - `GOOGLE_API_KEY`
  - `GOOGLE_SHEET_ID`

### 2. Update Frontend

Edit `js/api.js`:

```javascript
const CHAT_WORKER_URL = 'https://YOUR-WORKER-URL.workers.dev';
const SHEETS_WORKER_URL = 'https://YOUR-SHEETS-WORKER-URL.workers.dev';
