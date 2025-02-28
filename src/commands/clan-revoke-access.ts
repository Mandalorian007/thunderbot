import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    MessageFlags,
    GuildMember
} from 'discord.js';
import { loadClanConfig } from '../utils/config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan-revoke-access')
        .setDescription('Revoke clan access from a user')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan to revoke access from')
                .setRequired(true)
                .addChoices(...loadClanConfig().clans.map(clan => ({
                    name: clan.name,
                    value: clan.id
                })))
        )
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to revoke clan access from')
                .setRequired(true)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            // Get the command user (revoker)
            const revoker = interaction.member as GuildMember;
            if (!revoker) {
                await interaction.reply({
                    content: '❌ Failed to fetch your member information.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Load clan configuration and filter to user's clans
            const config = loadClanConfig();
            const accessibleClans = config.clans.filter(clan => 
                revoker.roles.cache.has(clan.approverRoleId)
            );

            if (accessibleClans.length === 0) {
                await interaction.reply({
                    content: '❌ You must have approver permissions for at least one clan to revoke access.',
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
                    content: '❌ You must have approver permissions for this clan to revoke access.',
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

            // Check if user has the role
            if (!targetMember.roles.cache.has(selectedClan.roleId)) {
                await interaction.reply({
                    content: `❌ ${targetUser.toString()} does not have the ${selectedClan.name} role.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Revoke the role
            try {
                await targetMember.roles.remove(selectedClan.roleId);
                await interaction.reply({
                    content: `✅ Successfully revoked ${selectedClan.name} access from ${targetUser.toString()}.`,
                    flags: MessageFlags.Ephemeral
                });

                // Log the action in the clan's approval channel
                const approvalChannel = await interaction.guild?.channels.fetch(selectedClan.approvalChannelId);
                if (approvalChannel?.isTextBased()) {
                    await approvalChannel.send({
                        content: `**🔔 Clan Access Revoked**\n\n`
                            + `**From:** ${targetUser.toString()}\n`
                            + `**Clan:** ${selectedClan.name}\n`
                            + `**Revoked by:** ${interaction.user.toString()}\n`
                            + `**Time:** <t:${Math.floor(Date.now() / 1000)}:f>`
                    });
                }
            } catch (error) {
                console.error('Failed to revoke clan role:', error);
                await interaction.reply({
                    content: '❌ Failed to revoke clan role. Please check bot permissions and try again.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } catch (error) {
            console.error('Error in revoke-clan-access command:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}; 