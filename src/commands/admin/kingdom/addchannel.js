const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');
const Clan = require('../../../models/Clan');
const utils = require('../../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addchannel')
        .setDescription('➕ | إضافة قناة جديدة للمملكة')
        .addStringOption((option) =>
            option
                .setName('kingdom')
                .setDescription('🏰 | اسم المملكة')
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('📝 | اسم القناة')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('🎯 | نوع القناة')
                .setRequired(true)
                .addChoices(
                    { name: '💬 نصية', value: 'text' },
                    { name: '🎤 صوتية', value: 'voice' },
                    { name: '📢 إعلانات', value: 'announcement' }
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async autocomplete(interaction) {
        const { name, value } = interaction.options.getFocused(true);

        if (name === 'kingdom') {
            try {
                const kingdomNames = await utils.getAllKingdomNames();
                
                // Filter kingdoms based on user input
                const filteredKingdoms = kingdomNames.filter(kingdomName => 
                    kingdomName.toLowerCase().includes(value.toLowerCase())
                );

                // Limit to 25 suggestions (Discord limit)
                const suggestions = filteredKingdoms.slice(0, 25).map(kingdomName => ({
                    name: `🏰 ${kingdomName}`,
                    value: kingdomName
                }));

                return interaction.respond(suggestions);
            } catch (error) {
                console.error('Error handling addchannel autocomplete:', error);
                return interaction.respond([]);
            }
        }
    },

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const { options, guild } = interaction;

        const kingdomName = options.getString('kingdom');
        const channelName = options.getString('name');
        const channelType = options.getString('type');

        try {
            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            // Find the kingdom
            const kingdom = await Clan.findOne({ name: kingdomName });
            if (!kingdom) {
                return await interaction.editReply({
                    content: '❌ | المملكة غير موجودة!',
                });
            }

            // Get kingdom role and category
            const kingdomRole = guild.roles.cache.get(kingdom.roleId);
            const kingdomCategory = guild.channels.cache.get(kingdom.categoryId);

            if (!kingdomRole || !kingdomCategory) {
                return await interaction.editReply({
                    content: '❌ | دور أو كاتيجوري المملكة غير موجودة!',
                });
            }

            // Create channel based on type
            let newChannel;
            const channelTypeMap = {
                'text': ChannelType.GuildText,
                'voice': ChannelType.GuildVoice,
                'announcement': ChannelType.GuildAnnouncement
            };

            const channelConfig = {
                name: channelName,
                type: channelTypeMap[channelType],
                parent: kingdomCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: kingdomRole.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            };

            // Add specific permissions based on channel type
            if (channelType === 'voice') {
                channelConfig.permissionOverwrites[1].allow.push(PermissionFlagsBits.Connect, PermissionFlagsBits.Speak);
                channelConfig.permissionOverwrites[0].deny.push(PermissionFlagsBits.Connect);
            } else if (channelType === 'announcement') {
                channelConfig.permissionOverwrites[1].allow.push(PermissionFlagsBits.ManageMessages);
            }

            newChannel = await guild.channels.create(channelConfig);

            await interaction.editReply({
                content: `✅ | تم إنشاء قناة **${channelName}** في مملكة **${kingdomName}** بنجاح!\n` +
                        `📺 القناة: ${newChannel.toString()}\n` +
                        `🎯 النوع: ${channelType === 'text' ? '💬 نصية' : channelType === 'voice' ? '🎤 صوتية' : '📢 إعلانات'}`,
            });

        } catch (error) {
            console.error('Error adding channel:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء إنشاء القناة. تأكد من صلاحيات البوت.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء إنشاء القناة. تأكد من صلاحيات البوت.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 