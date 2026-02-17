const { Client, GatewayIntentBits, Partials, AttachmentBuilder } = require('discord.js');
const https = require('https');
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

const tts = new MsEdgeTTS();
let msgCounter = 0;
let nextTrigger = Math.floor(Math.random() * (parseInt(process.env.NATURAL_MAX) - parseInt(process.env.NATURAL_MIN) + 1)) + parseInt(process.env.NATURAL_MIN);

async function callPollinations(messages, model, isImage = false) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
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
            let body = [];
            res.on('data', (chunk) => body.push(chunk));
            res.on('end', () => {
                try {
                    if (isImage) return resolve(Buffer.concat(body));
                    const json = JSON.parse(Buffer.concat(body).toString());
                    resolve(json.choices[0].message.content);
                } catch (e) { reject('system error, try again'); }
            });
        });
        if (!isImage) req.write(data);
        req.on('error', (e) => reject(e));
        req.end();
    });
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || (process.env.SERVER_ID && message.guildId !== process.env.SERVER_ID)) return;

    if (message.content === '!botcheck' && message.author.id === process.env.OWNER_ID) {
        const options = { hostname: 'gen.pollinations.ai', path: '/account/balance', headers: { 'Authorization': `Bearer ${process.env.POLLINATIONS_KEY}` } };
        https.get(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                const bal = JSON.parse(data);
                message.reply(`pollen balance: ${bal.balance || 0}`);
            });
        }).on('error', () => message.reply('error fetching balance'));
        return;
    }

    const isMentioned = message.mentions.has(client.user);
    msgCounter++;

    if (!isMentioned && msgCounter < nextTrigger) return;
    msgCounter = 0;
    nextTrigger = Math.floor(Math.random() * (parseInt(process.env.NATURAL_MAX) - parseInt(process.env.NATURAL_MIN) + 1)) + parseInt(process.env.NATURAL_MIN);

    try {
        await message.channel.sendTyping();
        const rawLogs = await message.channel.messages.fetch({ limit: 30 });
        const history = rawLogs.reverse().map(m => ({
            role: m.author.id === client.user.id ? 'assistant' : 'user',
            content: m.content
        }));

        let selectedModel = 'nova-fast';
        let prompt = message.content;
        const tokens = prompt.length / 4;

        if (message.attachments.size > 0 && process.env.ENABLE_VISION === 'true') {
            selectedModel = 'gemini-fast';
            history[history.length - 1].content = [
                { type: "text", text: prompt || "analyze this" },
                { type: "image_url", image_url: { url: message.attachments.first().url } }
            ];
        } else if (prompt.toLowerCase().startsWith('draw:') && process.env.ENABLE_IMAGE_GEN === 'true') {
            const imgBuffer = await callPollinations(prompt.split('draw:')[1], 'flux', true);
            return message.reply({ files: [new AttachmentBuilder(imgBuffer, { name: 'gen.png' })] });
        } else if (tokens < 30) {
            selectedModel = 'qwen-character';
        } else if (tokens > 100 || /analyze|complex|logic|research/i.test(prompt)) {
            selectedModel = 'openai';
        } else if (/code|script|function|python|js/i.test(prompt)) {
            selectedModel = 'qwen-coder';
        }

        const sysPersona = `${process.env.SYSTEM_PROMPT} Backstory: ${process.env.BACKSTORY}. Hobbies: ${process.env.HOBBIES}. Dislikes: ${process.env.DISLIKES}. Your favorite users: ${process.env.LIKED_USERS}.`;
        history.unshift({ role: 'system', content: sysPersona });

        let response = await callPollinations(history, selectedModel);

        if (selectedModel === 'qwen-character') {
            response = response.split('\n')[0].replace(/[^\x00-\x7F]/g, "");
        }

        if (selectedModel !== 'openai' && process.env.CASUAL_MODE === 'true') {
            response = response.toLowerCase();
        }

        if (process.env.ENABLE_TTS === 'true' && (prompt.includes('speak') || prompt.includes('voice'))) {
            await tts.setMetadata("en-US-AriaNeural", OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS);
            const { audioFilePath } = await tts.toFile("./tmp_voice.mp3", response);
            return message.reply({ content: response, files: [audioFilePath] });
        }

        await message.reply(response);
    } catch (err) { console.error('error handled'); }
});

client.login(process.env.BOT_TOKEN);
