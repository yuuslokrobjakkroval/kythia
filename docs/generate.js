/**
 * @namespace: docs/generate.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.11-beta
 */

/**
 * 🚀 Kythia Docs Generator (Pro Edition)
 *
 * This script automatically generates detailed Markdown documentation for all bot commands
 * by reading their source files. It extracts not only the structure (name, options) but
 * also critical metadata like permissions, cooldowns, usage examples, and aliases.
 *
 * @version 0.9.11-beta
 */

require('dotenv').config();
require('../kythia.config.js');
require('module-alias/register');

const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, PermissionsBitField, SlashCommandSubcommandBuilder } = require('discord.js');

const rootAddonsDir = path.join(__dirname, '..', 'addons');
const outputDir = path.join(__dirname, 'commands');

const markdownBuffers = {};

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 💡 Gets the valid slash command builder from a command module.
 * Ignores contextMenuCommand as it's not relevant for this documentation format.
 * @param {object} commandModule - The required command module.
 * @returns {object|null} The valid builder or null.
 */
function getSlashCommandBuilder(commandModule) {
    if (!commandModule) return null;
    return commandModule.slashCommand || commandModule.data || null;
}

/**
 * Gets the string representation of an option type.
 * @param {ApplicationCommandOptionType} type - The option type.
 * @returns {string}
 */
function getOptionType(type) {
    switch (type) {
        case ApplicationCommandOptionType.String:
            return 'Text';
        case ApplicationCommandOptionType.Integer:
            return 'Integer';
        case ApplicationCommandOptionType.Number:
            return 'Number';
        case ApplicationCommandOptionType.Boolean:
            return 'Boolean';
        case ApplicationCommandOptionType.User:
            return 'User';
        case ApplicationCommandOptionType.Channel:
            return 'Channel';
        case ApplicationCommandOptionType.Role:
            return 'Role';
        case ApplicationCommandOptionType.Mentionable:
            return 'Mentionable';
        case ApplicationCommandOptionType.Attachment:
            return 'Attachment';
        default:
            return 'Unknown';
    }
}

/**
 * ✨ [UPGRADED] Generates Markdown documentation for command options.
 * Now includes an asterisk (*) for required options.
 * @param {Array} optionsData - The options array from the command JSON.
 * @param {boolean} [isListStyle=false] - Whether to render as a list or a section.
 * @returns {string} The generated Markdown string.
 */
function generateOptionsDocs(optionsData, isListStyle = false) {
    let md = isListStyle ? '' : '### ⚙️ Options\n\n';
    for (const opt of optionsData) {
        md += `- **\`${opt.name}${opt.required ? '*' : ''}\`**\n`;
        md += `  - **Description:** ${opt.description}\n`;
        md += `  - **Type:** ${getOptionType(opt.type)}\n`;
        if (opt.choices) {
            const choicesString = opt.choices.map((c) => `\`${c.name}\` (\`${c.value}\`)`).join(', ');
            md += `  - **Choices:** ${choicesString}\n`;
        }
    }
    return md;
}

/**
 * 📝 Generates Markdown for a subcommand.
 * Accepts extraSubMeta, optionally containing aliases and metadata for the subcommand.
 * @param {string} parentName - The name of the root command.
 * @param {object} subData - The subcommand's JSON data.
 * @param {string|null} [groupName=null] - The name of the subcommand group, if any.
 * @param {object} [extraSubMeta=null] - Metadata for this subcommand (e.g. aliases).
 * @returns {string} The generated Markdown string.
 */
