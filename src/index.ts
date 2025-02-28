import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
dotenv.config();

const token = process.env.DISCORD_TOKEN;

console.log("Bot is starting...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences
    ],
    partials: [
        Partials.User,
        Partials.GuildMember,
        Partials.Channel,
        Partials.Message,
        Partials.Reaction
    ]
});

// Add error handling for the client
client.on('error', error => {
    console.error('Discord client error:', error);
});


// Command Handlers
// @ts-ignore This is recommended by discord.js
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
if (!fs.existsSync(foldersPath)) {
    console.error(`Commands directory not found at: ${foldersPath}`);
    process.exit(1);
}
const items = fs.readdirSync(foldersPath);

for (const item of items) {
    const itemPath = path.join(foldersPath, item);
    const isDirectory = fs.statSync(itemPath).isDirectory();
    
    if (isDirectory) {
        // If it's a directory, read command files from inside it
        const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(itemPath, file);
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                // @ts-ignore This is recommended by discord.js
                client.commands.set(command.data.name, command);
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    } else if (item.endsWith('.ts') || item.endsWith('.js')) {
        // If it's a command file directly in the commands folder
        const command = require(path.join(foldersPath, item));
        if ('data' in command && 'execute' in command) {
            // @ts-ignore This is recommended by discord.js
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Event handlers
const eventsPath = path.join(__dirname, 'events');
if (!fs.existsSync(eventsPath)) {
    console.error(`Events directory not found at: ${eventsPath}`);
    process.exit(1);
}

const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(token);