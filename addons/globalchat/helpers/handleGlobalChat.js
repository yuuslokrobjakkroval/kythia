/**
 * @namespace: addons/globalchat/helpers/handleGlobalChat.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.5
 */

const fetch = require('node-fetch');
const { handleFailedGlobalChat } = require('./handleFailedGlobalChat');

async function handleGlobalChat(message, container) {
    const { logger } = container;

    if (message.author.bot) return;
    if (!message.guild) return;

    try {
        const referencedMessageData = message.referencedMessage
            ? {
                  id: message.referencedMessage.id,
                  content: message.referencedMessage.content,
                  author: {
                      id: message.referencedMessage.author.id,
                      username: message.referencedMessage.author.username,
                      globalName: message.referencedMessage.author.globalName || message.referencedMessage.author.username,
                      avatarURL: message.referencedMessage.author.displayAvatarURL(),
                  },
              }
            : null;

        const safeMessage = {
            id: message.id,
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                globalName: message.author.globalName || message.author.username,
                avatarURL: message.author.displayAvatarURL(),
            },
            channelId: message.channelId,
            guildId: message.guildId,
            referencedMessage: referencedMessageData,
            attachments: message.attachments.map((a) => ({
                url: a.url,
                contentType: a.contentType,

                id: a.id,
                filename: a.name,
                size: a.size,
                width: a.width,
                height: a.height,
            })),
            stickerItems: message.stickers.map((s) => ({
                id: s.id,
                name: s.name,
                formatType: s.format,
            })),
        };

        const apiUrl = kythia.addons.globalchat.apiUrl;
        const response = await fetch(`${apiUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: safeMessage,
                guildName: message.guild.name,
            }),
        });

        const result = await response.json();

        switch (result.status) {
            case 'ok':
                break;
            case 'ignored':
                break;
            case 'skipped':
                break;
            case 'partial':
                logger.warn(
                    `⚠️ [GlobalChat] Partial delivery: ${result.data?.deliveryStats?.successful || 0}/${result.data?.deliveryStats?.total || 0}`
                );
                if (result.data?.failedGuilds?.length > 0) {
                    const failedGuildsInfo = result.data.failedGuilds.map((g) => `${g.guildName || g.guildId} (${g.error})`).join(', ');
                    logger.warn(`⚠️ [GlobalChat] Failed guilds: ${failedGuildsInfo}`);
                }
                break;
            case 'failed':
                logger.error(`❌ [GlobalChat] All deliveries failed for message ${safeMessage.id}`);
                if (result.data?.failedGuilds?.length > 0) {
                    const failedGuildsInfo = result.data.failedGuilds.map((g) => `${g.guildName || g.guildId} (${g.error})`).join(', ');
                    logger.error(`❌ [GlobalChat] Failed guilds: ${failedGuildsInfo}`);

                    handleFailedGlobalChat(result.data.failedGuilds, container).catch((err) => {
                        logger.error('❌ [GlobalChat] Error during background webhook fix process:', err);
                    });
                }
                break;
            default:
                logger.warn(`⚠️ [GlobalChat] Unknown API response status: ${result.status}`);
                logger.info('🌏 [GlobalChat] Full response:', result);
        }

        if (result.status === 'ok' || result.status === 'partial') {
            logger.info(`🌏 [GlobalChat] 📤 Sent from: ${message.guild.name} (${message.guildId}) by ${message.author.tag}`);
        }
    } catch (apiError) {
        logger.error('❌ [GlobalChat] Failed to send message to API:', apiError);
    }
}

module.exports = { handleGlobalChat };
