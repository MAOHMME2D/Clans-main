const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    ChannelType,
    PermissionFlagsBits,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('🔒 | قفل روم محددة بسهولة')
        .addChannelOption((channel) =>
            channel
                .setName('channel')
                .setDescription('📄 | اختر الروم التي تريد قفلها')
                .addChannelTypes(ChannelType.GuildText)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { options } = interaction;

        const channel = options.getChannel('channel') || interaction.channel;

        try {
            await channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                {
                    SendMessages: false,
                }
            );

            await interaction.reply({
                content: '✅ | **تم قفل الروم بنجاح!** 🔒',
            });
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content:
                    '❌ | حدث خطأ أثناء محاولة قفل الروم. حاول مرة أخرى لاحقًا.',
                ephemeral: true,
            });
        }
    },
};
