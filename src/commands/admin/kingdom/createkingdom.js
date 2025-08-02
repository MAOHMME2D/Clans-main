const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    PermissionFlagsBits,
    ChannelType,
} = require('discord.js');
const Clan = require('../../../models/Clan');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createkingdom')
        .setDescription('🏰 | إنشاء مملكة جديدة')
        .addStringOption((option) =>
            option
                .setName('name')
                .setDescription('🏰 | اسم المملكة')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('leader')
                .setDescription('👑 | قائد المملكة')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const { options, guild } = interaction;

        const kingdomName = options.getString('name');
        const leader = options.getUser('leader');

        try {
            // Defer reply to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            // Check if kingdom already exists
            const existingKingdom = await Clan.findOne({ name: kingdomName });
            if (existingKingdom) {
                return await interaction.editReply({
                    content: '❌ | المملكة موجودة بالفعل!',
                });
            }

            // Create kingdom leader role
            const leaderRole = await guild.roles.create({
                name: `👑 King ${kingdomName}`,
                color: 0xFFD700,
                reason: `Kingdom leader role for ${kingdomName}`
            });

            // Create kingdom assistant role
            const assistantRole = await guild.roles.create({
                name: `🤴 Prince ${kingdomName}`,
                color: 0xC0C0C0,
                reason: `Kingdom assistant role for ${kingdomName}`
            });

            // Create kingdom member role
            const kingdomRole = await guild.roles.create({
                name: `🏰 ${kingdomName}`,
                color: 0x9B59B6,
                reason: `Kingdom member role for ${kingdomName}`
            });

            // Create kingdom category
            const kingdomCategory = await guild.channels.create({
                name: `🏰 مملكة ${kingdomName}`,
                type: ChannelType.GuildCategory,
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
            });

            // Create castle channel inside the category
            const castleChannel = await guild.channels.create({
                name: `🏰-${kingdomName}`,
                type: ChannelType.GuildText,
                parent: kingdomCategory.id,
                topic: `قلعة مملكة ${kingdomName} - للدردشة والتواصل بين أعضاء المملكة`,
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
            });

            // Create voice channel for kingdom
            const voiceChannel = await guild.channels.create({
                name: `🎤 ${kingdomName}`,
                type: ChannelType.GuildVoice,
                parent: kingdomCategory.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
                    },
                    {
                        id: kingdomRole.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
                    },
                ],
            });

            // Create kingdom in database
            const newKingdom = new Clan({
                name: kingdomName,
                leaderId: leader.id,
                leaderRoleId: leaderRole.id,
                assistantRoleId: assistantRole.id,
                roleId: kingdomRole.id,
                categoryId: kingdomCategory.id,
                castleChannelId: castleChannel.id,
                ability: {
                    type: 'kingdom',
                    name: kingdomName,
                    description: `مملكة ${kingdomName}`
                },
                createdBy: interaction.user.id,
                members: [leader.id]
            });

            await newKingdom.save();

            // Add roles to leader
            await guild.members.cache.get(leader.id).roles.add([kingdomRole, leaderRole]);

            await interaction.editReply({
                content: `✅ | تم إنشاء مملكة **${kingdomName}** بنجاح!\n` +
                        `👑 القائد: ${leader.toString()}\n` +
                        `🏰 الكاتيجوري: ${kingdomCategory.toString()}\n` +
                        `💬 القناة النصية: ${castleChannel.toString()}\n` +
                        `🎤 القناة الصوتية: ${voiceChannel.toString()}\n` +
                        `🎭 Kingdom Member Role: ${kingdomRole.toString()}\n` +
                        `👑 King Role: ${leaderRole.toString()}\n` +
                        `🤴 Prince Role: ${assistantRole.toString()}`,
            });

        } catch (error) {
            console.error('Error creating kingdom:', error);
            
            if (interaction.deferred) {
                await interaction.editReply({
                    content: '❌ | حدث خطأ أثناء إنشاء المملكة. تأكد من صلاحيات البوت.',
                });
            } else {
                try {
                    await interaction.reply({
                        content: '❌ | حدث خطأ أثناء إنشاء المملكة. تأكد من صلاحيات البوت.',
                        ephemeral: true,
                    });
                } catch (replyError) {
                    console.error('Error sending error reply:', replyError);
                }
            }
        }
    },
}; 