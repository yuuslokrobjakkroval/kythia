/**
 * @namespace: addons/tempvoice/buttons/tv_rename.js
 * @type: Button Handler
 */

// Tombol ini hanya akan memunculkan modal "rename" untuk channel, bukan melakukan perubahan langsung.
module.exports = {
    execute: async (interaction, container) => {
        const { models } = container;

        await interaction.deferUpdate();

        // 1. Cari channel milik user ini
        const activeChannel = await models.TempVoiceChannel.findOne({
            where: { ownerId: interaction.user.id, guildId: interaction.guild.id },
        });

        if (!activeChannel) {
            return interaction.followUp({ content: 'Kamu tidak punya channel tempvoice yang aktif!', ephemeral: true });
        }

        // 2. Ambil channel-nya, pastikan masih ada
        const channel = await interaction.guild.channels.fetch(activeChannel.channelId).catch(() => null);
        if (!channel) {
            return interaction.followUp({ content: 'Channel-mu tidak ditemukan! (Mungkin sudah dihapus)', ephemeral: true });
        }

        // 3. Kirimkan modal untuk rename, asumsikan modal builder sudah disediakan & register.js siap
        // ID modal harus konsisten dengan yang didaftarkan saat bot.registerModalHandler
        return interaction.showModal({
            custom_id: 'tv_rename_modal',
            title: 'Rename TempVoice Channel',
            components: [
                {
                    type: 1, // ACTION_ROW
                    components: [
                        {
                            type: 4, // TEXT_INPUT
                            custom_id: 'new_channel_name',
                            style: 1, // SHORT
                            label: 'Nama baru channel',
                            placeholder: channel.name,
                            min_length: 1,
                            max_length: 100,
                            required: true,
                        },
                    ],
                },
            ],
        });
    },
};
