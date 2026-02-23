const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require('discord.js');
const https = require('https');
const fs = require('fs');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

const tts = new MsEdgeTTS();
let msgCounter = 0;

// Env Configuration
const min = parseInt(process.env.NATURAL_MIN) || 5;
const max = parseInt(process.env.NATURAL_MAX) || 20;
let nextTrigger = Math.floor(Math.random() * (max - min + 1)) + min;

async function callPollinations(messages, model, isImage = false) {
    return new Promise((resolve, reject) => {
        const payload = isImage ? null : JSON.stringify({
            model: model,
            messages: messages,
            seed: Math.floor(Math.random() * 1000000),
            temperature: parseFloat(process.env.CREATIVITY_LEVEL) || 0.7
        });

        const options = {
            hostname: 'gen.pollinations.ai',
            path: isImage ? `/image/${encodeURIComponent(messages)}` : '/v1/chat/completions',
            method: isImage ? 'GET' : 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.POLLINATIONS_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode !== 200) return reject(`API_ERR: ${res.statusCode}`);
            
            let body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                try {
                    const buffer = Buffer.concat(body);
                    if (isImage) return resolve(buffer);
                    
                    const json = JSON.parse(buffer.toString());
                    if (json.choices && json.choices[0]) {
                        resolve(json.choices[0].message.content);
                    } else {
                        reject('Malformed response');
                    }
                } catch (e) { reject('Parsing error'); }
            });
        });

        if (!isImage && payload) req.write(payload);
        req.on('error', (e) => reject(e));
        req.end();
    });
}

client.on('messageCreate', async (message) => {
    // 1. Basic Safety Filters
    if (message.author.bot) return;
    if (process.env.SERVER_ID && message.guildId !== process.env.SERVER_ID) return;

    // 2. Owner Debug Command
    if (message.content === '!botcheck' && message.author.id === process.env.OWNER_ID) {
        const options = { 
            hostname: 'gen.pollinations.ai', 
            path: '/account/balance', 
            headers: { 'Authorization': `Bearer ${process.env.POLLINATIONS_KEY}` } 
        };
        https.get(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const bal = JSON.parse(data);
                    message.reply(`📡 **System Check:** Pollen Balance: \`${bal.balance || 0}\``);
                } catch (e) { message.reply('❌ Error parsing balance.'); }
            });
        }).on('error', () => message.reply('❌ Network error during check.'));
        return;
    }

    // 3. Trigger Logic
    const isMentioned = message.mentions.has(client.user);
    msgCounter++;

    if (!isMentioned && msgCounter < nextTrigger) return;
    
    // Reset counter for next cycle
    msgCounter = 0;
    nextTrigger = Math.floor(Math.random() * (max - min + 1)) + min;

    try {
        await message.channel.sendTyping();
        
        // Fetch History
        const rawLogs = await message.channel.messages.fetch({ limit: 15 }); // Limit lowered for speed
        const history = rawLogs.reverse()
            .filter(m => !m.content.startsWith('!') && m.content.length > 0)
            .map(m => ({
                role: m.author.id === client.user.id ? 'assistant' : 'user',
                content: m.content
            }));

        let selectedModel = 'nova-fast';
        let prompt = message.content || "";
        const tokens = prompt.length / 4;

        // 4. Advanced Model Routing logic
        if (message.attachments.size > 0 && process.env.ENABLE_VISION === 'true') {
            selectedModel = 'gemini-fast';
            const lastMsg = history[history.length - 1];
            if (lastMsg) {
                lastMsg.content = [
                    { type: "text", text: prompt || "Analyze this image." },
                    { type: "image_url", image_url: { url: message.attachments.first().url } }
                ];
            }
        } else if (prompt.toLowerCase().startsWith('draw:') && process.env.ENABLE_IMAGE_GEN === 'true') {
            const query = prompt.split('draw:')[1];
            const imgBuffer = await callPollinations(query, 'flux', true);
            return message.reply({ files: [new AttachmentBuilder(imgBuffer, { name: 'generated.png' })] });
        } else if (tokens < 30) {
            selectedModel = 'qwen-character';
        } else if (tokens > 100 || /analyze|complex|logic|research|think/i.test(prompt)) {
            selectedModel = 'openai';
        } else if (/code|script|function|python|js/i.test(prompt)) {
            selectedModel = 'qwen-coder';
        }

        // Persona Injection
        const sysPersona = `${process.env.SYSTEM_PROMPT} Backstory: ${process.env.BACKSTORY}. Hobbies: ${process.env.HOBBIES}. Dislikes: ${process.env.DISLIKES}. Your favorite users: ${process.env.LIKED_USERS}.`;
        history.unshift({ role: 'system', content: sysPersona });

        let response = await callPollinations(history, selectedModel);

        // 5. Post-Processing
        if (selectedModel === 'qwen-character') {
            response = response.split('\n')[0].replace(/[^\x00-\x7F]/g, "");
        }

        if (selectedModel !== 'openai' && process.env.CASUAL_MODE === 'true') {
            response = response.toLowerCase();
        }

        // 6. Voice Output Logic
        if (process.env.ENABLE_TTS === 'true' && (prompt.includes('speak') || prompt.includes('voice'))) {
            const voicePath = `./voice_${Date.now()}.mp3`;
            await tts.setMetadata("en-US-AriaNeural", OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);
            await tts.toFile(voicePath, response);
            
            await message.reply({ content: response, files: [new AttachmentBuilder(voicePath)] });
            
            // Clean up file after sending
            return fs.unlink(voicePath, (err) => { if(err) console.error("Cleanup failed"); });
        }

        await message.reply(response);
    } catch (err) { 
        console.error('Handled Exception:', err);
        // Silent fail to prevent bot from crashing on single message errors
    }
});

client.login(process.env.BOT_TOKEN);