function generateSubcommandDocs(parentName, subData, groupName = null, extraSubMeta = null) {
    const groupPrefix = groupName ? `${groupName} ` : '';
    const subOptions = subData.options || [];

    // Generate placeholder values for the example usage string
    const usageString = subOptions
        .map((opt) => {
            const placeholder = `<${opt.name.toLowerCase()}>`;
            return opt.required ? placeholder : `[${placeholder}]`;
        })
        .join(' ');

    let md = `**\`/${parentName} ${groupPrefix}${subData.name}${usageString ? ' ' + usageString : ''}\`**\n`;
    md += `> ${subData.description}\n`;

    // Aliases and metadata for subcommand if provided in extraSubMeta
    if (extraSubMeta && Array.isArray(extraSubMeta.aliases) && extraSubMeta.aliases.length > 0) {
        md += `> _Aliases: ${extraSubMeta.aliases.map(a => `\`${a}\``).join(', ')}_\n`;
    }
    if (extraSubMeta && extraSubMeta.ownerOnly) {
        md += `> _Owner Only: Yes_\n`;
    }
    if (extraSubMeta && extraSubMeta.cooldown) {
        md += `> _Cooldown: ${extraSubMeta.cooldown} seconds_\n`;
    }
    if (extraSubMeta && extraSubMeta.permissions && extraSubMeta.permissions.length > 0) {
        const perms = new PermissionsBitField(extraSubMeta.permissions).toArray();
        md += `> _User Permissions: ${perms.map(p=>`\`${p}\``).join(', ')}_\n`;
    }
    if (extraSubMeta && extraSubMeta.botPermissions && extraSubMeta.botPermissions.length > 0) {
        const perms = new PermissionsBitField(extraSubMeta.botPermissions).toArray();
        md += `> _Bot Permissions: ${perms.map(p=>`\`${p}\``).join(', ')}_\n`;
    }
    md += '\n';

    if (subOptions.length > 0) {
        md += `**Options for this subcommand:**\n`;
        md += generateOptionsDocs(subOptions, true);
    } else {
        md += `\n`;
    }
    return md;
}

/**
 * ✨ [NEW] Generates the metadata block for a command (permissions, cooldown, etc.), and aliases if present.
 * @param {object} commandModule - The full command module object.
 * @returns {string} The generated Markdown string for the metadata section.
 */
function generateMetadataDocs(commandModule) {
    let md = '### 📋 Details\n\n';
    let hasMetadata = false;

    // Handle aliases if present
    if (commandModule.aliases && Array.isArray(commandModule.aliases) && commandModule.aliases.length > 0) {
        md += `- **Aliases:** ${commandModule.aliases.map(a => `\`${a}\``).join(', ')}\n`;
        hasMetadata = true;
    }

    if (commandModule.ownerOnly) {
        md += `- **Owner Only:** ✅ Yes\n`;
        hasMetadata = true;
    }
    if (commandModule.cooldown) {
        md += `- **Cooldown:** ${commandModule.cooldown} seconds\n`;
        hasMetadata = true;
    }
    if (commandModule.permissions && commandModule.permissions.length > 0) {
        const perms = new PermissionsBitField(commandModule.permissions).toArray();
        md += `- **User Permissions:** \`${perms.join('`, `')}\`\n`;
        hasMetadata = true;
    }
    if (commandModule.botPermissions && commandModule.botPermissions.length > 0) {
        const perms = new PermissionsBitField(commandModule.botPermissions).toArray();
        md += `- **Bot Permissions:** \`${perms.join('`, `')}\`\n`;
        hasMetadata = true;
    }

    return hasMetadata ? md : '';
}

/**
 * ✨ [UPGRADED] Generates the complete Markdown for a command with a consistent structure.
 * Includes a "Usage" summary for ALL command types and lists aliases (if available).
 * Accepts subcommandExtraMeta: for split structure, so aliases from subcommand file bisa dimunculkan di dokumen.
 * @param {object} commandJSON - The command's toJSON() output.
 * @param {object} commandModule - The full command module object.
 * @param {object} [subcommandExtraMeta=null] - Mapping {subName: meta}, for split commands, for aliases and meta per sub.
 * @returns {string} The complete Markdown string for the command.
 */
