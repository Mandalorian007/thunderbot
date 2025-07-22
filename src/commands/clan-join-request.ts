import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    GuildMember
} from 'discord.js';
import { loadClanConfig } from '../utils/config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan-join-request')
        .setDescription('Request to join a clan')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan you want to join')
                .setRequired(true)
                .addChoices(...loadClanConfig().clans.map(clan => ({
                    name: `${clan.name}`,
                    value: clan.id
                })))
        )
        .addStringOption(option =>
            option.setName('ign')
                .setDescription('Your in-game name')
                .setRequired(true)
                .setMinLength(3)
                .setMaxLength(32)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const clanId = interaction.options.getString('clan', true);
            const ign = interaction.options.getString('ign', true);
            const config = loadClanConfig();
            const clan = config.clans.find(c => c.id === clanId);

            if (!clan) {
                await interaction.reply({
                    content: '❌ Invalid clan selected.'
                });
                return;
            }

            // Check if user already has the clan role
            const member = interaction.member as GuildMember;
            if (member.roles.cache.has(clan.roleId)) {
                await interaction.reply({
                    content: `❌ You are already a member of ${clan.name}.`
                });
                return;
            }

            // Get the approval channel
            try {
                const approvalChannel = await interaction.guild?.channels.fetch(clan.approvalChannelId);
                if (!approvalChannel?.isTextBased()) {
                    await interaction.reply({
                        content: '❌ Could not find the approval channel. Please contact an administrator.'
                    });
                    return;
                }

                // Create approve/deny buttons
                const buttons = new ActionRowBuilder<MessageActionRowComponentBuilder>()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`cr:${interaction.user.id}:${clan.id}:a`)
                            .setLabel('✅ Approve')
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId(`cr:${interaction.user.id}:${clan.id}:d`)
                            .setLabel('❌ Deny')
                            .setStyle(ButtonStyle.Danger)
                    );

                // Send approval request with all context
                await approvalChannel.send({
                    content: `**🔔 Clan Join Request**\n\n`
                        + `**From:** <@${interaction.user.id}>\n`
                        + `**IGN:** ${ign}\n`
                        + `**Requested:** <t:${Math.floor(Date.now() / 1000)}:f>\n`
                        + `<@&${clan.approverRoleId}> Please review this request using the buttons below.`,
                    components: [buttons]
                });

                // Simple acknowledgment
                await interaction.reply({
                    content: `✅ Your request to join ${clan.name} has been submitted for review.`
                });

            } catch (error) {
                console.error('Error processing clan join request:', error);
                await interaction.reply({
                    content: '❌ Failed to process your request. Please try again later.'
                });
            }
        } catch (error) {
            console.error('Error processing clan join request:', error);
            await interaction.reply({
                content: '❌ Failed to process your request. Please try again later.'
            });
        }
    }
}; 