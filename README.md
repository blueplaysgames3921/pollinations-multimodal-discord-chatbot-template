# Pollinations Multimodal Discord Chatbot

a public chatbot template designed to be casual, lazy, and occasionally a bit of a jerk. it switches between four different ai models depending on what you say and how much you talk.

## how it works

this bot doesn't just stick to one brain. it adapts based on context:

* **gemini-fast**: triggers when you upload an image. it acts as the "eyes," describing what it sees with sass.
* **qwen-character**: triggers for short messages (<30 tokens). it’s low-effort, lazy, and very casual.
* **openai**: triggers for long, complex messages (>100 tokens) that include words like *analyze*, *story*, or *think*. it acts like an arrogant genius.
* **nova-fast**: the default middle ground for everything else. smart, unimpressed, and spicy.

### features
* **lowercase only**: the bot is hard-coded to stay in character by using lowercase letters.
* **contextual awareness**: it reads the last 20 messages in the channel to stay on track.
* **natural triggers**: if not pinged, it will randomly jump into the conversation every 10 to 15 messages.
* **no axios**: built using native node.js `https` logic for a lightweight footprint.

---

## setup guide

### 1. variables you need
you need to create a `.env` file in the main folder with these three values:

* **BOT_TOKEN**: get this from the [discord developer portal](https://discord.com/developers/applications). 
    * *note: you must enable **message content intent** under the bot tab or it won't work.*
* **SERVER_ID**: right-click your server icon in discord and "copy server id" (enable developer mode in discord settings first).
* **POLLINATIONS_API_KEY**: your api key from [pollinations.ai](https://pollinations.ai/).

### 2. configuration
create a `.env` file and paste this:

```text
POLLINATIONS_API_KEY=your_key_here
BOT_TOKEN=your_bot_token_here
SERVER_ID=your_server_id_here

### 3. installation
open your terminal in the project folder and run:

```Bash
npm install
npm start```
tech specs
* language: node.js

* library: discord.js v14

* api: pollinations.ai (openai, gemini, qwen, nova)

* logic: native https / cURL style
