/**
 * @namespace: addons/TempVoiceConfig/database/models/TempVoiceConfig.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class TempVoiceConfig extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                guildId: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                triggerChannelId: {
                    // Channel "Join to Create"
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                controlPanelChannelId: {
                    // Channel teks buat ngirim interface
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                categoryId: {
                    // Kategori tempat bikin channel baru
                    type: DataTypes.STRING,
                    allowNull: false,
                },
            },
            {
                sequelize,
                modelName: 'TempVoiceConfig',
                tableName: 'temp_voice_configs',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = TempVoiceConfig;
