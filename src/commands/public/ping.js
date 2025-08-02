const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Displays Bot Response and Performance Metrics.'),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const ping = Date.now() - interaction.createdTimestamp;
        const apiPing = client.ws.ping;

        const embed = new EmbedBuilder()
            .setColor('#6769c2')
            .setTitle('🏓 Pong!')
            .setDescription(
                'إليك الرد من الروبوت، بالإضافة إلى بعض إحصائيات الأداء.'
            )
            .addFields(
                { name: 'Bot Latency', value: `**${ping}**ms`, inline: true },
                { name: 'API Latency', value: `**${apiPing}**ms`, inline: true }
            )
            .setThumbnail(client.user.avatarURL())
            .setFooter({ text: 'Have A Good Time ❤️' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
