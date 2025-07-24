import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    MessageActionRowComponentBuilder,
    EmbedBuilder,
    GuildMember
} from 'discord.js';
import { loadClanConfig } from '../utils/config';
import { ClassKeys, getClassWithEmoji, ClassEmojis } from '../config/class-emojis';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('di-clan-signup')
        .setDescription('Create a clan event signup')
        .addStringOption(option =>
            option.setName('clan')
                .setDescription('Select the clan for this signup')
                .setRequired(true)
                .addChoices(...loadClanConfig().clans.map(clan => ({
                    name: clan.name,
                    value: clan.id
                })))
        )
        .addStringOption(option =>
            option.setName('event')
                .setDescription('Event name/description')
                .setRequired(true)
                .setMaxLength(100)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        try {
            const clanId = interaction.options.getString('clan', true);
            const eventName = interaction.options.getString('event', true);
            const config = loadClanConfig();
            const clan = config.clans.find(c => c.id === clanId);

            if (!clan) {
                await interaction.reply({
                    content: '❌ Invalid clan selected.',
                    ephemeral: true
                });
                return;
            }

            // Check if user has approver role for this clan
            const member = interaction.member as GuildMember;
            if (!member.roles.cache.has(clan.approverRoleId)) {
                await interaction.reply({
                    content: `❌ You don't have permission to create signups for ${clan.name}.`,
                    ephemeral: true
                });
                return;
            }

            // Create initial embed with all class fields
            const embed = new EmbedBuilder()
                .setTitle(`${clan.name} - ${eventName}`)
                .setColor(0x00ff00)
                .setTimestamp();

            // Add all class fields (always visible, even when empty)
            ClassKeys.forEach(className => {
                embed.addFields({
                    name: `${getClassWithEmoji(className)} (0)`,
                    value: '*No signups*',
                    inline: true
                });
            });

            // Add "Can't make it" field
            embed.addFields({
                name: '❌ Can\'t Make It (0)',
                value: '*No signups*',
                inline: true
            });

            // Send initial message to get the message ID
            const response = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            // Create class selection buttons (3 rows of buttons) with unique message ID
            const classButtons1 = new ActionRowBuilder<MessageActionRowComponentBuilder>();
            const classButtons2 = new ActionRowBuilder<MessageActionRowComponentBuilder>();
            const classButtons3 = new ActionRowBuilder<MessageActionRowComponentBuilder>();

            // Class abbreviations for buttons
            const classAbbreviations: Record<string, string> = {
                barbarian: 'BARB',
                bloodknight: 'BK',
                crusader: 'CRUS',
                demonhunter: 'DH',
                druid: 'DRU',
                monk: 'MONK',
                necromancer: 'NECR',
                tempest: 'TEMP',
                wizard: 'WIZ'
            };

            // Split classes into rows (3-3-3) - emoji + abbreviation
            ClassKeys.forEach((className, index) => {
                // Extract emoji ID from the emoji string for proper button display
                const emojiMatch = ClassEmojis[className].match(/:(\w+):(\d+)>/);
                const button = new ButtonBuilder()
                    .setCustomId(`signup:${response.id}:${clanId}:${className}`)
                    .setLabel(classAbbreviations[className])
                    .setStyle(ButtonStyle.Secondary);
                
                if (emojiMatch) {
                    button.setEmoji({
                        name: emojiMatch[1],
                        id: emojiMatch[2]
                    });
                }

                if (index < 3) {
                    classButtons1.addComponents(button);
                } else if (index < 6) {
                    classButtons2.addComponents(button);
                } else {
                    classButtons3.addComponents(button);
                }
            });

            // Add "Can't make it" button to the third row
            const cantMakeItButton = new ButtonBuilder()
                .setCustomId(`signup:${response.id}:${clanId}:cant-make-it`)
                .setLabel('CAN\'T GO')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Secondary);

            classButtons3.addComponents(cantMakeItButton);

            // Update the message with components now that we have the message ID
            await response.edit({
                embeds: [embed],
                components: [classButtons1, classButtons2, classButtons3]
            });

        } catch (error) {
            console.error('Error creating clan signup:', error);
            await interaction.reply({
                content: '❌ Failed to create signup. Please try again later.',
                ephemeral: true
            });
        }
    }
}; 