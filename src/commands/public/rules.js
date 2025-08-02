const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

function createGeneralButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('map_rules')
      .setLabel('🗺️ قوانين الخريطة / المتجر')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('war_rules')
      .setLabel('⚔️ قوانين الحروب / التحالفات')
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId('general_rules')
      .setLabel('📌 القوانين العامة')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('عرض قوانين المملكة'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📜 قوانين الممالك')
      .setDescription(
        `مرحباً بك في عالم الممالك \n\n` +
        `أهلاً بك في عالم من الحروب، التحالفات، والتحديات الاستراتيجية!\n` +
        `استعد لتجربة تفاعلية مليئة بالحماس في بيئة عادلة وتنافسية، مع جوائز ومفاجآت بانتظارك.\n\n` +
        `📌 **قبل أن تبدأ رحلتك، تأكد من قراءة القوانين لضمان تجربة ممتعة ومنظمة للجميع.**\n\n` 
      )
      .setImage('https://media.discordapp.net/attachments/1361778377215705348/1390019597733859451/E624D553-F061-4420-9262-ABE5466EFF32.jpg?ex=688da061&is=688c4ee1&hm=89132b811a5c06689dd35ef6e00665dda0fed4df939e369b96f8d3157bf9876c&=&format=webp&width=1460&height=806'); // 🔁 استبدل بالرابط الحقيقي للصورة

    const buttonsRow = createGeneralButtons();

    await interaction.reply({
      embeds: [embed],
      components: [buttonsRow],
      ephemeral: false,
    });
  },

  createGeneralButtons,
};
