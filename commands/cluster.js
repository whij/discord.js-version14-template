const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cluster')
		.setDescription('Shows Bot System Information')
		.addBooleanOption(option =>
			option.setName('ephemeral')
				.setDescription('Whether to hide the reply or not {By Default True}')),
	async execute(interaction) {
		// Parse the command
		const ephemeralOption = await interaction.options.getBoolean('ephemeral') ?? true;

		interaction.client.cluster.broadcastEval(client => [client.cluster.id, client.guilds.cache.size, client.ws.ping, client.uptime])
			.then((results) => {
				const Lembed = new EmbedBuilder()
					.setTitle('👨‍💻 Bot Clusters')
					.setColor('#ccd6dd')
					.setAuthor({ name: `You're on Cluster ${interaction.client.cluster.id}!` })
					.setThumbnail(`${interaction.client.user.displayAvatarURL()}`)
					.setFooter({ 'text': `Requested by ${interaction.user.username}#${interaction.user.discriminator}`, iconURL: `${interaction.user.displayAvatarURL()}` })
					.setTimestamp();

				results.map((data) => {
					let totalSeconds = (data[3] / 1000);
					const days = Math.floor(totalSeconds / 86400);
					totalSeconds %= 86400;
					const hours = Math.floor(totalSeconds / 3600);
					totalSeconds %= 3600;
					const minutes = Math.floor(totalSeconds / 60);
					const seconds = Math.floor(totalSeconds % 60);

					Lembed.addFields(
						{ name: `🐝 Cluster #${data[0]}`, value: `Guilds: ${data[1]}\nPing: ${data[2]}\nUptime: ${days}D ${hours}H ${minutes}m ${seconds}s`, inline: true },
					);
				});

				interaction.reply({ embeds: [Lembed], ephemeral: ephemeralOption });
			});
	},
};