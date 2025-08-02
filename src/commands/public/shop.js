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
        .setName('shop')
        .setDescription('🛒 متجر شراء العناصر بواسطة عملة GCC')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('عرض جميع العناصر المتاحة في المتجر')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('buy')
                .setDescription('شراء عنصر من المتجر')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('اسم العنصر المراد شراؤه')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎭 رتبة VIP', value: 'vip_role' },
                            { name: '👑 رتبة Premium', value: 'premium_role' },
                            { name: '🏆 رتبة Legend', value: 'legend_role' },
                            { name: '💎 رتبة Diamond', value: 'diamond_role' },
                            { name: '🎨 تخصيص اللون', value: 'custom_color' },
                            { name: '📝 تغيير الاسم', value: 'custom_name' },
                            { name: '🎮 رتبة Gamer', value: 'gamer_role' },
                            { name: '🌟 رتبة Star', value: 'star_role' }
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('معلومات عن عنصر معين')
                .addStringOption(option =>
                    option
                        .setName('item')
                        .setDescription('اسم العنصر')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎭 رتبة VIP', value: 'vip_role' },
                            { name: '👑 رتبة Premium', value: 'premium_role' },
                            { name: '🏆 رتبة Legend', value: 'legend_role' },
                            { name: '💎 رتبة Diamond', value: 'diamond_role' },
                            { name: '🎨 تخصيص اللون', value: 'custom_color' },
                            { name: '📝 تغيير الاسم', value: 'custom_name' },
                            { name: '🎮 رتبة Gamer', value: 'gamer_role' },
                            { name: '🌟 رتبة Star', value: 'star_role' }
                        )
                )
        ),

    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'view':
                await this.handleViewShop(interaction);
                break;
            case 'buy':
                await this.handleBuyItem(interaction);
                break;
            case 'info':
                await this.handleItemInfo(interaction);
                break;
        }
    },

    async handleViewShop(interaction) {
        const shopItems = [
            {
                name: '🎭 رتبة VIP',
                value: 'vip_role',
                price: 1000,
                description: 'رتبة VIP مع صلاحيات خاصة وتمييز في الشات',
                benefits: ['تمييز في الشات', 'صلاحيات خاصة', 'ألوان مميزة']
            },
            {
                name: '👑 رتبة Premium',
                value: 'premium_role',
                price: 2500,
                description: 'رتبة Premium مع مميزات متقدمة وحقوق إضافية',
                benefits: ['جميع مميزات VIP', 'إمكانية إنشاء قنوات خاصة', 'أولوية في الأحداث']
            },
            {
                name: '🏆 رتبة Legend',
                value: 'legend_role',
                price: 5000,
                description: 'رتبة Legend للاعبين المحترفين والمميزين',
                benefits: ['جميع مميزات Premium', 'رتبة خاصة', 'مكانة مميزة في المجتمع']
            },
            {
                name: '💎 رتبة Diamond',
                value: 'diamond_role',
                price: 10000,
                description: 'رتبة Diamond للاعبين الأكثر تميزاً ونشاطاً',
                benefits: ['جميع المميزات السابقة', 'رتبة فريدة', 'مكانة خاصة في الإدارة']
            },
            {
                name: '🎮 رتبة Gamer',
                value: 'gamer_role',
                price: 750,
                description: 'رتبة Gamer للاعبين المحترفين في الألعاب',
                benefits: ['تمييز في قنوات الألعاب', 'صلاحيات خاصة في الأحداث']
            },
            {
                name: '🌟 رتبة Star',
                value: 'star_role',
                price: 1500,
                description: 'رتبة Star للمستخدمين النشطين والمميزين',
                benefits: ['تمييز في السيرفر', 'مكانة خاصة', 'ألوان مميزة']
            },
            {
                name: '🎨 تخصيص اللون',
                value: 'custom_color',
                price: 500,
                description: 'تخصيص لون رتبتك الخاصة حسب رغبتك',
                benefits: ['لون مخصص', 'تمييز شخصي', 'رتبة فريدة']
            },
            {
                name: '📝 تغيير الاسم',
                value: 'custom_name',
                price: 300,
                description: 'تغيير اسمك في السيرفر إلى اسم مخصص',
                benefits: ['اسم مخصص', 'تمييز شخصي', 'حرية في التسمية']
            }
        ];

        const embed = new EmbedBuilder()
            .setTitle('🛒 متجر Gold Crowns Coins')
            .setDescription('مرحباً بك في متجر GCC! اختر العنصر الذي تريد شراؤه.')
            .setColor('#FFD700')
            .setThumbnail('https://media.discordapp.net/attachments/1361778377215705348/1390019597733859451/E624D553-F061-4420-9262-ABE5466EFF32.jpg?ex=68793121&is=6877dfa1&hm=7477e0fa097682b146c5043e840d00b6fba285d2567c8af24333073fdf86c0f8&=&format=webp&width=1551&height=856')
            .setFooter({ text: 'استخدم /shop buy item:اسم_العنصر لشراء العنصر المطلوب' });

        // تقسيم العناصر إلى مجموعات
        const roles = shopItems.filter(item => item.value.includes('role') && !item.value.includes('custom'));
        const customizations = shopItems.filter(item => item.value.includes('custom'));

        // إضافة الرتب
        let rolesText = '';
        roles.forEach(item => {
            rolesText += `**${item.name}** - ${item.price.toLocaleString()} GCC\n${item.description}\n\n`;
        });

        // إضافة التخصيصات
        let customText = '';
        customizations.forEach(item => {
            customText += `**${item.name}** - ${item.price.toLocaleString()} GCC\n${item.description}\n\n`;
        });

        embed.addFields(
            { name: '👑 الرتب المتاحة', value: rolesText || 'لا توجد رتب متاحة', inline: false },
            { name: '🎨 التخصيصات', value: customText || 'لا توجد تخصيصات متاحة', inline: false }
        );

        await interaction.reply({ embeds: [embed] });
    },

    async handleBuyItem(interaction) {
        const itemType = interaction.options.getString('item');
        const user = interaction.user;

        try {
            // الحصول على رصيد المستخدم
            let userCurrency = await Currency.findOne({ userId: user.id });
            if (!userCurrency) {
                userCurrency = await Currency.create({
                    userId: user.id,
                    username: user.username,
                    balance: 0,
                    totalEarned: 0,
                    totalSpent: 0
                });
            }

            // تعريف العناصر وأسعارها
            const shopItems = {
                'vip_role': { name: '🎭 رتبة VIP', price: 1000, roleId: 'VIP_ROLE_ID' },
                'premium_role': { name: '👑 رتبة Premium', price: 2500, roleId: 'PREMIUM_ROLE_ID' },
                'legend_role': { name: '🏆 رتبة Legend', price: 5000, roleId: 'LEGEND_ROLE_ID' },
                'diamond_role': { name: '💎 رتبة Diamond', price: 10000, roleId: 'DIAMOND_ROLE_ID' },
                'gamer_role': { name: '🎮 رتبة Gamer', price: 750, roleId: 'GAMER_ROLE_ID' },
                'star_role': { name: '🌟 رتبة Star', price: 1500, roleId: 'STAR_ROLE_ID' },
                'custom_color': { name: '🎨 تخصيص اللون', price: 500 },
                'custom_name': { name: '📝 تغيير الاسم', price: 300 }
            };

            const selectedItem = shopItems[itemType];
            if (!selectedItem) {
                return await interaction.reply({
                    content: '❌ العنصر المطلوب غير موجود في المتجر!',
                    ephemeral: true
                });
            }

            // التحقق من الرصيد
            if (userCurrency.balance < selectedItem.price) {
                return await interaction.reply({
                    content: `❌ رصيدك غير كافي! تحتاج إلى **${selectedItem.price.toLocaleString()} GCC** و لديك **${userCurrency.balance.toLocaleString()} GCC**`,
                    ephemeral: true
                });
            }

            // خصم المبلغ من الرصيد
            userCurrency.balance -= selectedItem.price;
            userCurrency.totalSpent += selectedItem.price;
            await userCurrency.save();

            // إضافة الرتبة إذا كانت موجودة
            if (selectedItem.roleId) {
                const roleId = selectedItem.roleId;
                const role = interaction.guild.roles.cache.get(roleId);
                if (role) {
                    const member = interaction.guild.members.cache.get(user.id);
                    if (member && !member.roles.cache.has(roleId)) {
                        await member.roles.add(role);
                    }
                }
            }

            const embed = new EmbedBuilder()
                .setTitle('✅ تم الشراء بنجاح!')
                .setDescription(`تم شراء **${selectedItem.name}** بنجاح!`)
                .addFields(
                    { name: '💰 المبلغ المدفوع', value: `**${selectedItem.price.toLocaleString()} GCC**`, inline: true },
                    { name: '💳 الرصيد المتبقي', value: `**${userCurrency.balance.toLocaleString()} GCC**`, inline: true },
                    { name: '📊 إجمالي الإنفاق', value: `**${userCurrency.totalSpent.toLocaleString()} GCC**`, inline: true }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error handling purchase:', error);
            await interaction.reply({
                content: '❌ حدث خطأ أثناء عملية الشراء',
                ephemeral: true
            });
        }
    },

    async handleItemInfo(interaction) {
        const itemType = interaction.options.getString('item');

        const itemInfo = {
            'vip_role': {
                name: '🎭 رتبة VIP',
                price: 1000,
                description: 'رتبة VIP مع صلاحيات خاصة وتمييز في الشات',
                benefits: ['تمييز في الشات', 'صلاحيات خاصة', 'ألوان مميزة', 'مكانة مميزة'],
                requirements: 'لا توجد متطلبات خاصة'
            },
            'premium_role': {
                name: '👑 رتبة Premium',
                price: 2500,
                description: 'رتبة Premium مع مميزات متقدمة وحقوق إضافية',
                benefits: ['جميع مميزات VIP', 'إمكانية إنشاء قنوات خاصة', 'أولوية في الأحداث', 'صلاحيات إدارية محدودة'],
                requirements: 'لا توجد متطلبات خاصة'
            },
            'legend_role': {
                name: '🏆 رتبة Legend',
                price: 5000,
                description: 'رتبة Legend للاعبين المحترفين والمميزين',
                benefits: ['جميع مميزات Premium', 'رتبة خاصة', 'مكانة مميزة في المجتمع', 'صلاحيات إدارية متقدمة'],
                requirements: 'نشاط عالي في السيرفر'
            },
            'diamond_role': {
                name: '💎 رتبة Diamond',
                price: 10000,
                description: 'رتبة Diamond للاعبين الأكثر تميزاً ونشاطاً',
                benefits: ['جميع المميزات السابقة', 'رتبة فريدة', 'مكانة خاصة في الإدارة', 'صلاحيات إدارية كاملة'],
                requirements: 'نشاط استثنائي ومكانة مميزة'
            },
            'gamer_role': {
                name: '🎮 رتبة Gamer',
                price: 750,
                description: 'رتبة Gamer للاعبين المحترفين في الألعاب',
                benefits: ['تمييز في قنوات الألعاب', 'صلاحيات خاصة في الأحداث', 'مكانة في مجتمع الألعاب'],
                requirements: 'مهارة في الألعاب'
            },
            'star_role': {
                name: '🌟 رتبة Star',
                price: 1500,
                description: 'رتبة Star للمستخدمين النشطين والمميزين',
                benefits: ['تمييز في السيرفر', 'مكانة خاصة', 'ألوان مميزة', 'مكانة في المجتمع'],
                requirements: 'نشاط جيد في السيرفر'
            },
            'custom_color': {
                name: '🎨 تخصيص اللون',
                price: 500,
                description: 'تخصيص لون رتبتك الخاصة حسب رغبتك',
                benefits: ['لون مخصص', 'تمييز شخصي', 'رتبة فريدة', 'حرية في التصميم'],
                requirements: 'لا توجد متطلبات خاصة'
            },
            'custom_name': {
                name: '📝 تغيير الاسم',
                price: 300,
                description: 'تغيير اسمك في السيرفر إلى اسم مخصص',
                benefits: ['اسم مخصص', 'تمييز شخصي', 'حرية في التسمية', 'هوية فريدة'],
                requirements: 'الاسم يجب أن يكون مناسباً'
            }
        };

        const selectedItem = itemInfo[itemType];
        if (!selectedItem) {
            return await interaction.reply({
                content: '❌ العنصر المطلوب غير موجود!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`ℹ️ معلومات عن ${selectedItem.name}`)
            .setDescription(selectedItem.description)
            .addFields(
                { name: '💰 السعر', value: `**${selectedItem.price.toLocaleString()} GCC**`, inline: true },
                { name: '📋 المتطلبات', value: selectedItem.requirements, inline: true },
                { name: '✨ المميزات', value: selectedItem.benefits.map(benefit => `• ${benefit}`).join('\n'), inline: false }
            )
            .setColor('#FFD700')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}; 