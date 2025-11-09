/**
 * @namespace: addons/pro/commands/dns/list.js
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
            .setName('list')
            .setDescription('🌐 Show all DNS records for one of your subdomains.')
            .addStringOption((option) =>
                option
                    .setName('subdomain')
                    .setDescription('The subdomain name you want to view (e.g. my-project)')
                    .setRequired(true)
                    .setAutocomplete(true)
            ),

    async autocomplete(interaction, container) {
        const { models } = container;
        const { Subdomain } = models;
        const focusedValue = interaction.options.getFocused();

        const userSubdomains = await Subdomain.findAll({
            where: { userId: interaction.user.id },
            limit: 10,
        });

        const filtered = userSubdomains.filter((s) => s.name.startsWith(focusedValue));

        await interaction.respond(filtered.map((subdomain) => ({ name: subdomain.name, value: subdomain.name })));
    },

    async execute(interaction, container) {
        const { logger, kythiaConfig, models, helpers, t } = container;
        const { KythiaUser, Subdomain, DnsRecord } = models;
        const { embedFooter, isPremium, isVoterActive } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const isPremiumDonor = await isPremium(interaction.user.id);
        const isVoter = await isVoterActive(interaction.user.id);

        if (!isPremiumDonor && !isVoter) {
            const desc = await t(interaction, 'pro.dns.list.not_allowed');
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const subdomainName = interaction.options.getString('subdomain');
        const targetSubdomain = await Subdomain.getCache({
            name: subdomainName,
            userId: interaction.user.id,
        });

        if (!targetSubdomain) {
            const desc = await t(interaction, 'pro.dns.list.not_found', { subdomain: subdomainName });
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(desc)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const records = await DnsRecord.findAll({
            where: { subdomainId: targetSubdomain.id },
        });

        const domainName = kythiaConfig.addons.pro.cloudflare.domain;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(
                await t(interaction, 'pro.dns.list.title', {
                    fqdn: `${targetSubdomain.name}.${domainName}`,
                })
            )
            .setFooter(await embedFooter(interaction));

        if (records.length === 0) {
            embed.setDescription(await t(interaction, 'pro.dns.list.no_record'));
            return interaction.editReply({ embeds: [embed] });
        }

        const recordFields = records.map(async (record) => {
            const fqdn =
                record.name === '@' ? `${targetSubdomain.name}.${domainName}` : `${record.name}.${targetSubdomain.name}.${domainName}`;

            return {
                name: await t(interaction, 'pro.dns.list.field_name', {
                    id: record.id,
                    type: record.type,
                }),
                value: await t(interaction, 'pro.dns.list.field_value', {
                    name: record.name,
                    value: record.value,
                }),
                inline: false,
            };
        });

        embed.addFields(await Promise.all(recordFields));
        embed.setDescription(
            await t(interaction, 'pro.dns.list.has_record', {
                count: records.length,
            })
        );

        return interaction.editReply({ embeds: [embed] });
    },
};