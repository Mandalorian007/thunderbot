import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    MessageFlags,
    GuildMember
} from 'discord.js';
import { loadClanConfig } from '../utils/config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan-grant-access')
        .setDescription('Grant clan access to a user')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan to grant access to')
                .setRequired(true)
                .addChoices(...loadClanConfig().clans.map(clan => ({
                    name: clan.name,
                    value: clan.id
                })))
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to grant clan access to')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Get the command user (granter)
            const granter = interaction.member as GuildMember;
            if (!granter) {
                await interaction.reply({
                    content: '❌ Failed to fetch your member information.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Load clan configuration and filter to user's clans
            const config = loadClanConfig();
            const accessibleClans = config.clans.filter(clan => 
                granter.roles.cache.has(clan.approverRoleId)
            );

            if (accessibleClans.length === 0) {
                await interaction.reply({
                    content: '❌ You must have approver permissions for at least one clan to grant access.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const targetUser = interaction.options.getUser('user', true);
            const clanId = interaction.options.getString('clan', true);

            // Validate clan selection
            const selectedClan = accessibleClans.find(c => c.id === clanId);
            if (!selectedClan) {
                await interaction.reply({
                    content: '❌ You must have approver permissions for this clan to grant access.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Get the target member
            const targetMember = await interaction.guild?.members.fetch({
                user: targetUser.id,
                force: true
            });

            if (!targetMember) {
                await interaction.reply({
                    content: '❌ Failed to fetch target user information.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Check if user already has the role
            if (targetMember.roles.cache.has(selectedClan.roleId)) {
                await interaction.reply({
                    content: `❌ ${targetUser.toString()} already has the ${selectedClan.name} role.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Grant the role
            try {
                await targetMember.roles.add(selectedClan.roleId);
                await interaction.reply({
                    content: `✅ Successfully granted ${selectedClan.name} access to ${targetUser.toString()}.`,
                    flags: MessageFlags.Ephemeral
                });

                // Log the action in the clan's approval channel
                const approvalChannel = await interaction.guild?.channels.fetch(selectedClan.approvalChannelId);
                if (approvalChannel?.isTextBased()) {
                    await approvalChannel.send({
                        content: `**🔔 Clan Access Granted**\n\n`
                            + `**To:** ${targetUser.toString()}\n`
                            + `**Clan:** ${selectedClan.name}\n`
                            + `**Granted by:** ${interaction.user.toString()}\n`
                            + `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`
                    });
                }
            } catch (error) {
                console.error('Failed to grant clan role:', error);
                await interaction.reply({
                    content: '❌ Failed to grant clan role. Please check bot permissions and try again.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Error in grant-clan-access command:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}; 