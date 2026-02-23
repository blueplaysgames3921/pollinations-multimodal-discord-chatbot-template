# 🌀 BotForgeX: Multimodal Neural Engine
**Architected by blueplaysgames3921 | Powered by Pollinations.AI**

Congratulations. You have generated a custom instance of the BotForgeX framework. This bot is currently configured with the unique persona, backstory, and behavioral logic you defined in the Forge.

---

## ⚡ Deployment: Quick Start (Windows)
If you are hosting locally on Windows, we have provided an automated bridge to get you online instantly.

1. **Configure Identity**: Open \`env.txt\` and paste your **BOT_TOKEN** and **POLLINATIONS_KEY**.
2. **Execute Setup**: Right-click \`INSTALL_AND_LAUNCH.txt\`, rename it to \`launch.cmd\`, and **Run as Administrator**.
3. **Automated Logic**: The script will verify your Node.js version, install all neural dependencies (discord.js, msedge-tts), and ignite the bot core.

---

## 🛠 Manual Configuration & Variables
If you prefer manual setup or are using Linux/MacOS, map your credentials in the \`.env\` file (formerly \`env.txt\`):

| Variable | Description |
| :--- | :--- |
| **BOT_TOKEN** | Your bot's secret key from the [Discord Developer Portal](https://discord.com/developers/applications). |
| **POLLINATIONS_KEY** | Your API access key from [pollinations.ai](https://pollinations.ai/). |
| **SERVER_ID** | (Optional) Restricts the bot to one specific server. |
| **OWNER_ID** | Your Discord User ID. Enables the \`!botcheck\` debug command. |

*Note: Ensure **Message Content Intent** is toggled ON in your Discord Developer Dashboard.*

---

## 🧠 Core Intelligence & Logic
Your bot doesn't just "chat"—it thinks. The BotForgeX engine uses **Contextual Model Routing** to handle different tasks:

* **Vision (Gemini-Fast)**: Triggered when an image is uploaded. The bot "sees" and analyzes visual data.
* **Creative Imaging (Flux)**: Triggered by the \`draw:\` prefix. Generates high-fidelity AI imagery.
* **Rapid Response (Qwen-Character)**: Optimized for short bursts and casual banter (<30 tokens).
* **Deep Analysis (OpenAI)**: Engages for complex logic, storytelling, or research-heavy prompts (>100 tokens).
* **Neural Voice (Edge-TTS)**: If enabled, the bot can generate high-quality audio responses when you ask it to "speak" or "talk."

### Behavioral Protocols
- **Persona Persistence**: The bot will strictly follow the persona and backstory you injected during the generation process.
- **Natural Triggers**: The bot monitors channel activity and will autonomously join the conversation every 5–20 messages to keep the "vibe" alive.
- **Context Memory**: It maintains a rolling buffer of the last 30 messages to ensure continuity in complex discussions.

---

## 🌐 24/7 Hosting Solutions

### Method A: Railway.app (Recommended)
1. Upload these files to a private GitHub Repository.
2. Connect the repo to [Railway.app](https://railway.app/).
3. Add your \`.env\` variables to the Railway "Variables" tab.
4. **Build Command**: \`npm install\` | **Start Command**: \`node index.js\`

### Method B: VPS / Dedicated Server (Ubuntu/Linux)
1. Transfer files via SFTP/SCP.
2. Install PM2 to keep the process alive: \`npm install pm2 -g\`.
3. Launch: \`pm2 start index.js --name "botforgex-bot"\`.

---

## 🛡 Security & Safety Measures
- **Local Integrity**: This bot uses native Node.js \`https\` logic. No external logging or data-harvesting middlewares are used.
- **Credential Safety**: Never share your \`.env\` or \`env.txt\` file. If your **BOT_TOKEN** is leaked, reset it immediately in the Discord Developer Portal.
- **Process Isolation**: When running the automated launcher, ensure you trust the directory permissions. The launcher is designed to only modify files within its own folder.

---
*Generated via BotForgeX Labs. Stay creative.*
