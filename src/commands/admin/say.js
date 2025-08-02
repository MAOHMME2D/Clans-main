const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('📢 | ارسال رسالة بالسيرفر على هيئة بوت')
        .addStringOption((option) =>
            option
                .setName('message')
                .setDescription('📄 | اكتب رسالة')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const { options } = interaction;

        const message = options.getString('message');

        // دعم \n كسطر جديد
        const formattedMessage = message.replace(/\\n/g, '\n');

        await interaction.reply({
            content: '✅ | تم ارسال الرسالة بنجاح!',
            ephemeral: true,
        });

        await interaction.channel.send({ content: formattedMessage });
    },
};
