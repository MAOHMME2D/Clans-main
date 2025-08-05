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
        const { customId } = interaction;

        if (
          customId.startsWith('apply') ||
          customId === 'create_kingdom' ||
          customId === 'join_kingdom' ||
          customId === 'approve_application' ||
          customId === 'reject_application' ||
          customId.startsWith('close_ticket_')
        ) {
          await apply.buttonHandler(interaction, client);
          return;
        }

        if (customId === 'map_rules') {
          const embed = new EmbedBuilder()
            .setColor('#3BA55D')
            .setTitle('🗺️ قوانين الخريطة والاستعمار (المرحلة الاستراتيجية)')
            .setDescription(`قوانين الخريطة والاستعمار (المرحلة الاستراتيجية)

⸻

🗺️ 1. الخريطة الموحدة:
    •    يبدأ النظام بخريطة كبيرة، موحدة اللون، خالية من أي تقسيم أو سيطرة.
    •    تمثل هذه الخريطة أرضًا خامًا سيتم استعمارها من قبل الممالك.

⸻

🏰 2. اختيار الفئة وتحديد المملكة:
    •    كل مملكة يتم إنشاؤها بناءً على فئة يتم اختيارها مسبقًا.
    •    الفئة تحدد:
    •    اسم المملكة (يُشتق من الفئة مباشرة).
    •    نوع البيئة (جليدية، صحراوية، بركانية، إلخ).
    •    الخصائص الخاصة بالمملكة.
    •    اللون الرسمي للمملكة على الخريطة.
    •    القدرات الخاصة التي تُستخدم في الحروب.

⸻

📍 3. تحديد موقع البداية:
    •    تختار كل مملكة قطعة أرض واحدة كبداية.
    •    تُلوّن هذه القطعة بلون المملكة.

⸻

✋ 4. مرحلة السلام المؤقت:
    •    يمنع الهجوم أو التدخل بين الممالك خلال مرحلة التوسّع.
    •    تستمر حتى تُقسم الخريطة بالكامل بين الممالك.
    •    تتيح للممالك بناء استراتيجياتها دون تهديد.

⸻

💰 5. الاستعمار وتوسيع النفوذ:
    •    عند تجمّع عدد معين من عملات GGC (Gold Crowns Coins)، يمكن استعمار أراضٍ جديدة.
    •    الأراضي الجديدة تُضاف لحدود المملكة وتُلوّن بلونها الرسمي.

⸻

👑 6. نظام العملات – GGC (Gold Crowns Coins):

عملة GGC هي العملة الرسمية في النظام، وتُستخدم في:
    •    تطوير الفئة والقدرات.
    •    فتح رومات صوتية أو كتابية.
    •    دفع تكاليف التحالفات.
    •    الحصول عليها يتم عبر:
    •    2500 XP صوتي = 1 عملة
    •    1200 XP كتابي = 1 عملة
    •    الفوز بالحروب = عدد معين من العملات
    •    تُحسب أسبوعيًا حسب تفاعل المملكة.

⸻

🛒 7. المتجر الخاص بالمملكة:
    •    باستخدام عملات GGC، يمكن للمملكة شراء:
    •    تطويرات للفئة.
    •    رومات صوتية أو كتابية مخصصة.
    •    إضافات تفاعلية وخدمات داخلية.
`);

          await interaction.reply({ embeds: [embed], flags: 64 });

        } else if (customId === 'war_rules') {
          const embed = new EmbedBuilder()
            .setColor('#E03A3E')
            .setTitle('⚔️ التحالفات والحروب')
            .setDescription(`⚔️ التحالفات والحروب

⸻

8. مرحلة السلام المؤقت:
    •    يُمنع الهجوم أو شنّ الحروب بين الممالك في المرحلة الأولى.
    •    تستمر هذه المرحلة حتى تكتمل الخريطة بالكامل وتوزّع الأراضي بين جميع الممالك.

⸻

9. نظام التحالفات:
    •    يمكن لأي مملكتين عقد تحالف يمنع الهجوم بينهما.
    •    كسر التحالف مسموح، لكنه:
    •    يُخصم عملات من المملكة التي تكسر التحالف.
    •    يمنح أفضلية دفاعية للطرف المتضرر.
    •    يعتبر خطوة استراتيجية محسوبة.

⸻

10. الحرب الكبرى:
    •    تبدأ الحرب الكبرى فور اكتمال الخريطة بالكامل.
    •    يُسمح بشنّ الهجمات ومحاولات غزو أراضي الممالك الأخرى.
    •    لا يمكن الهجوم على مملكة متحالفة إلا بعد كسر التحالف رسميًا.

⸻

11. نظام المعارك:
    •    كل معركة تتكوّن من 3 جولات:
    •    جولتان يختار نوعهما المدافع.
    •    جولة واحدة يختارها المهاجم.
    •    التحديات تشمل:
    •    أسئلة ذهنية (ألغاز، منطق، معلومات).
    •    تحديات سرعة.
    •    ألعاب بسيطة أو إلكترونية.
    •    يمكن استخدام قدرة الفئة الخاصة مرة واحدة فقط في كل حرب.
    •    الفوز بجولتين = انتصار + مكافأة من عملات GGC.
`);
          await interaction.reply({ embeds: [embed], flags: 64 });

        } else if (customId === 'general_rules') {
          const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📜 القوانين والقواعد العامة – Kingdoms War')
            .setDescription(`📜 القوانين والقواعد العامة – Kingdoms War

⸻

    1.    الالتزام بالنزاهة:
    •    يمنع الغش ومحاولة الغش بأي شكل.
    •    المخالفة تعرض المملكة والعضو لعقوبات تصل إلى خصم نقاط وعدم مشاركة العضو في أي حروب قادمة.
    
    2.    احترام التحالفات:
    •    يمنع كسر التحالف دون إعلام الإدارة أو إعلان رسمي.
    •    كسره بدون ذلك يُعتبر مخالفة وتُعاقب عليها.
    
    3.    التفاعل والحسابات:
    •    يمنع استخدام أي حساب غير موثوق أو مكرر.
    •    يُحتسب التفاعل الحقيقي فقط.
    
    4.    الاحترام والبيئة التنافسية:
    •    يمنع منعا باتا أخذ أي شخص من مملكة أخرى إلى مملكتك دون إرادته ودون إعلام الفريق المسؤول.
    •    يجب أن تكون البيئة تنافسية وخالية من المشاكل.
    •    يمنع المشاكل بين الكلانات والحساسية.
`);
          await interaction.reply({ embeds: [embed], flags: 64 });

        } else {
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
