# Pollinations Multimodal Discord Chatbot

A public chatbot template designed to be casual, lazy, and occasionally a bit of a jerk. It switches between four different AI models depending on what you say and how much you talk.

## How it Works

This bot doesn't just stick to one brain. It adapts based on context:

* **Gemini-Fast**: Triggers when you upload an image. It acts as the "eyes," describing what it sees with sass.
* **Qwen-Character**: Triggers for short messages (<30 tokens). It’s low-effort, lazy, and very casual.
* **OpenAI**: Triggers for long, complex messages (>100 tokens) that include words like *analyze*, *story*, or *think*. It acts like an arrogant genius.
* **Nova-Fast**: The default middle ground for everything else. Smart, unimpressed, and spicy.

### Features

* **Lowercase Only**: The bot is hard-coded to stay in character by using lowercase letters.
* **Contextual Awareness**: It reads the last 20 messages in the channel to stay on track.
* **Natural Triggers**: If not pinged, it will randomly jump into the conversation every 10 to 15 messages.
* **No Axios**: Built using native Node.js `https` logic for a lightweight footprint.

---

## Setup Guide

### 1. Variables You Need

You need to create a `.env` file in the main folder with these three values:

* **BOT_TOKEN**: Get this from the [Discord Developer Portal](https://discord.com/developers/applications).
* *Note: You must enable **Message Content Intent** under the "Bot" tab or the bot will be blind.*


* **SERVER_ID**: Right-click your server icon in Discord and "Copy Server ID" (enable Developer Mode in Discord settings first).
* **POLLINATIONS_API_KEY**: Your API key from [pollinations.ai](https://pollinations.ai/).

---

### 2. Configuration

Create a `.env` file and paste this:

```text
POLLINATIONS_API_KEY=your_key_here
BOT_TOKEN=your_bot_token_here
SERVER_ID=your_server_id_here
```

---

### 3. Installation & Hosting Methods

#### **Method A: Local Hosting (Your PC)**

Best for testing or if you keep your computer on.

1. Open your terminal/command prompt.
2. Clone the repo:
```bash
git clone https://github.com/blueplaysgames3921/pollinations-multimodal-discord-chatbot-template.git
cd pollinations-multimodal-discord-chatbot-template

```


3. Install dependencies and start:
```bash
npm install
npm start

```



#### **Method B: Railway (Recommended for 24/7)**

Railway is the most reliable "set and forget" service.

1. Fork this repo to your own GitHub account.
2. Log in to [Railway.app](https://railway.app/).
3. Create a "New Project" and select "Deploy from GitHub repo."
4. In the settings, add your `.env` variables (BOT_TOKEN, etc.).
5. It will deploy automatically.

#### **Method C: VPS / Dedicated Hosting (fps.ms / Oracle)**

If you have a VPS or use a service like **fps.ms** (which offers free 128MB RAM tiers perfect for this bot):

1. Upload the files via SFTP or `git clone`.
2. Ensure you have Node.js installed on the server.
3. Run `npm install` and use a process manager like **PM2** to keep it alive:
```bash
npm install pm2 -g
pm2 start index.js --name "pollinations-bot"

```



---

## Tech Specs

* **Language**: Node.js
* **Library**: discord.js v14
* **API**: [pollinations.ai](https://pollinations.ai/)
* **Logic**: Native `https` / cURL style
* **Resource Usage**: 64MB - 128MB RAM (Very lightweight)

> **Note on Replit**: Replit has heavily restricted free hosting and blocks external "ping" services like UptimeRobot. If you use Replit, the bot will likely fall asleep when you close the tab unless you pay for a "Reserved VM." Use Railway or a VPS for better results.
