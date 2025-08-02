const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
} = require('discord.js');
const Clan = require('../../../models/Clan');
const utils = require('../../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removemember')
        .setDescription('➖ | إزالة عضو من مملكة')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('👤 | المستخدم المراد إزالته')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('kingdom')
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
                console.error('Error handling removemember autocomplete:', error);
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

        const user = options.getUser('user');
        const kingdomName = options.getString('kingdom');

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

            // Check if user is a member
            if (!kingdom.members.includes(user.id)) {
                return await interaction.editReply({
                    content: '❌ | المستخدم ليس عضواً في هذه المملكة!',
                });
            }

            // Remove user from kingdom members
            kingdom.members = kingdom.members.filter(memberId => memberId !== user.id);
            await kingdom.save();

            // Remove kingdom role from user if it exists
            const kingdomRole = guild.roles.cache.get(kingdom.roleId);
            if (kingdomRole) {
                await guild.members.cache.get(user.id).roles.remove(kingdomRole);
            }

            await interaction.editReply({
                content: `✅ | تم إزالة ${user.toString()} من مملكة **${kingdomName}** بنجاح!`,
            });

        } catch (error) {
            console.error('Error removing member:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء إزالة العضو.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء إزالة العضو.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 