/**
 * @namespace: addons/tempvoice/helpers/interface.js
 * @type: Helper
 *
 * Creates a TempVoice control panel modeled after the full button layout shown in the image (4x4 grid), suited for component v2 Discord UI.
 */
const {
    ContainerBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
} = require('discord.js');

/**
 * Generate TempVoice control interface components (component v2).
 * @param {string} channelId
 * @returns {{ components: any[] }}
 */
const buildInterface = (channelId) => {
    // Dynamic customIds (channel aware but privacy safe)
    const customId = (act) => `tv_${act}:${channelId}`;

    // Header
    const header = new TextDisplayBuilder().setContent('🎧 **TempVoice Control Panel**');
    const banner = new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythia.settings.bannerImage)]);
    const ctrlInfo = new TextDisplayBuilder().setContent('**Kontrol Channel:**\nGunakan tombol berikut untuk mengelola channel-mu.');

    const divider = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);

    // ---- BUTTONS ----
    // Row 1
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(customId('rename')).setLabel('NAME').setStyle(ButtonStyle.Secondary).setEmoji('⌨️'),
        new ButtonBuilder().setCustomId(customId('limit')).setLabel('LIMIT').setStyle(ButtonStyle.Secondary).setEmoji('👥'),
        new ButtonBuilder().setCustomId(customId('privacy')).setLabel('PRIVACY').setStyle(ButtonStyle.Secondary).setEmoji('🛡️'),
        new ButtonBuilder().setCustomId(customId('waiting')).setLabel('WAITING R.').setStyle(ButtonStyle.Secondary).setEmoji('⏲️'),
        new ButtonBuilder().setCustomId(customId('chat')).setLabel('CHAT').setStyle(ButtonStyle.Secondary).setEmoji('💬')
    );
    // Row 2
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(customId('trust')).setLabel('TRUST').setStyle(ButtonStyle.Success).setEmoji('🤝'),
        new ButtonBuilder().setCustomId(customId('untrust')).setLabel('UNTRUST').setStyle(ButtonStyle.Secondary).setEmoji('✂️'),
        new ButtonBuilder().setCustomId(customId('invite')).setLabel('INVITE').setStyle(ButtonStyle.Success).setEmoji('📞'),
        new ButtonBuilder().setCustomId(customId('kick')).setLabel('KICK').setStyle(ButtonStyle.Danger).setEmoji('📞'),
        new ButtonBuilder().setCustomId(customId('region')).setLabel('REGION').setStyle(ButtonStyle.Secondary).setEmoji('🌐')
    );
    // Row 3
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(customId('block')).setLabel('BLOCK').setStyle(ButtonStyle.Secondary).setEmoji('🚫'),
        new ButtonBuilder().setCustomId(customId('unblock')).setLabel('UNBLOCK').setStyle(ButtonStyle.Secondary).setEmoji('🟢'),
        new ButtonBuilder().setCustomId(customId('claim')).setLabel('CLAIM').setStyle(ButtonStyle.Primary).setEmoji('👑'),
        new ButtonBuilder().setCustomId(customId('transfer')).setLabel('TRANSFER').setStyle(ButtonStyle.Primary).setEmoji('🔁'),
        new ButtonBuilder().setCustomId(customId('delete')).setLabel('DELETE').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );

    // Optionally: pad each row to max 5 buttons (Discord limitation per row)
    // In the image "WAITING R." and "CHAT" are in row 1 as 4th/5th element, region at the end of row 2, delete at the end of row 3.
    // So, we respect the order and put all 13 buttons into 3 rows.

    const footer = new TextDisplayBuilder().setContent(
        '_Hanya owner channel yang dapat mengelola penuh. Jika kamu bukan owner, beberapa tombol akan dinonaktifkan._'
    );

    const container = new ContainerBuilder()
        .setAccentColor(0x5865f2)
        .addTextDisplayComponents(header)
        .addMediaGalleryComponents(banner)
        .addSeparatorComponents(divider)
        .addTextDisplayComponents(ctrlInfo)
        .addSeparatorComponents(divider)
        .addActionRowComponents(row1, row2, row3)
        .addSeparatorComponents(divider)
        .addTextDisplayComponents(footer);

    return {
        components: [container],
        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
    };
};

module.exports = {
    buildInterface,
};