function generateCommandMarkdown(commandJSON, commandModule, subcommandExtraMeta = null) {
    const parentName = commandJSON.name;
    let mdContent = `### 💾 \`/${parentName}\`\n\n`;
    mdContent += `**Description:** ${commandJSON.description}\n\n`;
    mdContent += generateMetadataDocs(commandModule);

    const subcommands = commandJSON.options?.filter(
        (opt) => opt.type === ApplicationCommandOptionType.Subcommand || opt.type === ApplicationCommandOptionType.SubcommandGroup
    );
    const regularOptions = commandJSON.options?.filter(
        (opt) => opt.type !== ApplicationCommandOptionType.Subcommand && opt.type !== ApplicationCommandOptionType.SubcommandGroup
    );

    // --- USAGE SUMMARY SECTION ---
    mdContent += '### 💻 Usage\n\n';
    if (subcommands && subcommands.length > 0) {
        subcommands.forEach((sub) => {
            if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
                sub.options.forEach((subInGroup) => {
                    const usageString = (subInGroup.options || [])
                        .map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`))
                        .join(' ');
                    mdContent += `\`/${parentName} ${sub.name} ${subInGroup.name}${usageString ? ' ' + usageString : ''}\`\n`;
                });
            } else {
                const usageString = (sub.options || []).map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`)).join(' ');
                mdContent += `\`/${parentName} ${sub.name}${usageString ? ' ' + usageString : ''}\`\n`;
            }
        });
        mdContent += '\n';
    } else if (regularOptions && regularOptions.length > 0) {
        const usageString = regularOptions.map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`)).join(' ');
        mdContent += `\`/${parentName}${usageString ? ' ' + usageString : ''}\`\n\n`;
    } else {
        mdContent += `\`/${parentName}\`\n\n`;
    }

    // --- DETAILED BREAKDOWN SECTION ---
    if (subcommands && subcommands.length > 0) {
        mdContent += `### 🔧 Subcommands\n\n`;
        for (const sub of subcommands) {
            if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
                for (const subInGroup of sub.options) {
                    const meta = subcommandExtraMeta && subcommandExtraMeta[subInGroup.name] ? subcommandExtraMeta[subInGroup.name] : null;
                    mdContent += generateSubcommandDocs(parentName, subInGroup, sub.name, meta);
                }
            } else {
                const meta = subcommandExtraMeta && subcommandExtraMeta[sub.name] ? subcommandExtraMeta[sub.name] : null;
                mdContent += generateSubcommandDocs(parentName, sub, null, meta);
            }
        }
    } else if (regularOptions && regularOptions.length > 0) {
        mdContent += generateOptionsDocs(regularOptions);
    }

    return mdContent;
}

/**
 * ✨ [NEW] Processes a directory with a split command structure (_command.js).
 * It assembles the main command and all its subcommands before generating docs.
 * Memperhatikan aliases dan metadata dari subcommand file juga.
 * @param {string} dirPath - Path to the command directory.
 * @param {string} categoryName - The name of the category/addon.
 */
