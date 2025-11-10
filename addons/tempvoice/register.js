/**
 * @namespace: addons/tempvoice/register.js
 * @type: Module
 */
// const tv_lock = require('./buttons/tv_lock');
const tv_rename = require('./buttons/tv_rename');
// const tv_limit = require('./buttons/tv_limit');
// const tv_kick = require('./buttons/tv_kick');
// const tv_delete = require('./buttons/tv_delete');

const tv_rename_modal = require('./modals/tv_rename_modal');
// const tv_limit_modal = require('./modals/tv_limit_modal');

module.exports = {
    async initialize(bot) {
        // 'bot' ini adalah instance Kythia (CEO-mu)
        const summary = [];

        // Daftarkan semua button handlers
        // bot.registerButtonHandler('tv_lock', tv_lock);
        bot.registerButtonHandler('tv_rename', tv_rename.execute);
        // bot.registerButtonHandler('tv_limit', tv_limit);
        // bot.registerButtonHandler('tv_kick', tv_kick);
        // bot.registerButtonHandler('tv_delete', tv_delete);

        summary.push(' └─ ✅ Tombol TempVoice terdaftar: lock, rename, limit, kick, delete');

        // Daftarkan semua modal handlers
        bot.registerModalHandler('tv_rename_modal', tv_rename_modal.execute);
        // bot.registerModalHandler('tv_limit_modal', tv_limit_modal);

        summary.push(' └─ ✅ Modal TempVoice terdaftar: rename, limit');

        return summary;
    },
};
