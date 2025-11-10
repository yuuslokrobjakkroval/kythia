/**
 * @namespace: addons/tempvoice/buttons/tv_lock.js
 * @type: Button Handler
 */
const { PermissionsBitField } = require('discord.js');

module.exports = async (interaction, container) => {
    const { models, t } = container;

    await interaction.deferUpdate();

    // 1. Cari channel milik user ini
    const activeChannel = await models.TempVoiceChannel.findOne({
        where: { ownerId: interaction.user.id, guildId: interaction.guild.id },
    });

    if (!activeChannel) {
        return interaction.followUp({ content: 'Kamu tidak punya channel tempvoice yang aktif!', ephemeral: true });
    }

    // 2. Ambil channel-nya
    const channel = await interaction.guild.channels.fetch(activeChannel.channelId).catch(() => null);
    if (!channel) {
        return interaction.followUp({ content: 'Channel-mu tidak ditemukan! (Mungkin sudah dihapus)', ephemeral: true });
    }

    // 3. Cek permission @everyone
    const everyoneRole = interaction.guild.roles.everyone;
    const perms = channel.permissionsFor(everyoneRole);
    const isLocked = !perms.has(PermissionsBitField.Flags.Connect); // Cek apakah sudah di-lock

    // 4. Balik permission-nya (Lock/Unlock)
    if (isLocked) {
        // Unlock
        await channel.permissionOverwrites.edit(everyoneRole, {
            Connect: true,
        });
        await interaction.followUp({ content: 'Channel berhasil di-unlock!', ephemeral: true });
    } else {
        // Lock
        await channel.permissionOverwrites.edit(everyoneRole, {
            Connect: false,
        });
        await interaction.followUp({ content: 'Channel berhasil di-lock! 🔒', ephemeral: true });
    }
};
