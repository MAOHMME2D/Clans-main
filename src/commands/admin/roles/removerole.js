const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    Client,
    PermissionFlagsBits,
} = require('discord.js');
const Clan = require('../../../models/Clan');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('👑 | إزالة دور مملكة من المستخدم')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('👤 | المستخدم المراد إزالة الدور منه')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('role')
                .setDescription('🎭 | نوع الدور')
                .setRequired(true)
                .addChoices(
                    { name: '👑 Kingdom Leader', value: 'kingdom_leader' },
                    { name: '🤴 Kingdom Assistant', value: 'kingdom_assistant' },
                    { name: '👑 Leader', value: 'leader' },
                    { name: '🤴 Helper', value: 'helper' },
                    { name: '🏰 Kingdom', value: 'kingdom' }
                )
        )
        .addStringOption((option) =>
            option
                .setName('kingdom')
                .setDescription('🏰 | اسم المملكة')
                .setRequired(false)
                .setAutocomplete(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param { AutocompleteInteraction } interaction
     * @param { Client } client
     */
    async autocomplete(interaction, client) {
        const { options } = interaction;
        const focusedValue = options.getFocused();

        try {
            // Get all kingdoms from database
            const kingdoms = await Clan.find({}).limit(25);
            
            const choices = kingdoms.map(kingdom => ({
                name: `🏰 ${kingdom.name}`,
                value: kingdom.name
            }));

            // Filter choices based on user input
            const filtered = choices.filter(choice => 
                choice.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
                choice.value.toLowerCase().includes(focusedValue.toLowerCase())
            );

            await interaction.respond(filtered.slice(0, 25));
        } catch (error) {
            console.error('Error in autocomplete:', error);
            await interaction.respond([]);
        }
    },

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const { options, guild } = interaction;

        const user = options.getUser('user');
        const roleType = options.getString('role');
        const kingdomName = options.getString('kingdom');

        try {
            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            let roleId, roleName;

            // Check if role requires kingdom
            const requiresKingdom = ['kingdom_leader', 'kingdom_assistant'].includes(roleType);

            if (requiresKingdom) {
                if (!kingdomName) {
                    return await interaction.editReply({
                        content: '❌ | يجب تحديد اسم المملكة لهذا الدور!',
                    });
                }

                // Find kingdom in database
                const kingdom = await Clan.findOne({ name: kingdomName });
                
                if (!kingdom) {
                    return await interaction.editReply({
                        content: `❌ | المملكة **${kingdomName}** غير موجودة!`,
                    });
                }

                if (roleType === 'kingdom_leader') {
                    roleId = kingdom.leaderRoleId;
                    roleName = `👑 King ${kingdomName}`;
                } else {
                    roleId = kingdom.assistantRoleId;
                    roleName = `🤴 Prince ${kingdomName}`;
                }
            } else {
                // Handle general roles that take IDs from config
                if (roleType === 'leader') {
                    roleId = config.LEADER_ROLE_ID;
                    roleName = '👑 Leader';
                } else if (roleType === 'helper') {
                    roleId = config.HELPER_ROLE_ID;
                    roleName = '🤴 Helper';
                } else if (roleType === 'kingdom') {
                    roleId = config.KINGDOM_MEMBER_ROLE_ID;
                    roleName = '🏰 Kingdom';
                }
            }

            // Get the role from guild
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                return await interaction.editReply({
                    content: `❌ | الدور **${roleName}** غير موجود!`,
                });
            }

            // Check if user has the role
            const member = guild.members.cache.get(user.id);
            if (!member.roles.cache.has(roleId)) {
                return await interaction.editReply({
                    content: `❌ | المستخدم ${user.toString()} لا يملك دور **${roleName}**!`,
                });
            }

            // Remove role from user
            await member.roles.remove(role);

            await interaction.editReply({
                content: `✅ | تم إزالة دور **${roleName}** من المستخدم ${user.toString()} بنجاح!`,
            });

        } catch (error) {
            console.error('Error removing role:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء إزالة الدور. تأكد من صلاحيات البوت.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء إزالة الدور. تأكد من صلاحيات البوت.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 