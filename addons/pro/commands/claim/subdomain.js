/**
 * @namespace: addons/pro/commands/claim/subdomain.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('subdomain')
            .setDescription('🌐 Claim a new .kyth.me subdomain (Max 5).')
            .addStringOption((option) =>
                option.setName('name').setDescription('Unique subdomain name (e.g.: kythia-cool)').setRequired(true)
            ),

    async execute(interaction, container) {
        const { logger, kythiaConfig, models, helpers, t } = container;
        const { KythiaUser, Subdomain } = models;
        const { embedFooter } = helpers.discord;
        const MAX_SUBDOMAINS = kythiaConfig.addons.pro.maxSubdomains || 5;

        await interaction.deferReply({ ephemeral: true });
        const user = await KythiaUser.getCache({ userId: interaction.user.id });

        if (!user) {
            const desc = await t(interaction, 'pro.claim.subdomain.error.mustHaveAccount');
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const isPremiumActive = user.isPremium && new Date(user.premiumExpiresAt) > new Date();
        const isVoterActive = user.isVoted && new Date(user.voteExpiresAt) > new Date();

        if (!isPremiumActive && !isVoterActive) {
            const desc = await t(interaction, 'pro.claim.subdomain.error.proOrVoterRequired');
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const userSubdomains = await Subdomain.count({ where: { userId: interaction.user.id } });
        if (userSubdomains >= MAX_SUBDOMAINS) {
            const desc = await t(interaction, 'pro.claim.subdomain.error.maxReached', { max: MAX_SUBDOMAINS });
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const namaSubdomain = interaction.options.getString('name').toLowerCase();
        if (!/^[a-z0-9-]+$/.test(namaSubdomain) || namaSubdomain.length < 3 || namaSubdomain.length > 32) {
            const desc = await t(interaction, 'pro.claim.subdomain.error.invalidName');
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const forbiddenNames = ['www', 'mail', 'api', 'bot', 'admin', 'dashboard', 'kythia'];
        if (forbiddenNames.includes(namaSubdomain)) {
            const desc = await t(interaction, 'pro.claim.subdomain.error.forbidden', { name: namaSubdomain });
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            await Subdomain.create({
                userId: interaction.user.id,
                name: namaSubdomain,
            });

            const title = await t(interaction, 'pro.claim.subdomain.success.title');
            const desc = await t(interaction, 'pro.claim.subdomain.success.desc', {
                subdomain: namaSubdomain,
                domain: kythiaConfig.addons.pro.cloudflare.domain,
                used: userSubdomains + 1,
                max: MAX_SUBDOMAINS,
            });

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle(title)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                const desc = await t(interaction, 'pro.claim.subdomain.error.taken', { name: namaSubdomain });
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(desc)
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            logger.error(`[pro/claim] Gagal klaim subdomain untuk user ${interaction.user.id}:`, error);
            const desc = await t(interaction, 'pro.claim.subdomain.error.technical');
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
    },
};