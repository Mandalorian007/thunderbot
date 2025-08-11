import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    GuildMember,
    EmbedBuilder
} from 'discord.js';
import { loadClanConfig } from '../utils/config';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clan-leave')
        .setDescription('Leave a clan you\'re currently in')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('The clan you want to leave')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async autocomplete(interaction: AutocompleteInteraction) {
        try {
            // Fetch the member with roles to ensure we have complete data
            const guild = interaction.guild;
            if (!guild || !interaction.user) {
                await interaction.respond([]);
                return;
            }

            const member = await guild.members.fetch(interaction.user.id).catch(() => null);
            if (!member) {
                await interaction.respond([]);
                return;
            }

            const config = loadClanConfig();
            console.log('Available clans:', config.clans.map(c => ({ name: c.name, id: c.id, roleId: c.roleId })));
            console.log('User roles:', Array.from(member.roles.cache.keys()));
            
            const userClans = config.clans.filter(clan => {
                const hasRole = member.roles.cache.has(clan.roleId);
                console.log(`Checking clan ${clan.name} (roleId: ${clan.roleId}): ${hasRole}`);
                return hasRole;
            });

            console.log('Filtered user clans:', userClans.map(c => c.name));

            if (userClans.length === 0) {
                await interaction.respond([
                    { name: 'You are not currently in any clans', value: 'none' }
                ]);
                return;
            }

            const choices = userClans.map(clan => ({
                name: clan.name,
                value: clan.id
            }));

            await interaction.respond(choices);
        } catch (error) {
            console.error('Error in clan-leave autocomplete:', error);
            await interaction.respond([]);
        }
    },

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const clanId = interaction.options.getString('clan', true);
            const member = interaction.member as GuildMember;

            if (!member) {
                await interaction.reply({
                    content: '❌ Failed to fetch your member information.'
                });
                return;
            }

            // Handle the "none" case from autocomplete
            if (clanId === 'none') {
                await interaction.reply({
                    content: '❌ You are not currently in any clans.'
                });
                return;
            }

            const config = loadClanConfig();
            const clan = config.clans.find(c => c.id === clanId);

            if (!clan) {
                await interaction.reply({
                    content: '❌ Invalid clan selected.'
                });
                return;
            }

            // Check if user actually has the clan role
            if (!member.roles.cache.has(clan.roleId)) {
                await interaction.reply({
                    content: `❌ You are not currently a member of ${clan.name}.`
                });
                return;
            }

            // Remove the clan role
            await member.roles.remove(clan.roleId);

            // Send success message to user
            await interaction.reply({
                content: `✅ You have successfully left **${clan.name}**.`
            });

            // Send notification to clan's approval channel
            const approvalChannel = interaction.guild?.channels.cache.get(clan.approvalChannelId);
            if (approvalChannel && approvalChannel.isTextBased()) {
                const notificationEmbed = new EmbedBuilder()
                    .setTitle('📤 Member Left Clan')
                    .setDescription(`${member.user.username} has left **${clan.name}**`)
                    .addFields(
                        { name: 'User', value: `<@${member.user.id}>`, inline: true },
                        { name: 'Clan', value: clan.name, inline: true },
                        { name: 'Action', value: 'Left voluntarily', inline: true }
                    )
                    .setColor(0xffa500) // Orange color for departures
                    .setTimestamp();

                await approvalChannel.send({ embeds: [notificationEmbed] });
            }

        } catch (error) {
            console.error('Error executing clan-leave command:', error);
            await interaction.reply({
                content: '❌ Failed to leave clan. Please try again later.'
            });
        }
    }
};