import { ButtonInteraction, GuildMember, EmbedBuilder, MessageFlags } from 'discord.js';
import { loadClanConfig } from '../utils/config';
import { ClassKeys, getClassWithEmoji, type ClassName } from '../config/class-emojis';

module.exports = {
    name: 'interactionCreate',
    async execute(interaction: ButtonInteraction) {
        if (!interaction.isButton() || !interaction.customId.startsWith('signup:')) {
            return;
        }

        try {
            const [_, messageId, clanId, selection] = interaction.customId.split(':');
            
            // Verify this button belongs to this specific message
            if (messageId !== interaction.message.id) {
                await interaction.reply({
                    content: '❌ This signup button is from a different message.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            const config = loadClanConfig();
            const clan = config.clans.find(c => c.id === clanId);

            if (!clan) {
                await interaction.reply({
                    content: '❌ Invalid clan signup.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Check if user has the clan role (permission to participate)
            const member = interaction.member as GuildMember;
            if (!member.roles.cache.has(clan.roleId)) {
                await interaction.reply({
                    content: `❌ You must be a member of ${clan.name} to participate in this signup.`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            const userId = interaction.user.id;
            
            // Parse current signups from embed fields
            const currentEmbed = interaction.message.embeds[0];
            const signups = parseSignupsFromFields(currentEmbed.fields);
            
            // Handle toggle behavior
            const currentSelection = signups.get(userId);
            
            if (currentSelection === selection) {
                // User clicked same option - remove their signup
                signups.delete(userId);
                await interaction.reply({
                    content: '✅ Removed your signup.',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                // User selected new option - update their signup
                signups.set(userId, selection as ClassName | 'cant-make-it');
                
                if (selection === 'cant-make-it') {
                    await interaction.reply({
                        content: '✅ Marked as unable to attend.',
                        flags: MessageFlags.Ephemeral
                    });
                } else {
                    await interaction.reply({
                        content: `✅ Signed up as ${getClassWithEmoji(selection as ClassName)}.`,
                        flags: MessageFlags.Ephemeral
                    });
                }
            }

            // Create updated embed
            const updatedEmbed = createSignupEmbed(
                currentEmbed.title || 'Event Signup',
                signups
            );

            await interaction.message.edit({
                embeds: [updatedEmbed]
            });

        } catch (error) {
            console.error('Error handling signup button:', error);
            await interaction.reply({
                content: '❌ Failed to update signup. Please try again.',
                flags: MessageFlags.Ephemeral
            });
        }
    }
};

function parseSignupsFromFields(fields: any[]): Map<string, ClassName | 'cant-make-it'> {
    const signups = new Map<string, ClassName | 'cant-make-it'>();
    
    for (const field of fields) {
        const fieldName = field.name;
        const fieldValue = field.value;
        
        // Skip if no signups in this field
        if (fieldValue === '*No signups*') {
            continue;
        }
        
        // Determine class from field name (strip count info)
        let className: ClassName | 'cant-make-it' | null = null;
        
        if (fieldName.includes("Can't Make It")) {
            className = 'cant-make-it';
        } else {
            // Find which class this field represents
            for (const classKey of ClassKeys) {
                if (fieldName.includes(getClassWithEmoji(classKey))) {
                    className = classKey;
                    break;
                }
            }
        }
        
        if (className) {
            // Extract user IDs from mentions in field value
            const userMatches = fieldValue.match(/<@(\d+)>/g);
            if (userMatches) {
                for (const userMatch of userMatches) {
                    const userId = userMatch.match(/<@(\d+)>/)?.[1];
                    if (userId) {
                        signups.set(userId, className);
                    }
                }
            }
        }
    }
    
    return signups;
}

function createSignupEmbed(title: string, signups: Map<string, ClassName | 'cant-make-it'>): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x00ff00)
        .setTimestamp();

    // Build all render arrays and count as we go
    let totalAttending = 0;

    // Add all class fields (always visible)
    ClassKeys.forEach(className => {
        const classMembers: string[] = [];
        for (const [userId, selectedClass] of signups.entries()) {
            if (selectedClass === className) {
                classMembers.push(`<@${userId}>`);
            }
        }
        
        // Count attending users as we build the arrays
        totalAttending += classMembers.length;
        
        embed.addFields({
            name: `${getClassWithEmoji(className)} (${classMembers.length})`,
            value: classMembers.length > 0 ? classMembers.join('\n') : '*No signups*',
            inline: true
        });
    });

    // Add "Can't make it" field
    const cantMakeIt: string[] = [];
    for (const [userId, selectedClass] of signups.entries()) {
        if (selectedClass === 'cant-make-it') {
            cantMakeIt.push(`<@${userId}>`);
        }
    }
    
    embed.addFields({
        name: `❌ Can't Make It (${cantMakeIt.length})`,
        value: cantMakeIt.length > 0 ? cantMakeIt.join('\n') : '*No signups*',
        inline: true
    });

    // Count what we actually rendered
    embed.setFooter({
        text: `📊 ${totalAttending} attending • ${cantMakeIt.length} can't make it`
    });

    return embed;
} 