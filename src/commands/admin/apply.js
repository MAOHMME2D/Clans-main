const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');
const Applications = require('../../models/Applications');
const { v4: uuidv4 } = require('uuid');
const { ADMIN_CHANNEL_ID, KINGDOM_MANAGEMENT_ROLE_ID, KINGDOM_CATEGORY_ID } = require('../../config');

// ========================================
// MAIN COMMAND MODULE
// ========================================

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('🏰 Kingdoms System - Apply for kingdoms')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setAuthor({ name: '🏰 Kingdoms System' })
            .setDescription(
                '⸻\n\n' +
                '🛡️ قوانين فتح مملكة:\n' +
                '    1.    تحديد الفئة (وهي التي تُحدد اسم المملكة)، مع اختيار شعار مناسب.\n' +
                '    2.    تعيين قائد (King) و3 مساعدين (Princes).\n' +
                '    3.    توفر 5 أعضاء فعّالين (غير القائد والمساعدين).\n' +
                '    4.    يُمنع سحب أعضاء من ممالك أخرى.\n' +
                '    5.    لا تُعتمد أي مملكة إلا بعد مراجعة رسمية من الإدارة.\n' +

                '⸻\n\n' +
                '🧭 قوانين دخول مملكة:\n' +
                '    1.    الالتزام بـ[القوانين](https://discord.com/channels/1358648414501601381/1400842377475915918) الممالك العامة.\n' +
                '    2.    أن يكون العضو فعّال ومشارك.\n' +
                '    3.    احترام القائد، الأعضاء، وجميع الممالك الأخرى، مع منع الغش تمامًا.\n' +
                '    4.    يُمنع الإهمال أو عدم الجدية في التقديم.\n\n' +
                '⸻'
            )
            .setImage('https://media.discordapp.net/attachments/1361778377215705348/1390019597733859451/E624D553-F061-4420-9262-ABE5466EFF32.jpg?ex=68793121&is=6877dfa1&hm=7477e0fa097682b146c5043e840d00b6fba285d2567c8af24333073fdf86c0f8&=&format=webp&width=1551&height=856')
            .setColor('#302B40');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_kingdom')
                .setLabel('🏰 Create a Kingdom')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('join_kingdom')
                .setLabel('⚔️ Join a Kingdom')
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

// ========================================
// BUTTON INTERACTION HANDLER
// ========================================

module.exports.buttonHandler = async (interaction, client) => {
    if (!interaction.isButton()) return;
    
    const { customId } = interaction;
    
    // Handle different button interactions
    switch (customId) {
        case 'create_kingdom':
            await handleCreateKingdomModal(interaction);
            break;
            
        case 'join_kingdom':
            await handleJoinKingdomModal(interaction);
            break;
            
        case 'approve_application':
            await handleApproveApplication(interaction);
            break;
            
        case 'reject_application':
            await handleRejectApplication(interaction);
            break;
            
        default:
            if (customId.startsWith('close_ticket_')) {
                await handleCloseTicket(interaction);
            }
            break;
    }
};

// ========================================
// MODAL INTERACTION HANDLER
// ========================================

module.exports.modalHandler = async (interaction, client) => {
    if (!interaction.isModalSubmit()) return;
    
    const { customId } = interaction;
    
    // Handle different modal submissions
    switch (customId) {
        case 'modal_create_kingdom':
            await handleCreateKingdomSubmission(interaction, client);
            break;
            
        case 'modal_join_kingdom':
            await handleJoinKingdomSubmission(interaction, client);
            break;
            
        default:
            break;
    }
};

// ========================================
// HELPER FUNCTIONS - MODAL CREATION
// ========================================

async function handleCreateKingdomModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_create_kingdom')
        .setTitle('🏰 تقديم إنشاء كلان')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('👤 الاسم')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('أدخل اسمك')
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('age')
                    .setLabel('🎂 العمر')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('أدخل عمرك')
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('creditAbility')
                    .setLabel('💰 هل لك الاستطاعة دفع الكردت والذي قدر 100k؟')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('نعم / لا')
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('memberCount')
                    .setLabel('👥 كم عدد الأشخاص لديك؟')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('أدخل العدد')
            )
        );
    
    await interaction.showModal(modal);
}

async function handleJoinKingdomModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_join_kingdom')
        .setTitle('🎯 Kingdoms | نموذج انضمام إلى مملكة')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('🪪 اسمك')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setPlaceholder('أدخل اسمك')
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('interaction')
                    .setLabel('⚡ التفاعل')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('• عدد ساعات تفاعلك اليومي: (     )\n• تفاعل صوتي\n• تفاعل كتابي')
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('contribution')
                    .setLabel('🛡️ ما ستقدم في حرب الممالك')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('اشرح ما ستقدمه في حرب الممالك')
            )
        );
    
    await interaction.showModal(modal);
}

