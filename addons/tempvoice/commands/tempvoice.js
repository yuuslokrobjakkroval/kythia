/**
 * @namespace: addons/tempvoice/commands/tempvoice.js
 * @type: Command
 */
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tempvoice')
        .setDescription('🎧 Mengatur sistem temporary voice channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
            sub
                .setName('setup')
                .setDescription('Setup channel "Join to Create".')
                .addChannelOption((option) =>
                    option
                        .setName('trigger_channel')
                        .setDescription('Channel voice yang akan memicu pembuatan channel baru.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildVoice)
                )
                .addChannelOption((option) =>
                    option
                        .setName('category')
                        .setDescription('Kategori tempat channel baru akan dibuat.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildCategory)
                )
                .addChannelOption((option) =>
                    option
                        .setName('control_panel')
                        .setDescription('Channel teks untuk mengirim interface kontrol.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText)
                )
        )
        .addSubcommand((sub) => sub.setName('disable').setDescription('Menonaktifkan sistem tempvoice.')),

    async execute(interaction, container) {
        const { models, logger } = container;
        const { TempVoiceConfig } = models;
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            const triggerChannel = interaction.options.getChannel('trigger_channel');
            const category = interaction.options.getChannel('category');
            const controlPanel = interaction.options.getChannel('control_panel');

            await TempVoiceConfig.findOrCreateWithCache({
                where: { guildId: interaction.guild.id },
                defaults: {
                    guildId: interaction.guild.id,
                    triggerChannelId: triggerChannel.id,
                    categoryId: category.id,
                    controlPanelChannelId: controlPanel.id,
                },
            });

            await interaction.reply({
                content: `Sistem TempVoice berhasil di-setup! User yang join \`${triggerChannel.name}\` akan dibuatkan channel baru.`,
                ephemeral: true,
            });
        } else if (subcommand === 'disable') {
            await TempVoiceConfig.destroy({
                where: { guildId: interaction.guild.id },
            });
            await interaction.reply({
                content: 'Sistem TempVoice berhasil dinonaktifkan.',
                ephemeral: true,
            });
        }
    },
};
