const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');
const Currency = require('../../models/Currency');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gccadmin')
        .setDescription('إدارة نظام عملة GCC (للمشرفين فقط)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة GCC لمستخدم')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('المستخدم المراد إضافة GCC له')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('كمية GCC المراد إضافتها')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('سبب الإضافة')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة GCC من مستخدم')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('المستخدم المراد إزالة GCC منه')
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName('amount')
                        .setDescription('كمية GCC المراد إزالتها')
                        .setRequired(true)
                        .setMinValue(1)
                )
                .addStringOption(option =>
                    option
                        .setName('reason')
                        .setDescription('سبب الإزالة')
                        .setRequired(false)
                )
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add':
                await this.handleAdd(interaction);
                break;
            case 'remove':
                await this.handleRemove(interaction);
                break;
        }
    },

    async handleAdd(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'إضافة من المشرف';

        try {
            let userCurrency = await Currency.findOne({ userId: targetUser.id });
            
            if (!userCurrency) {
                userCurrency = await Currency.create({
                    userId: targetUser.id,
                    username: targetUser.username,
                    balance: 0
                });
            }

            userCurrency.balance += amount;
            userCurrency.totalEarned += amount;
            await userCurrency.save();

            const embed = new EmbedBuilder()
                .setTitle('✅ تمت إضافة GCC بنجاح')
                .setDescription(`**تم إضافة ${amount.toLocaleString()} GCC إلى رصيد ${targetUser.username}**`)
                .addFields(
                    { name: '👤 المستخدم', value: `${targetUser.username}`, inline: true },
                    { name: '💰 الرصيد الجديد', value: `**${userCurrency.balance.toLocaleString()} GCC**`, inline: true },
                    { name: '📝 السبب', value: reason, inline: true }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling add:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء إضافة GCC',
                ephemeral: true
            });
        }
    },

    async handleRemove(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const reason = interaction.options.getString('reason') || 'إزالة من المشرف';

        try {
            let userCurrency = await Currency.findOne({ userId: targetUser.id });
            
            if (!userCurrency) {
                return await interaction.reply({
                    content: '❌ هذا المستخدم لا يملك رصيد GCC',
                    ephemeral: true
                });
            }

            if (userCurrency.balance < amount) {
                return await interaction.reply({
                    content: `❌ رصيد المستخدم غير كافي. رصيده الحالي: **${userCurrency.balance.toLocaleString()} GCC**`,
                    ephemeral: true
                });
            }

            userCurrency.balance -= amount;
            userCurrency.totalSpent += amount;
            await userCurrency.save();

            const embed = new EmbedBuilder()
                .setTitle('✅ تمت إزالة GCC بنجاح')
                .setDescription(`**تم إزالة ${amount.toLocaleString()} GCC من رصيد ${targetUser.username}**`)
                .addFields(
                    { name: '👤 المستخدم', value: `${targetUser.username}`, inline: true },
                    { name: '💰 الرصيد الجديد', value: `**${userCurrency.balance.toLocaleString()} GCC**`, inline: true },
                    { name: '📝 السبب', value: reason, inline: true }
                )
                .setColor('#FF6B6B')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling remove:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء إزالة GCC',
                ephemeral: true
            });
        }
    }
}; 