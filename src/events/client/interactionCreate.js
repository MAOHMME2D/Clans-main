const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

const apply = require('../../commands/admin/apply');

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {import('discord.js').Interaction} interaction
   * @param {import('discord.js').Client} client
   */
  async execute(interaction, client) {
    try {
      if (interaction.isChatInputCommand()) {
        // أمر rules مع زرار نظام الممالك
        if (interaction.commandName === 'rules') {
          const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🏰 نظام الممالك')
            .setDescription('اختر أحد الخيارات أدناه للبدء أو لعرض القوانين الخاصة بنظام الممالك.');

          const mainRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('create_kingdom')
              .setLabel('🏰 Create a Kingdom')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('join_kingdom')
              .setLabel('⚔️ Join a Kingdom')
              .setStyle(ButtonStyle.Secondary)
          );

          const rulesRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('map_rules')
              .setLabel('🗺️ قوانين الخريطة')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('war_rules')
              .setLabel('⚔️ قوانين الحروب')
              .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
              .setCustomId('general_rules')
              .setLabel('📜 القوانين العامة')
              .setStyle(ButtonStyle.Secondary)
          );

          return await interaction.reply({
            embeds: [embed],
            components: [mainRow, rulesRow],
            flags: 64, // رد مخفي للمستخدم فقط
          });
        }

        // أوامر أخرى عامة (غير rules)
        const command = client.commands.get(interaction.commandName);
        if (!command) {
          return await interaction.reply({
            content: `⚠️ لم يتم العثور على الأمر \`${interaction.commandName}\`.`,
            flags: 64,
          });
        }

        await command.execute(interaction, client);

      } else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command?.autocomplete) {
          await command.autocomplete(interaction, client);
        }

      } else if (interaction.isButton()) {
        // أزرار خاصة بـ apply
        if (interaction.customId.startsWith('apply')) {
          await apply.buttonHandler(interaction, client);
          return;
        }

        // أزرار نظام الممالك — استدعاء فتح المودالات من apply.js
        const id = interaction.customId;

        if (id === 'create_kingdom') {
          await apply.handleCreateKingdomModal(interaction);

        } else if (id === 'join_kingdom') {
          await apply.handleJoinKingdomModal(interaction);

        } else if (id === 'map_rules') {
          const embed = new EmbedBuilder()
            .setColor('#3BA55D')
            .setTitle('🗺️ قوانين الخريطة والاستعمار (المرحلة الاستراتيجية)')
            .setDescription(`
**1. الخريطة الموحدة:**  
- يبدأ النظام بخريطة كبيرة موحدة اللون، خالية من السيطرة.
- تمثل أرضًا خامًا ستُستعمر لاحقًا من قبل الممالك.

**2. اختيار الفئة وتحديد المملكة:**  
- كل مملكة تُبنى على فئة، تحدد البيئة، القدرات، اللون الرسمي، واسم المملكة.

**3. تحديد موقع البداية:**  
- كل مملكة تبدأ بقطعة أرض واحدة تُلوّن بلونها الرسمي.

**4. مرحلة السلام المؤقت:**  
- لا يسمح بالحروب خلال التوسع حتى تُقسم الخريطة بالكامل.

**5. الاستعمار:**  
- باستخدام عملات GGC يمكن للممالك استعمار أراضٍ جديدة وتوسيع حدودها.

**6. نظام العملات – GGC:**  
- 2500 XP صوتي = 1 GGC  
- 1200 XP كتابي = 1 GGC  
- الفوز بالحروب = عملات إضافية  
- تُستخدم في المتجر، القدرات، والتحالفات.

**7. المتجر الخاص بالمملكة:**  
- شراء رومات، قدرات، تطويرات باستخدام GGC.
          `);

          await interaction.reply({ embeds: [embed], flags: 64 });

        } else if (id === 'war_rules') {
          const embed = new EmbedBuilder()
            .setColor('#E03A3E')
            .setTitle('⚔️ قوانين الحرب / التحالفات')
            .setDescription(`
**1. مرحلة السلام المؤقت:**  
- لا حروب حتى يتم توزيع كل أراضي الخريطة.

**2. نظام التحالفات:**  
- يمكن عقد تحالفات، وكسرها يُخصم منه عملات ويمنح أفضلية دفاعية للطرف الآخر.

**3. الحرب الكبرى:**  
- تبدأ بعد اكتمال الخريطة.
- لا يُهاجم حليف إلا بعد كسر التحالف رسميًا.

**4. نظام المعارك:**  
- 3 جولات: 2 يختارها المدافع، و1 يختارها المهاجم.
- تشمل ألغاز، سرعة، ألعاب إلكترونية.
- كل فئة لها قدرة خاصة تُستخدم مرة بالحرب.
          `);

          await interaction.reply({ embeds: [embed], flags: 64 });

        } else if (id === 'general_rules') {
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📜 القوانين العامة – Kingdoms War')
            .setDescription(`
**1. النزاهة:**  
- الغش يؤدي للعقوبات.

**2. احترام التحالفات:**  
- كسر التحالف بدون إعلام = مخالفة.

**3. التفاعل:**  
- لا يُحتسب الحسابات المزيفة أو غير النشطة.

**4. بيئة تنافسية محترمة:**  
- ممنوع جلب الأعضاء من ممالك أخرى بالقوة.
- يجب أن تكون المنافسة محترمة دون مشاكل.
          `);

          await interaction.reply({ embeds: [embed], flags: 64 });

        } else {
          // زرار غير معروف
          await interaction.reply({
            content: '❌ زرار غير معروف.',
            flags: 64,
          });
        }

      } else if (interaction.isModalSubmit()) {
        await apply.modalHandler(interaction, client);
      }
    } catch (error) {
      console.error('Error handling interaction:', error);

      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: 'حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.',
            flags: 64,
          });
        } catch {}
      }
    }
  },
};
