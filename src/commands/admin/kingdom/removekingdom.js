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
        .setName('removekingdom')
        .setDescription('🗑️ | حذف مملكة')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('🏰 | اسم المملكة المراد حذفها')
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
                console.error('Error handling removekingdom autocomplete:', error);
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
            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            // Find the kingdom
            const kingdom = await Clan.findOne({ name: kingdomName });
            if (!kingdom) {
                return await interaction.editReply({
                    content: '❌ | المملكة غير موجودة!',
                });
            }

            let deletedItems = [];

            // Remove kingdom member role from all members
            const kingdomRole = guild.roles.cache.get(kingdom.roleId);
            if (kingdomRole) {
                try {
                    for (const memberId of kingdom.members) {
                        const member = guild.members.cache.get(memberId);
                        if (member) {
                            await member.roles.remove(kingdomRole);
                        }
                    }
                    deletedItems.push('دور العضو من جميع الأعضاء');
                } catch (error) {
                    console.error('Error removing member role from members:', error);
                }
            }

            // Remove kingdom leader role from all members
            const leaderRole = guild.roles.cache.get(kingdom.leaderRoleId);
            if (leaderRole) {
                try {
                    const membersWithLeaderRole = guild.members.cache.filter(member => 
                        member.roles.cache.has(kingdom.leaderRoleId)
                    );
                    
                    for (const [memberId, member] of membersWithLeaderRole) {
                        await member.roles.remove(leaderRole);
                    }
                    deletedItems.push(`King Role (${membersWithLeaderRole.size} members)`);
                } catch (error) {
                    console.error('Error removing leader role from members:', error);
                }
            }

            // Remove kingdom assistant role from all members
            const assistantRole = guild.roles.cache.get(kingdom.assistantRoleId);
            if (assistantRole) {
                try {
                    const membersWithAssistantRole = guild.members.cache.filter(member => 
                        member.roles.cache.has(kingdom.assistantRoleId)
                    );
                    
                    for (const [memberId, member] of membersWithAssistantRole) {
                        await member.roles.remove(assistantRole);
                    }
                    deletedItems.push(`Prince Role (${membersWithAssistantRole.size} members)`);
                } catch (error) {
                    console.error('Error removing assistant role from members:', error);
                }
            }

            // Delete kingdom member role
            if (kingdomRole) {
                try {
                    await kingdomRole.delete('Kingdom removal');
                    deletedItems.push('Kingdom Member Role');
                } catch (error) {
                    console.error('Error deleting kingdom member role:', error);
                    deletedItems.push('دور العضو (فشل في الحذف)');
                }
            }

            // Delete kingdom leader role
            if (leaderRole) {
                try {
                    await leaderRole.delete('Kingdom removal');
                    deletedItems.push('King Role');
                } catch (error) {
                    console.error('Error deleting kingdom leader role:', error);
                    deletedItems.push('دور الملك (فشل في الحذف)');
                }
            }

            // Delete kingdom assistant role
            if (assistantRole) {
                try {
                    await assistantRole.delete('Kingdom removal');
                    deletedItems.push('Prince Role');
                } catch (error) {
                    console.error('Error deleting kingdom assistant role:', error);
                    deletedItems.push('دور الأمير (فشل في الحذف)');
                }
            }

            // Delete castle channel
            const castleChannel = guild.channels.cache.get(kingdom.castleChannelId);
            if (castleChannel) {
                try {
                    await castleChannel.delete('Kingdom removal');
                    deletedItems.push('قناة القلعة');
                } catch (error) {
                    console.error('Error deleting castle channel:', error);
                }
            }

            // Delete category and all its channels
            const kingdomCategory = guild.channels.cache.get(kingdom.categoryId);
            if (kingdomCategory) {
                try {
                    // Delete all channels in the category first
                    const categoryChannels = guild.channels.cache.filter(channel => 
                        channel.parentId === kingdom.categoryId
                    );
                    
                    for (const [channelId, channel] of categoryChannels) {
                        try {
                            await channel.delete('Kingdom removal');
                        } catch (error) {
                            console.error(`Error deleting channel ${channelId}:`, error);
                        }
                    }

                    // Delete the category itself
                    await kingdomCategory.delete('Kingdom removal');
                    deletedItems.push('الكاتيجوري وجميع القنوات');
                } catch (error) {
                    console.error('Error deleting category:', error);
                }
            }

            // Delete kingdom from database
            try {
                await Clan.findByIdAndDelete(kingdom._id);
                deletedItems.push('البيانات من قاعدة البيانات');
            } catch (error) {
                console.error('Error deleting from database:', error);
            }

            const deletedItemsText = deletedItems.length > 0 ? deletedItems.join(', ') : 'لا شيء';

            // Check if interaction is still valid before editing reply
            if (interaction.deferred && !interaction.replied) {
                try {
                    await interaction.editReply({
                        content: `✅ | تم حذف مملكة **${kingdomName}** بنجاح!\n` +
                                `🗑️ تم حذف: ${deletedItemsText}`,
                    });
                } catch (editError) {
                    console.error('Error editing reply:', editError);
                    // Try to send a new reply if edit fails
                    try {
                        await interaction.followUp({
                            content: `✅ | تم حذف مملكة **${kingdomName}** بنجاح!\n` +
                                    `🗑️ تم حذف: ${deletedItemsText}`,
                            ephemeral: true,
                        });
                    } catch (followUpError) {
                        console.error('Error sending followUp:', followUpError);
                    }
                }
            } else {
                // Send a new reply if interaction is not deferred
                try {
                    await interaction.reply({
                        content: `✅ | تم حذف مملكة **${kingdomName}** بنجاح!\n` +
                                `🗑️ تم حذف: ${deletedItemsText}`,
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending reply:', replyError);
                }
            }

        } catch (error) {
            console.error('Error removing kingdom:', error);
            
            // Check if interaction is still valid
            if (interaction.deferred && !interaction.replied) {
                try {
                    await interaction.editReply({
                        content: '❌ | حدث خطأ أثناء حذف المملكة. تأكد من صلاحيات البوت.',
                    });
                } catch (editError) {
                    console.error('Error editing error reply:', editError);
                    // Try to send a new reply if edit fails
                    try {
                        await interaction.followUp({
                            content: '❌ | حدث خطأ أثناء حذف المملكة. تأكد من صلاحيات البوت.',
                            ephemeral: true,
                        });
                    } catch (followUpError) {
                        console.error('Error sending error followUp:', followUpError);
                    }
                }
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء حذف المملكة. تأكد من صلاحيات البوت.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 