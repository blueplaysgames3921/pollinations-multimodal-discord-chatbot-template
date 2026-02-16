const { Client, GatewayIntentBits, Partials } = require('discord.js');
const https = require('https');
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

let msgCounter = 0;
let targetCount = Math.floor(Math.random() * 6) + 10;

async function askAI(messages, model) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            model: model,
            messages: messages,
            seed: Math.floor(Math.random() * 99999)
        });

        const options = {
            hostname: 'gen.pollinations.ai',
            path: '/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.POLLINATIONS_API_KEY}`,
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(json.choices[0].message.content);
                } catch (e) {
                    reject('api glitching, try again later');
                }
            });
        });

        req.on('error', (e) => reject(e.message));
        req.write(data);
        req.end();
    });
}

client.on('messageCreate', async (message) => {
    if (message.author.bot || message.guildId !== process.env.SERVER_ID) return;

    const isPinged = message.mentions.has(client.user);
    msgCounter++;

    if (!isPinged && msgCounter < targetCount) return;
    
    msgCounter = 0;
    targetCount = Math.floor(Math.random() * 6) + 10;

    const channelMessages = await message.channel.messages.fetch({ limit: 20 });
    const history = Array.from(channelMessages.values()).reverse().map(m => ({
        role: m.author.id === client.user.id ? 'assistant' : 'user',
        content: m.content || "attached an image"
    }));

    let selectedModel = 'nova-fast';
    let persona = "be a middle ground, smart but unimpressed. talk in lowercase. be spicy and fight back if the user is being mid.";
    
    const content = message.content.toLowerCase();
    const tokens = message.content.split(/\s+/).length;
    const hasImage = message.attachments.size > 0;

    if (hasImage) {
        selectedModel = 'gemini-fast';
        persona = "you are the eyes. describe what you see with absolute sass. talk in lowercase. stay helpful but act like it's a chore to look for them.";
        const imgUrl = message.attachments.first().url;
        history[history.length - 1].content = [
            { type: "text", text: message.content || "what is this?" },
            { type: "image_url", image_url: { url: imgUrl } }
        ];
    } else if (tokens < 30) {
        selectedModel = 'qwen-character';
        persona = "be extremely lazy and casual. use very few words. lowercase only. if they annoy you, roast them slightly. don't try hard.";
    } else if (tokens >= 100) {
        const deepWords = ['analyze', 'story', 'explain', 'compare', 'deep', 'think', 'research', 'logic'];
        if (deepWords.some(w => content.includes(w))) {
            selectedModel = 'openai';
            persona = "you're the big brain now. be helpful but keep that spicy edge. lowercase only. act like you're way smarter than the user but still explain it because you're nice like that.";
        }
    }

    history.unshift({ role: 'system', content: `${persona} ALWAYS respond in lowercase letters only. keep a bit of a fighting spirit and spice in your tone.` });

    try {
        await message.channel.sendTyping();
        const response = await askAI(history, selectedModel);
        await message.reply(response.toLowerCase());
    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.BOT_TOKEN);
