/**
 * @namespace: addons/globalchat/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.5
 */

const logger = require('@utils/logger');
const { initializeWebhookHealthCheck } = require('./tasks/webhookHealthCheck');

module.exports = {
    async initialize(bot) {
        const summery = [];

        initializeWebhookHealthCheck(bot);
        summery.push('   └─ Task: Webhook Health Check (Cron Job) On');

        return summery;
    },
};