// ========================================
// HELPER FUNCTIONS - APPLICATION HANDLING
// ========================================

async function handleApproveApplication(interaction) {
    await interaction.deferReply();
    
    try {
        // Extract application ID from message footer
        const footerText = interaction.message.embeds[0]?.footer?.text || '';
        const applicationId = footerText.split('Application ID:')[1]?.trim();
        
        if (!applicationId) {
            await interaction.editReply({ 
                content: `❌ لم يتم استخراج Application ID بشكل صحيح من الرسالة.\nFooter: ${footerText}` 
            });
            return;
        }
        
        // Update application status in database
        let application = await Applications.findOneAndUpdate(
            { applicationId: applicationId },
            { 
                status: 'approved', 
                reviewedBy: interaction.user.id, 
                reviewDate: new Date() 
            },
            { new: true }
        );
        
        if (!application) {
            application = await Applications.findOne({ applicationId: applicationId });
            if (!application) {
                await interaction.editReply({ 
                    content: `❌ تعذر العثور على الطلب في قاعدة البيانات.\nApplication ID: ${applicationId}` 
                });
            } else {
                await interaction.editReply({ 
                    content: `❌ الطلب موجود لكن لم يتم تحديثه.\nApplication: ${JSON.stringify(application)}` 
                });
            }
            return;
        }
        
        // Create kingdom channel
        const channel = await createKingdomChannel(interaction, application);
        
        // Update message embed
        const embed = new EmbedBuilder()
            .setTitle('✅ Application Approved')
            .setDescription(`Application has been approved by ${interaction.user.tag}\n\nتم فتح روم خاص: <#${channel.id}>`)
            .setColor('Green')
            .setTimestamp();
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        await interaction.editReply({ content: '✅ Application approved and private channel created!' });
        
    } catch (error) {
        console.error('Error approving application:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء الموافقة على الطلب!' });
    }
}

async function handleRejectApplication(interaction) {
    await interaction.deferReply();
    
    try {
        // Extract application ID from message footer
        const footerText = interaction.message.embeds[0]?.footer?.text || '';
        const applicationId = footerText.split('Application ID:')[1]?.trim();
        
        if (!applicationId) {
            await interaction.editReply({ 
                content: `❌ لم يتم استخراج Application ID بشكل صحيح من الرسالة.\nFooter: ${footerText}` 
            });
            return;
        }
        
        // Update application status in database
        await Applications.findOneAndUpdate(
            { applicationId: applicationId },
            { 
                status: 'rejected', 
                reviewedBy: interaction.user.id, 
                reviewDate: new Date() 
            }
        );
        
        // Update message embed
        const embed = new EmbedBuilder()
            .setTitle('❌ Application Rejected')
            .setDescription(`Application has been rejected by ${interaction.user.tag}`)
            .setColor('Red')
            .setTimestamp();
        
        await interaction.message.edit({ embeds: [embed], components: [] });
        await interaction.editReply({ content: '✅ Application rejected successfully!' });
        
    } catch (error) {
        console.error('Error rejecting application:', error);
        await interaction.editReply({ content: '❌ حدث خطأ أثناء رفض الطلب!' });
    }
}

