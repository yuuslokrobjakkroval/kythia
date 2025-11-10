/**
 * @namespace: addons/TempVoiceChannel/database/models/TempVoiceChannel.js
 * @type: Database Model
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */

const { DataTypes } = require('sequelize');

const { KythiaModel } = require('kythia-core');

class TempVoiceChannel extends KythiaModel {
    static init(sequelize) {
        super.init(
            {
                channelId: {
                    // ID channel voice yang dibuat
                    type: DataTypes.STRING,
                    primaryKey: true,
                    allowNull: false,
                },
                guildId: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                ownerId: {
                    // ID user yang punya channel
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                interfaceMessageId: {
                    // ID message interface di channel control panel
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'TempVoiceChannel',
                tableName: 'temp_voice_channels',
                timestamps: true,
            }
        );

        return this;
    }
}

module.exports = TempVoiceChannel;
