/**
 * @namespace: addons/streak/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.5
 */

const { handleGlobalChat } = require('../helpers/handleGlobalChat');

module.exports = async (bot, message) => {
    if (!kythia.addons.globalchat?.enabled) return;

    await handleGlobalChat(message, bot.container);
};
