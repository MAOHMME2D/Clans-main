const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
    EmbedBuilder,
} = require('discord.js');
const Clan = require('../../../models/Clan');
const utils = require('../../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kingdominfo')
        .setDescription('🏰 | عرض معلومات المملكة')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('🏰 | اسم المملكة')
                .setAutocomplete(true)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async autocomplete(interaction) {
        const { name, value } = interaction.options.getFocused(true);

        if (name === 'name') {
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
                console.error('Error handling kingdominfo autocomplete:', error);
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

        const kingdomName = options.getString('name');

        try {
            // Find the kingdom
            const kingdom = await Clan.findOne({ name: kingdomName });
            if (!kingdom) {
                return await interaction.reply({
                    content: '❌ | المملكة غير موجودة!',
                    ephemeral: true,
                });
            }

            // Get kingdom role and category
            const kingdomRole = guild.roles.cache.get(kingdom.roleId);
            const kingdomCategory = guild.channels.cache.get(kingdom.categoryId);
            const castleChannel = guild.channels.cache.get(kingdom.castleChannelId);

            // Get leader info
            const leader = await client.users.fetch(kingdom.leaderId);
            const leaderMember = guild.members.cache.get(kingdom.leaderId);

            // Get all channels in the category
            const categoryChannels = guild.channels.cache.filter(channel => 
                channel.parentId === kingdom.categoryId
            );

            // Create embed
            const embed = new EmbedBuilder()
                .setTitle(`🏰 مملكة ${kingdomName}`)
                .setColor(0x9B59B6)
                .addFields(
                    { name: '👑 القائد', value: leader ? `${leader.toString()} (${leader.tag})` : 'غير معروف', inline: true },
                    { name: '📅 تاريخ الإنشاء', value: `<t:${Math.floor(kingdom.createdAt.getTime() / 1000)}:F>`, inline: true },
                    { name: '👥 عدد الأعضاء', value: kingdom.members.length.toString(), inline: true },
                    { name: '🎭 الدور', value: kingdomRole ? kingdomRole.toString() : 'غير موجود', inline: true },
                    { name: '📁 الكاتيجوري', value: kingdomCategory ? kingdomCategory.toString() : 'غير موجودة', inline: true },
                    { name: '💬 القناة الرئيسية', value: castleChannel ? castleChannel.toString() : 'غير موجودة', inline: true }
                )
                .setTimestamp();

            // Add channels list
            if (categoryChannels.size > 0) {
                const channelsList = categoryChannels.map(channel => {
                    const typeIcon = channel.type === 0 ? '💬' : channel.type === 2 ? '🎤' : channel.type === 5 ? '📢' : '📺';
                    return `${typeIcon} ${channel.toString()}`;
                }).join('\n');

                embed.addFields({
                    name: `📺 القنوات (${categoryChannels.size})`,
                    value: channelsList,
                    inline: false
                });
            }

            // Add members list if not too many
            if (kingdom.members.length > 0) {
                const membersList = [];
                for (const memberId of kingdom.members.slice(0, 10)) {
                    const member = await client.users.fetch(memberId);
                    if (member) {
                        const isLeader = memberId === kingdom.leaderId;
                        membersList.push(`${isLeader ? '👑' : '👤'} ${member.toString()} (${member.tag})`);
                    }
                }

                let membersField = membersList.join('\n');
                if (kingdom.members.length > 10) {
                    membersField += `\n... و ${kingdom.members.length - 10} عضو آخر`;
                }

                embed.addFields({
                    name: `👥 الأعضاء (${kingdom.members.length})`,
                    value: membersField,
                    inline: false
                });
            }

            await interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });

        } catch (error) {
            console.error('Error getting kingdom info:', error);
            await interaction.reply({
                content: '❌ | حدث خطأ أثناء جلب معلومات المملكة.',
                ephemeral: true,
            });
        }
    },
}; 