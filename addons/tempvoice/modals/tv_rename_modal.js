/**
 * @namespace: addons/tempvoice/modals/tv_rename_modal.js
 * @type: Modal Handler
 *
 * Handler ini dipanggil begitu user submit "Rename TempVoice Channel" modal.
 * Triggered by @tv_rename.js (button) dan id modal 'tv_rename_modal' sesuai @interface.js.
 */

module.exports = {
    execute: async (interaction, container) => {
        const { models } = container;

        // Ambil value input teks
        const newName = interaction.fields.getTextInputValue('new_channel_name')?.trim();
        if (!newName || newName.length < 1 || newName.length > 100) {
            return interaction.reply({
                content: 'Nama channel harus 1-100 karakter.',
                ephemeral: true,
            });
        }

        // Cari channel user (pastikan user memang punya tempvoice)
        const activeChannel = await models.TempVoiceChannel.findOne({
            where: { ownerId: interaction.user.id, guildId: interaction.guild.id },
        });

        if (!activeChannel) {
            return interaction.reply({
                content: 'Kamu tidak punya channel TempVoice yang aktif!',
                ephemeral: true,
            });
        }

        // Fetch channel (may have been deleted)
        const channel = await interaction.guild.channels.fetch(activeChannel.channelId).catch(() => null);
        if (!channel) {
            return interaction.reply({
                content: 'Channel-mu tidak ditemukan! (Mungkin sudah dihapus)',
                ephemeral: true,
            });
        }

        // Action: Rename channel
        await channel.setName(newName).catch(() => null);

        // Optional: update name in DB if model stores it (skip if not needed)
        // await activeChannel.update({ name: newName });

        return interaction.reply({
            content: `Nama channel berhasil diubah menjadi: **${newName}**`,
            ephemeral: true,
        });
    },
};
