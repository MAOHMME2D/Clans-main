const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require('discord.js');
const Currency = require('../../models/Currency');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gcc')
        .setDescription('نظام عملة Gold Crowns Coins (GCC)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('balance')
                .setDescription('عرض رصيدك من عملة GCC')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription('عرض رصيد مستخدم آخر')
                        .setRequired(false)
                )
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'balance':
                await this.handleBalance(interaction);
                break;
        }
    },

    async handleBalance(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        
        try {
            let userCurrency = await Currency.findOne({ userId: targetUser.id });
            
            if (!userCurrency) {
                userCurrency = await Currency.create({
                    userId: targetUser.id,
                    username: targetUser.username,
                    balance: 0
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🪙 Gold Crowns Coins (GCC)')
                .setDescription(`**رصيد ${targetUser.username}**`)
                .addFields(
                    { name: '💰 الرصيد الحالي', value: `**${userCurrency.balance.toLocaleString()} GCC**`, inline: true },
                    { name: '📈 إجمالي الأرباح', value: `**${userCurrency.totalEarned.toLocaleString()} GCC**`, inline: true },
                    { name: '💸 إجمالي الإنفاق', value: `**${userCurrency.totalSpent.toLocaleString()} GCC**`, inline: true }
                )
                .setThumbnail('https://media.discordapp.net/attachments/1361778377215705348/1390019597733859451/E624D553-F061-4420-9262-ABE5466EFF32.jpg?ex=68793121&is=6877dfa1&hm=7477e0fa097682b146c5043e840d00b6fba285d2567c8af24333073fdf86c0f8&=&format=webp&width=1551&height=856')
                .setColor('#FFD700')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error handling balance:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء جلب معلومات الرصيد',
                flags: 64 // ephemeral flag
            });
        }
    }
}; 