import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const commands = [];
// Grab all the command files from the commands directory
const foldersPath = path.join(__dirname, 'commands');

// Check if the commands directory exists
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
				commands.push(command.data.toJSON());
			} else {
				console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			}
		}
	} else if (item.endsWith('.ts') || item.endsWith('.js')) {
		// If it's a command file directly in the commands folder
		const command = require(path.join(foldersPath, item));
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${itemPath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data: any = await rest.put(
			Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();