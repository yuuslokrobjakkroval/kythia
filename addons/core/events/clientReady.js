/**
 * @namespace: addons/core/events/clientReady.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */

const { ActivityType } = require('discord.js');

function setBotPresence(client) {
    const logger = client.container.logger;
    if (!client.user) {
        logger.error('❌ client.user is undefined, cannot set presence.');
        return;
    }

    try {
        let activityType = ActivityType[kythia.bot.activityType];
        if (activityType === undefined) {
            logger.warn(`Invalid activityType '${kythia.bot.activityType}', defaulting to 'Playing'.`);
            activityType = ActivityType.Playing;
        }
        client.user.setPresence({
            activities: [
                {
                    name: kythia.bot.activity,
                    type: activityType,
                    url: kythia.bot.streakUrl || null,
                },
            ],
            status: kythia.bot.status || 'online',
        });
        logger.info('✅ Bot presence has been set.');
    } catch (err) {
        logger.error('❌ Failed to set bot presence:', err);
    }
}

module.exports = async (bot, client) => {
    setBotPresence(client);
};