function processSplitCommandDirectory(dirPath, categoryName) {
    console.log(`[SPLIT] Assembling '${categoryName}' from folder...`);
    try {
        const baseCommandPath = path.join(dirPath, '_command.js');
        const baseCommandModule = require(baseCommandPath);

        if (baseCommandModule.ownerOnly) {
            console.log(`⏩ Ignoring owner-only split command in '${categoryName}'.`);
            return;
        }

        const mainBuilder = getSlashCommandBuilder(baseCommandModule);
        if (!mainBuilder || typeof mainBuilder.addSubcommand !== 'function') {
            console.error(`❌ Base command in ${categoryName} is not a valid SlashCommandBuilder.`);
            return;
        }

        const subcommandFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.js') && file !== '_command.js');

        // Mapping: { subcommand name -> meta from subcommandModule (aliases, cooldown, ...)}
        const subcommandExtraMeta = {};

        for (const subFile of subcommandFiles) {
            const subFilePath = path.join(dirPath, subFile);
            const subcommandModule = require(subFilePath);

            // Kumpulkan aliases dan properti meta lain dari setiap subcommand file
            if (typeof subcommandModule.data === 'function') {
                const subcommandBuilder = new SlashCommandSubcommandBuilder();
                subcommandModule.data(subcommandBuilder);
                mainBuilder.addSubcommand(subcommandBuilder);

                // Untuk identifikasi nama subcommand yang benar:
                let subcommandName = null;
                try {
                    // If it uses .setName()
                    subcommandName = subcommandBuilder.name; // Should be set by .setName()
                } catch (err) {
                    // fallback to fileName without ext
                    subcommandName = path.basename(subFile, '.js');
                }

                // Get meta information (aliases, ownerOnly, cooldown, permissions, botPermissions)
                const subMeta = {};
                if (Array.isArray(subcommandModule.aliases) && subcommandModule.aliases.length > 0) {
                    subMeta.aliases = subcommandModule.aliases;
                }
                if (subcommandModule.ownerOnly) subMeta.ownerOnly = true;
                if (subcommandModule.cooldown) subMeta.cooldown = subcommandModule.cooldown;
                if (subcommandModule.permissions && subcommandModule.permissions.length > 0) subMeta.permissions = subcommandModule.permissions;
                if (subcommandModule.botPermissions && subcommandModule.botPermissions.length > 0) subMeta.botPermissions = subcommandModule.botPermissions;
                if (Object.keys(subMeta).length > 0 && subcommandName) {
                    subcommandExtraMeta[subcommandName] = subMeta;
                }
            }
        }

        const commandJSON = mainBuilder.toJSON();
        const markdown = generateCommandMarkdown(commandJSON, baseCommandModule, subcommandExtraMeta);

        if (!markdownBuffers[categoryName]) {
            markdownBuffers[categoryName] = `## 📁 Command Category: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n\n`;
        }
        markdownBuffers[categoryName] += markdown + '\n\n';
        console.log(`[SPLIT] Added assembled command '${commandJSON.name}' to buffer`);
    } catch (e) {
        console.error(`❌ Failed to assemble split command in addon ${categoryName}: ${e.message}`);
    }
}

function runGenerator() {
    console.log('🚀 Starting documentation generator...');

    const addons = fs.readdirSync(rootAddonsDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());

    for (const addon of addons) {
        const commandsPath = path.join(rootAddonsDir, addon.name, 'commands');
        if (!fs.existsSync(commandsPath)) continue;

        const processSimpleDirectory = (dirPath, categoryName) => {
            const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.js'));
            for (const file of files) {
                try {
                    const filePath = path.join(dirPath, file);
                    const commandModule = require(filePath);

                    if (commandModule.ownerOnly) {
                        console.log(`⏩ Ignoring owner-only command '${file}' in '${categoryName}'.`);
                        continue;
                    }

                    const commandBuilder = getSlashCommandBuilder(commandModule);

                    if (!commandBuilder) continue;

                    const commandJSON = commandBuilder.toJSON();
                    const markdown = generateCommandMarkdown(commandJSON, commandModule);

                    if (!markdownBuffers[categoryName]) {
                        markdownBuffers[categoryName] =
                            `## 📁 Command Category: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n\n`;
                    }
                    markdownBuffers[categoryName] += markdown + '\n\n';
                    console.log(`[${categoryName.toUpperCase()}] Added '${commandJSON.name}' to buffer`);
                } catch (e) {
                    console.error(`❌ Failed to process file ${file} in category ${categoryName}: ${e.message}`);
                }
            }
        };

        const categoryName = addon.name;
        const baseCommandPath = path.join(commandsPath, '_command.js');

        if (fs.existsSync(baseCommandPath)) {
            processSplitCommandDirectory(commandsPath, categoryName);
        } else if (addon.name === 'core') {
            const coreCategories = fs.readdirSync(commandsPath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
            for (const category of coreCategories) {
                processSimpleDirectory(path.join(commandsPath, category.name), category.name);
            }
        } else {
            processSimpleDirectory(commandsPath, categoryName);
        }
    }

    console.log('\n✅ Writing all buffers to .md files...');
    for (const categoryName in markdownBuffers) {
        try {
            const outputFilePath = path.join(outputDir, `${categoryName}.md`);
            fs.writeFileSync(outputFilePath, markdownBuffers[categoryName]);
            console.log(`   -> Generated: ${path.relative(path.join(__dirname, '..'), outputFilePath)}`);
        } catch (e) {
            console.error(`❌ Failed to write file for category ${categoryName}: ${e.message}`);
        }
    }

    console.log('\n🎉 Documentation generator finished successfully.');
}

runGenerator();
