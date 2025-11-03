/**
 * @namespace: addons/core/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */

const cron = require('node-cron');
const { cleanupUserCache } = require('./helpers/index.js');
const setupTopGGPoster = require('./tasks/topggPoster.js');
const { userCache } = require('./helpers/automod.js');
const { runStatsUpdater } = require('./helpers/stats.js');

const initialize = (bot) => {
    const logger = bot.container.logger;
    const summary = [];

    try {
        const reactRoleHandler = require('./buttons/reactrole.js');

        bot.registerButtonHandler('reactrole', reactRoleHandler.execute);
        summary.push("  └─ Button: 'reactrole'");
    } catch (error) {
        logger.error("Error registering button handler 'reactrole':", error);
    }

    // Setup Top.gg auto-poster
    const topGGPoster = setupTopGGPoster(bot);
    if (topGGPoster) {
        summary.push('  └─ Task: Top.gg auto-poster initialized');
        process.on('exit', () => {
            topGGPoster.cleanup();
        });
    }

    cron.schedule('0 * * * *', () => cleanupUserCache(userCache));
    summary.push('  └─ Cron: cleanup user cache (per day at 00:00)');

    cron.schedule('* * * * *', () => runStatsUpdater(bot.client));
    summary.push('  └─ Cron: cleanup user cache (every 5 minutes)');

    return summary;
};

module.exports = {
    initialize,
};