async function handleCloseTicket(interaction) {
    const channelId = interaction.customId.replace('close_ticket_', '');
    const channel = interaction.guild.channels.cache.get(channelId);
    
    if (!channel) {
        await interaction.reply({ 
            content: '❌ لم يتم العثور على القناة!', 
            ephemeral: true 
        });
        return;
    }
    
    try {
        // Reply immediately to prevent timeout
        await interaction.reply({ 
            content: '🔒 جاري إغلاق التذكرة...', 
            ephemeral: true 
        });
        
        // Send closing message to the channel
        await channel.send('🔒 **تم إغلاق هذه التذكرة من قبل الإدارة**\n\nسيتم حذف القناة خلال 5 ثوانٍ...');
        
        // Wait 5 seconds before deleting
        setTimeout(async () => {
            try {
                await channel.delete();
                console.log(`✅ Ticket channel ${channel.name} deleted successfully`);
            } catch (deleteError) {
                console.error('❌ Error deleting channel:', deleteError);
            }
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error closing ticket:', error);
        try {
            await interaction.editReply({ content: '❌ حدث خطأ أثناء إغلاق التذكرة!' });
        } catch (replyError) {
            console.error('❌ Error sending error reply:', replyError);
        }
    }
}

// ========================================
// HELPER FUNCTIONS - MODAL SUBMISSIONS
// ========================================

async function handleCreateKingdomSubmission(interaction, client) {
    const applicationData = {
        applicationId: uuidv4(),
        applicantId: interaction.user.id,
        applicantName: interaction.user.tag,
        status: 'pending',
        type: 'create_kingdom',
        name: interaction.fields.getTextInputValue('name'),
        age: interaction.fields.getTextInputValue('age'),
        creditAbility: interaction.fields.getTextInputValue('creditAbility'),
        memberCount: interaction.fields.getTextInputValue('memberCount'),
    };
    
    const embed = new EmbedBuilder()
        .setColor('#201C2E')
        .setAuthor({
            name: '🏰 Kingdoms System',
            iconURL: 'https://media.discordapp.net/attachments/13617783772157534813919597733859451/E624D553-F061-4420-9262-ABE5466F32jpg?ex=68793121is=6877fa1&hm=7477fa097682146043840d00fba285d2567c8af2433373fdf86c0&format=webp&width=1551&height=856'
        })
        .setTitle('🏰 طلب إنشاء كلان جديد')
        .addFields(
            { name: '👤 المتقدم', value: `> ${applicationData.applicantName}`, inline: true },
            { name: '👤 الاسم', value: `> ${applicationData.name}`, inline: true },
            { name: '🎂 العمر', value: `> ${applicationData.age}`, inline: true },
            { name: '💰 استطاعة دفع الكردت', value: `> ${applicationData.creditAbility}` },
            { name: '👥 عدد الأشخاص', value: `> ${applicationData.memberCount}` }
        )
        .setFooter({ text: `Application ID: ${applicationData.applicationId}` })
        .setTimestamp();
    
    await processApplicationSubmission(interaction, client, applicationData, embed);
}

async function handleJoinKingdomSubmission(interaction, client) {
    const applicationData = {
        applicationId: uuidv4(),
        applicantId: interaction.user.id,
        applicantName: interaction.user.tag,
        status: 'pending',
        type: 'join_kingdom',
        name: interaction.fields.getTextInputValue('name'),
        interaction: interaction.fields.getTextInputValue('interaction'),
        contribution: interaction.fields.getTextInputValue('contribution'),
        commitment: interaction.fields.getTextInputValue('commitment'),
    };
    
    const embed = new EmbedBuilder()
        .setColor('#4A3F6B')
        .setAuthor({
            name: '🏰 Kingdoms System',
            iconURL: 'https://media.discordapp.net/attachments/13617783772157534813919597733859451/E624D553-F061-4420-9262-ABE5466F32jpg?ex=68793121is=6877fa1&hm=7477fa097682146043840d00fba285d2567c8af2433373fdf86c0&format=webp&width=1551&height=856'
        })
        .setTitle('🎯 طلب انضمام إلى مملكة')
        .addFields(
            { name: '👤 المتقدم', value: `> ${applicationData.applicantName}`, inline: true },
            { name: '🪪 الاسم', value: `> ${applicationData.name}`, inline: true },
            { name: '⚡ التفاعل', value: `> ${applicationData.interaction}` },
            { name: '🛡️ ما ستقدم في حرب الممالك', value: `> ${applicationData.contribution}` },
            { name: '📜 الالتزام بالقوانين', value: `> ${applicationData.commitment}` }
        )
        .setFooter({ text: `Application ID: ${applicationData.applicationId}` })
        .setTimestamp();
    
    await processApplicationSubmission(interaction, client, applicationData, embed);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

async function processApplicationSubmission(interaction, client, applicationData, embed) {
    try {
        // Save application to database
        await Applications.create(applicationData);
        
        // Create approval/rejection buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('approve_application')
                .setLabel('✅ موافقة')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('reject_application')
                .setLabel('❌ رفض')
                .setStyle(ButtonStyle.Danger)
        );
        
        // Send application to admin channel
        const adminChannel = await client.channels.fetch(ADMIN_CHANNEL_ID).catch(() => null);
        if (adminChannel) {
            await adminChannel.send({ 
                content: `<@${interaction.user.id}> طلب جديد!`,
                embeds: [embed], 
                components: [row] 
            });
        }
        
        await interaction.reply({ 
            content: '✅ تم إرسال طلبك بنجاح! سيتم مراجعته من قبل الإدارة.', 
            ephemeral: true 
        });
        
    } catch (error) {
        console.error('❌ Error processing application submission:', error);
        await interaction.reply({ 
            content: '❌ حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.', 
            ephemeral: true 
        });
    }
}

async function createKingdomChannel(interaction, application) {
    const guild = interaction.guild;
    const applicantId = application.applicantId;
    
    // Get the next kingdom number
    const existingChannels = guild.channels.cache.filter(channel => 
        channel.parentId === KINGDOM_CATEGORY_ID && 
        channel.name.startsWith('kingdom-')
    );
    
    const kingdomNumbers = existingChannels.map(channel => {
        const match = channel.name.match(/kingdom-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    });
    
    const nextKingdomNumber = kingdomNumbers.length > 0 ? Math.max(...kingdomNumbers) + 1 : 1;
    const channelName = `kingdom-${nextKingdomNumber}`;
    
    // Create the channel
    const channel = await guild.channels.create({
        name: channelName,
        type: 0, // GUILD_TEXT
        parent: KINGDOM_CATEGORY_ID,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: ['ViewChannel']
            },
            {
                id: applicantId,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
            },
            {
                id: KINGDOM_MANAGEMENT_ROLE_ID,
                allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
            }
        ]
    });
    
            // Create ticket management buttons
        const ticketRow = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(`close_ticket_${channel.id}`)
                .setLabel('🔒 إغلاق التذكرة')
                .setStyle(ButtonStyle.Danger)
        );
    
    // Send welcome message with rules
    await channel.send({
      content: 
        `مرحباً <@${applicantId}> <@&${KINGDOM_MANAGEMENT_ROLE_ID}> \n` +
        `⸻\n\n` +
        `📋 **طلب إنشاء كلان جديد**\n\n` +
    
        `🔹 **اسم الليدر:**\n` +
        `[اكتب اسم الليدر هنا]\n\n` +
    
        `🔹 **الفئة:**\n` +
        `سيتم تخييرك بين 3 فئات، ويجب اختيار فئة واحدة فقط بعد معرفة خصائصها.\n` +
        `اسم الكلان، شعاره، ولونه على الخريطة يتحدد حسب الفئة التي تختارها.\n` +
        `مثال: إذا اخترت *Fire Kingdom*، سيكون شعارك ناري ولونك أحمر على الخريطة.\n\n` +
    
        `🔹 **عدد الأعضاء:**\n` +
        `[اكتب عدد الأعضاء هنا]\n\n` +
    
        `🔹 **المساعدين:**\n` +
        `• يجب إدخال 3 مساعدين بالاسم.\n` +
        `• يجب أن يكونوا على علم بالموافقة.\n` +
        `• لا يُفتح الكلان إلا بعد تأكيد قبولهم.\n` +
        `• يُشترط وجود 5 أعضاء على الأقل (غير الليدر والمساعدين) لفتح الكلان.\n\n` +
    
        `🔹 **الشعار:**\n` +
        `يجب أن يعبر عن الفئة المختارة (مثل سيوف، تاج، لهب...).\n` +
        `إذا لم يكن لديك شعار، يمكنك إرسال فكرتك وسيتم تصميمه من قبل الإدارة.\n\n` +
    
        `🔹 **الهدف وماذا تقدم للممالك:**\n` +
        `[اكتب هنا هدف الكلان وكيف ستدعم الممالك وتساهم في نجاح الكلان]\n\n` +
    
        `📜 **قوانين الممالك:**\n` +
        `1. أنت مسؤول عن مشاكل مملكتك أولًا.\n` +
        `2. اختر الأعضاء الجديرين بالثقة وحرص على عدم حدوث مشاكل داخل الممالك أو مع الممالك الأخرى.\n` +
        `3. يجب احترام جميع الممالك.\n` +
        `4. لديك الصلاحية الكاملة لاختيار من يدخل مملكتك والقبول أو الرفض بناءً على التقديمات.\n` +
        `5. يمنع منعا باتا سحب أي عضو من مملكة أخرى.\n` +
        `6. يمنع الغش، وإذا تم ضبط أي عضو يغش، ستُعاقب المملكة بخصم نقاط أو عقوبات أخرى.\n` +
        `7. يجب التفاعل المستمر (صوتي وكتابي)، وفي حال الغياب لأسبوع مع نقاط منخفضة، يصدر تحذير، وإذا استمر أسبوعًا آخر، تُقيّم الإدارة الوضع لاتخاذ قرار بإلغاء الكلان أو منح فرصة أخيرة.\n\n` +
        
        `⸻`,
      components: [ticketRow]
    });
    
    
    return channel;
} 