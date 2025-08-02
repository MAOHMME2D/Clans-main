const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('عرض قائمة الأوامر المتاحة - Show available commands'),

    /**
     * @param { ChatInputCommandInteraction } interaction
     * @param { Client } client
     */
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('❓ مركز المساعدة - Help Center')
            .setDescription('مرحباً بك في مركز المساعدة! اختر الفئة التي تريد معرفة المزيد عنها.\n\nWelcome to the help center! Choose a category to learn more.')
            .addFields(
                {
                    name: '📋 الأوامر العامة - General Commands',
                    value: `**/ping** - فحص سرعة البوت
**/welcome** - رسالة الترحيب
**/rules** - عرض قوانين السيرفر
**/help** - قائمة الأوامر المساعدة`,
                    inline: false
                },
                {
                    name: '💰 الأوامر الاقتصادية - Economy Commands',
                    value: `**/currency** - عرض عملتك
**/shop** - متجر السيرفر
**/daily** - المكافأة اليومية
**/transfer** - تحويل العملة`,
                    inline: false
                },
                {
                    name: '🏰 أوامر الممالك - Kingdom Commands',
                    value: `**/kingdom create** - إنشاء مملكة
**/kingdom join** - الانضمام لمملكة
**/kingdom info** - معلومات المملكة
**/kingdom members** - أعضاء المملكة`,
                    inline: false
                },
                {
                    name: '⚙️ أوامر الإدارة - Admin Commands',
                    value: `**/apply** - التقديم على منصب
**/lock** - قفل القناة
**/unlock** - فتح القناة
**/say** - إرسال رسالة كالبوت`,
                    inline: false
                }
            )
            .setFooter({ 
                text: 'AbuSwe7l Community - مجتمع أبو سويحل',
                iconURL: client.user.avatarURL()
            })
            .setTimestamp();

        // Create buttons for different help categories
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_general')
                    .setLabel('📋 General')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📋'),
                new ButtonBuilder()
                    .setCustomId('help_economy')
                    .setLabel('💰 Economy')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('help_kingdom')
                    .setLabel('🏰 Kingdom')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏰'),
                new ButtonBuilder()
                    .setCustomId('help_admin')
                    .setLabel('⚙️ Admin')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_tutorial')
                    .setLabel('🎓 Tutorial')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎓'),
                new ButtonBuilder()
                    .setCustomId('help_faq')
                    .setLabel('❓ FAQ')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓'),
                new ButtonBuilder()
                    .setCustomId('help_support')
                    .setLabel('🆘 Support')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🆘')
            );

        await interaction.reply({ 
            embeds: [embed],
            components: [row, row2]
        });
    },
}; 