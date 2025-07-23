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
- `/clan-join-request` - Request to join a clan
  - Required options:
    - `clan` - Select which clan to join from available choices
    - `ign` - Your in-game name
  - Process:
    1. Request is sent to clan's approval channel with full details
    2. Clan approvers can accept/deny the request using interactive buttons
    3. User receives a DM notification of acceptance/denial
    4. All responses are public for transparency and easier troubleshooting
- `/clan-grant-access` - Grant clan access to a user (Clan Approvers only)
  - Required options:
    - `user` - The user to grant access to
    - `clan` - Select which clan to grant access to
  - Process:
    1. Validates approver has permissions for the selected clan
    2. Grants the clan role if user doesn't already have it
    3. Logs the action in the clan's approval channel
    4. All responses are public for transparency
- `/clan-revoke-access` - Revoke clan access from a user (Clan Approvers only)
  - Required options:
    - `user` - The user to revoke access from
    - `clan` - Select which clan to revoke access from
  - Process:
    1. Validates approver has permissions for the selected clan
    2. Removes the clan role if user has it
    3. Logs the action in the clan's approval channel
    4. All responses are public for transparency

## Clan System

The bot includes a clan management system with the following features:

### Clan Join Requests
- Users can request to join clans using `/clan-join-request`
- Requests include:
  - User's Discord mention
  - User's in-game name
  - Timestamp of request
- Clan approvers are notified via role mention
- Approvers can accept/deny with buttons
- Users receive DM notifications of request outcomes

### Clan Access Management
- Clan approvers can directly manage clan access using:
  - `/grant-clan-access` to add users to clans
  - `/revoke-clan-access` to remove users from clans
- All actions are logged in clan approval channels
- Clear error messages for invalid operations
- Automatic validation of approver permissions

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
├── config/
│   └── clans.json    # Clan configuration (roles, channels, etc.)
├── src/
│   ├── commands/     # Discord slash commands
│   ├── events/       # Discord event handlers
│   ├── types/        # TypeScript interfaces and types
│   ├── utils/        # Configuration utilities
│   ├── index.ts      # Main bot entry point
│   └── deploy-commands.ts  # Command deployment script
├── .env              # Environment variables (not included in repo)
├── package.json      # Project dependencies and scripts
├── pnpm-lock.yaml    # Package manager lock file
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