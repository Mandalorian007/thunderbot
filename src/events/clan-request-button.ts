import { Events, Interaction, MessageFlags } from "discord.js";
import { loadClanConfig } from "../utils/config";

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith('cr:')) return;

        try {
            console.log(`Processing clan request button interaction: ${interaction.customId}`);
            const [prefix, userId, clanId, action] = interaction.customId.split(':');
            
            if (!userId || !clanId || !action) {
                console.error(`Invalid button custom ID format: ${interaction.customId}`);
                await interaction.reply({
                    content: 'Invalid request data.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Load clan configuration
            const config = loadClanConfig();
            const clan = config.clans.find(c => c.id === clanId);
            if (!clan) {
                console.error(`No clan found with ID: ${clanId}`);
                await interaction.reply({
                    content: 'Clan configuration not found.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            if (!interaction.guild) {
                console.error('Button interaction was not used in a guild');
                await interaction.reply({
                    content: 'This action can only be performed in a server.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Verify approver has permission
            let member;
            try {
                member = await interaction.guild.members.fetch({
                    user: interaction.user.id,
                    force: true
                });
                console.log(`Successfully fetched approver member: ${member.user.tag}`);
            } catch (error) {
                console.error('Failed to fetch approver member:', {
                    error,
                    userId: interaction.user.id,
                    guildId: interaction.guild.id
                });
                await interaction.reply({
                    content: 'Failed to verify your permissions. Please try again.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            if (!member.roles.cache.has(clan.approverRoleId)) {
                console.warn(`Unauthorized approval attempt by ${interaction.user.tag} for clan ${clan.name}`);
                await interaction.reply({
                    content: 'You do not have permission to handle this request.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Get the requesting user
            let requestingUser;
            try {
                requestingUser = await interaction.guild.members.fetch({
                    user: userId,
                    force: true
                });
                console.log(`Successfully fetched requesting user: ${requestingUser.user.tag}`);
            } catch (error) {
                console.error('Failed to fetch requesting user:', {
                    error,
                    userId,
                    guildId: interaction.guild.id
                });
                await interaction.reply({
                    content: 'Requesting user not found. They may have left the server.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            console.log(`Processing ${action === 'a' ? 'acceptance' : 'denial'} for user ${requestingUser.user.tag} to clan ${clan.name}`);

            // Handle the request
            if (action === 'a') {
                try {
                    await requestingUser.roles.add(clan.roleId);
                    console.log(`Successfully added role ${clan.roleId} to user ${requestingUser.user.tag}`);
                } catch (error) {
                    console.error('Failed to add role:', {
                        error,
                        userId: requestingUser.id,
                        roleId: clan.roleId,
                        clanName: clan.name
                    });
                    await interaction.reply({
                        content: 'Failed to add clan role. Please check bot permissions and try again.',
                        flags: MessageFlags.Ephemeral
                    });
                    return;
                }
            }

            // First, reply to the interaction
            await interaction.reply({
                content: `You have ${action === 'a' ? 'accepted' : 'denied'} the request for <@${requestingUser.id}> to join ${clan.name}.`,
                flags: MessageFlags.Ephemeral
            });

            // Update the original message
            try {
                const message = interaction.message;
                await message.edit({
                    content: `${interaction.message.content}\n\n${action === 'a' ? '✅ Accepted' : '❌ Denied'} by <@${interaction.user.id}>`,
                    components: [] // Remove the buttons
                });
            } catch (error) {
                console.error('Failed to update approval message:', error);
            }

            // Notify the requesting user
            const notificationContent = `**Your clan request has been ${action === 'a' ? 'accepted ✅' : 'denied ❌'}**\n\n`
                + `**Clan:** ${clan.name}\n`
                + `**Status:** ${action === 'a' ? 'Accepted - Welcome to the clan!' : 'Denied - Please contact clan leadership for more information.'}\n`
                + `**Processed by:** <@${interaction.user.id}>`;

            try {
                // Send notification via DM
                const dmChannel = await requestingUser.createDM();
                await dmChannel.send({ content: notificationContent });
            } catch (error) {
                console.error('Failed to send DM to user:', error);
            }

        } catch (error) {
            console.error('Unexpected error handling clan request button:', {
                error,
                customId: interaction.customId,
                userId: interaction.user.id,
                channelId: interaction.channelId
            });
            await interaction.reply({
                content: 'There was an error processing this request. Please try again later.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
}; 