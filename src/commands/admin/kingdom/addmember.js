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
        .setName('addmember')
        .setDescription('➕ | إضافة عضو إلى مملكة')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('👤 | المستخدم المراد إضافته')
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
                console.error('Error handling addmember autocomplete:', error);
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

            // Check if user is already a member
            if (kingdom.members.includes(user.id)) {
                return await interaction.editReply({
                    content: '❌ | المستخدم عضو بالفعل في هذه المملكة!',
                });
            }

            // Add user to kingdom members
            kingdom.members.push(user.id);
            await kingdom.save();

            // Add kingdom role to user if it exists
            const kingdomRole = guild.roles.cache.get(kingdom.roleId);
            if (kingdomRole) {
                await guild.members.cache.get(user.id).roles.add(kingdomRole);
            }

            await interaction.editReply({
                content: `✅ | تم إضافة ${user.toString()} إلى مملكة **${kingdomName}** بنجاح!`,
            });

        } catch (error) {
            console.error('Error adding member:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء إضافة العضو.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء إضافة العضو.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 