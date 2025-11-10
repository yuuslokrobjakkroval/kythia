/**
 * @namespace: addons/tempvoice/events/voiceStateUpdate.js
 * @type: Event
 */
const { ChannelType, PermissionsBitField } = require('discord.js');
const { buildInterface } = require('../helpers/interface'); // Helper yang akan kita buat

module.exports = async (bot, oldState, newState) => {
    const container = bot.client.container;
    const { models, logger } = container;
    const { TempVoiceConfig } = models;
    const { guild, member, channelId: newChannelId } = newState;

    const oldChannelId = oldState.channelId;

    const config = await TempVoiceConfig.getCache({ guildId: guild.id });
    if (!config) return; // Fitur gak aktif di guild ini

    // --- 1. LOGIKA CREATE CHANNEL ---
    if (newChannelId === config.triggerChannelId) {
        try {
            // Buat channel baru
            const newChannel = await guild.channels.create({
                name: `🎧 ${member.displayName}'s Room`,
                type: ChannelType.GuildVoice,
                parent: config.categoryId,
                permissionOverwrites: [
                    {
                        id: member.id, // User yang join
                        allow: [
                            PermissionsBitField.Flags.ManageChannels, // Kasih hak "owner"
                            PermissionsBitField.Flags.MoveMembers,
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.Connect,
                        ],
                    },
                    {
                        id: guild.roles.everyone, // @everyone
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
                    },
                ],
            });

            // Pindahin user ke channel baru
            await member.voice.setChannel(newChannel);

            // Kirim interface ke control panel
            const controlPanelChannel = await guild.channels.fetch(config.controlPanelChannelId).catch(() => null);
            let interfaceMessage;
            if (controlPanelChannel) {
                const { components, flags } = buildInterface(newChannel.id); // Panggil helper
                interfaceMessage = await controlPanelChannel.send({
                    components,
                    flags,
                });
            }

            // Simpan ke database channel aktif
            await models.TempVoiceChannel.create({
                channelId: newChannel.id,
                guildId: guild.id,
                ownerId: member.id,
                interfaceMessageId: interfaceMessage ? interfaceMessage.id : null,
            });
        } catch (error) {
            logger.error(`[TempVoice] Gagal membuat channel untuk ${member.user.tag}:`, error);
        }
    }

    // --- 2. LOGIKA DELETE CHANNEL (CLEANUP) ---
    if (oldChannelId && oldChannelId !== config.triggerChannelId) {
        // Cek apakah channel yang ditinggal itu channel tempvoice
        const activeChannel = await models.TempVoiceChannel.findOne({ where: { channelId: oldChannelId } });

        if (activeChannel) {
            // Ambil channel-nya
            const channel = await guild.channels.fetch(oldChannelId).catch(() => null);

            // Kalo channel-nya ada DAN kosong, hapus
            if (channel && channel.members.size === 0) {
                await channel.delete('Temp channel empty.');

                // Hapus dari database
                await models.TempVoiceChannel.destroy({ where: { channelId: oldChannelId } });

                // Hapus message interface-nya
                const controlPanelChannel = await guild.channels.fetch(config.controlPanelChannelId).catch(() => null);
                if (controlPanelChannel && activeChannel.interfaceMessageId) {
                    const msg = await controlPanelChannel.messages.fetch(activeChannel.interfaceMessageId).catch(() => null);
                    if (msg) await msg.delete();
                }
            }
        }
    }
};
