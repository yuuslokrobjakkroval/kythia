/**
 * @namespace: addons/ticket/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const ticketCreate = require('./buttons/ticket-create.js');
const ticketClose = require('./buttons/ticket-close.js');
const ticketSelect = require('./select_menus/ticket-select.js');

const tktPanelModalShow = require('./buttons/tkt-panel-modal-show.js');
const tktPanelCreate = require('./modals/tkt-panel-create.js');

const tktTypeStep1Show = require('./buttons/tkt-type-step1-show.js');
const tktTypeStep1Submit = require('./modals/tkt-type-step1-submit.js');
const tktTypeStep2Show = require('./buttons/tkt-type-step2-show.js');
const tktTypeStep2Submit = require('./modals/tkt-type-step2-submit.js');

const initialize = (bot) => {
    const summary = [];
    try {
        bot.registerButtonHandler('ticket-create', ticketCreate.execute);
        bot.registerButtonHandler('ticket-close', ticketClose.execute);
        bot.registerSelectMenuHandler('ticket-select', ticketSelect.execute);
        summary.push("  └─ Interaction: 'ticketcreate', 'ticketclose', 'ticketselect' (User Facing)");

        bot.registerButtonHandler('tkt-panel-modal-show', tktPanelModalShow.execute);
        bot.registerModalHandler('tkt-panel-create', tktPanelCreate.execute);
        summary.push("  └─ Panel Setup: 'tkt-panel-modal-show', 'tkt-panel-create'");

        bot.registerButtonHandler('tkt-type-step1-show', tktTypeStep1Show.execute);
        bot.registerModalHandler('tkt-type-step1-submit', tktTypeStep1Submit.execute);
        bot.registerButtonHandler('tkt-type-step2-show', tktTypeStep2Show.execute);
        bot.registerModalHandler('tkt-type-step2-submit', tktTypeStep2Submit.execute);

        summary.push(
            "  └─ Type Setup: 'tkt-type-step1-show', 'tkt-type-step1-submit', 'tkt-type-step2-show', 'tkt-type-step2-submit' (Multi-Modal Flow)"
        );
    } catch (error) {
        console.error('Failed to register ticket handlers:', error);
    }
    return summary;
};

module.exports = {
    initialize,
};
