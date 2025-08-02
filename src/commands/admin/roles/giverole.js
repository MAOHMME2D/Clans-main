const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    Client,
    PermissionFlagsBits,
} = require('discord.js');
const config = require('../../../config');
const Clan = require('../../../models/Clan');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('👑 | منح دور مملكة للمستخدم')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('👤 | المستخدم المراد منحه الدور')
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

            // Check if role type requires kingdom
            const requiresKingdom = ['kingdom_leader', 'kingdom_assistant'].includes(roleType);
            let kingdom = null;
            
            if (requiresKingdom) {
                if (!kingdomName) {
                    return await interaction.editReply({
                        content: `❌ | يجب تحديد اسم المملكة لهذا النوع من الرتب!`,
                    });
                }

                // Find kingdom in database
                kingdom = await Clan.findOne({ name: kingdomName });
                
                if (!kingdom) {
                    return await interaction.editReply({
                        content: `❌ | المملكة **${kingdomName}** غير موجودة!`,
                    });
                }

                // Check if user is a member of the kingdom
                const member = guild.members.cache.get(user.id);
                const kingdomRole = guild.roles.cache.get(kingdom.roleId);
                
                if (!kingdomRole) {
                    return await interaction.editReply({
                        content: `❌ | دور المملكة **${kingdomName}** غير موجود!`,
                    });
                }

                if (!member.roles.cache.has(kingdom.roleId)) {
                    return await interaction.editReply({
                        content: `❌ | المستخدم **${user.toString()}** ليس عضو في المملكة **${kingdomName}**!\nيجب أن يكون العضو في المملكة أولاً قبل إعطائه رتبة قائد أو مساعد.`,
                    });
                }
            }

            let roleId, roleName;

            if (roleType === 'kingdom_leader') {
                roleId = kingdom.leaderRoleId;
                roleName = `👑 King ${kingdomName}`;
            } else if (roleType === 'kingdom_assistant') {
                roleId = kingdom.assistantRoleId;
                roleName = `🤴 Prince ${kingdomName}`;
            } else if (roleType === 'leader') {
                roleId = config.LEADER_ROLE_ID;
                roleName = '👑 Leader';
            } else if (roleType === 'helper') {
                roleId = config.HELPER_ROLE_ID;
                roleName = '🤴 Helper';
            } else if (roleType === 'kingdom') {
                roleId = config.KINGDOM_MEMBER_ROLE_ID;
                roleName = '🏰 Kingdom';
            } else {
                return await interaction.editReply({
                    content: '❌ | نوع الدور غير صحيح!',
                });
            }

            // Get the role from guild
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                return await interaction.editReply({
                    content: `❌ | الدور **${roleName}** غير موجود! تأكد من إنشاء الدور أولاً.`,
                });
            }

            // Add role to user
            await guild.members.cache.get(user.id).roles.add(role);

            await interaction.editReply({
                content: `✅ | تم منح دور **${roleName}** للمستخدم ${user.toString()} بنجاح!`,
            });

        } catch (error) {
            console.error('Error giving role:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء منح الدور. تأكد من صلاحيات البوت.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء منح الدور. تأكد من صلاحيات البوت.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 