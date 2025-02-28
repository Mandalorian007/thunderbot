# Thunder Bot

A Discord bot built with Discord.js v14 and TypeScript, designed to enhance the ThunderClap Gaming Discord community experience. This bot provides community management features, gaming-related utilities, and custom functionality tailored specifically for ThunderClap Gaming members.

## Prerequisites

- Node.js (v16.9.0 or higher)
- pnpm (v8.0.0 or higher)
- Discord Bot Token ([Create a bot here](https://discord.com/developers/applications))
- Discord Server with admin permissions

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd thunder-bot
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Your Discord bot token from the Discord Developer Portal
DISCORD_TOKEN=your_discord_bot_token_here

# Your Discord application client ID from the Discord Developer Portal
DISCORD_CLIENT_ID=your_client_id_here

# The ID of your Discord server (guild)
# Right-click your server and select "Copy Server ID" (Developer Mode must be enabled)
DISCORD_GUILD_ID=your_guild_id_here
```

4. Deploy slash commands to your Discord server:
```bash
pnpm run deploy-commands
```

5. Start the bot:
```bash
pnpm run start
```

## Available Commands

Currently, the bot supports the following commands:

- `/ping` - Check if the bot is responsive
- `/join-clan` - Request to join a clan
  - Required options:
    - `clan` - Select which clan to join from available choices
    - `ign` - Your in-game name
  - Process:
    1. Request is sent to clan's approval channel
    2. Clan approvers can accept/deny the request
    3. User receives a DM notification of acceptance/denial

## Clan System

The bot includes a clan management system with the following features:

### Clan Join Requests
- Users can request to join clans using `/join-clan`
- Requests include:
  - User's Discord mention
  - User's in-game name
  - Timestamp of request
- Clan approvers are notified via role mention
- Approvers can accept/deny with buttons
- Users receive DM notifications of request outcomes

### Configuration
Clans are configured in `config/clans.json` with:
- Clan ID and name
- Description
- Member role ID
- Approver role ID
- Approval channel ID

## Project Structure

```
thunder-bot/
├── src/
│   ├── commands/     # Discord slash commands
│   ├── events/       # Discord event handlers
│   ├── spec/         # Specifications and documentation
│   ├── index.ts      # Main bot entry point
│   └── deploy-commands.ts  # Command deployment script
├── .env              # Environment variables
├── package.json      # Project dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Adding New Commands

1. Create a new TypeScript file in `src/commands/`
2. Use this template for your command:

```typescript
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-name')
        .setDescription('Command description'),
    async execute(interaction) {
        // Command logic here
    },
};
```

3. Run `pnpm run deploy-commands` to register the new command

## Development

- Use `pnpm start` to run the bot in development mode
- The bot automatically loads all commands from the `commands` directory
- Event handlers are automatically loaded from the `events` directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Support

[Add support information or contact details here] 