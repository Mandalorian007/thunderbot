import { Events, GuildMember, EmbedBuilder, TextChannel } from "discord.js";

const WELCOME_CHANNEL_ID = "1124734775027060806";
const WELCOME_IMAGE_URL = "https://raw.githubusercontent.com/Mandalorian007/thunderbot/main/assets/thunderclap-welcome.png";

module.exports = {
	name: Events.GuildMemberAdd,
	once: false,
	async execute(member: GuildMember) {
		console.log(`New member joined: ${member.user.tag}`);

		try {
			const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID) as TextChannel;
			if (!channel) {
				console.error(`Welcome channel not found: ${WELCOME_CHANNEL_ID}`);
				return;
			}

			const embed = new EmbedBuilder()
				.setColor(0x5865f2)
				.setTitle("Welcome to ThunderClap Gaming!")
				.setDescription(
					`Hey ${member}, we're glad you're here!\n\n` +
					`Please take a moment to read our rules and be respectful to fellow members.\n\n` +
					`Looking to join a clan? Head over to <#1397336627327537349> to get started!`
				)
				.setThumbnail(member.user.displayAvatarURL({ size: 256 }))
				.setImage(WELCOME_IMAGE_URL)
				.setFooter({ text: `Member #${member.guild.memberCount}` })
				.setTimestamp();

			await channel.send({ embeds: [embed] });
		} catch (error) {
			console.error("Error sending welcome message:", error);
		}
	},
};
