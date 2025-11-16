/**
 * @namespace: addons/ticket/select_menus/ticket-select.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 1.0.0 (t-helper updated)
 */
const { createTicketChannel } = require('../helpers');
const { MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, t, helpers } = container;
        const { TicketConfig } = models;
        const { simpleContainer } = helpers.discord;

        const configId = interaction.values[0];
        if (!configId) {
            const desc = await t(interaction, 'ticket.errors.invalid_selection', '❌ Invalid ticket selection.');
            return interaction.reply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const ticketConfig = await TicketConfig.getCache({ id: configId });
        if (!ticketConfig) {
            const desc = await t(interaction, 'ticket.errors.invalid_config');
            return interaction.reply({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        await createTicketChannel(interaction, ticketConfig, container);
    },
};
