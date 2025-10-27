# Kythia Project: Coding Standards & Architecture Rules

This document outlines the official coding standards and architectural rules for the Kythia project. Following these rules is mandatory to ensure code consistency, maintainability, and scalability as the project grows.

## I. Directory & File Structure (The Golden Rules)

The core of our architecture is the strict separation of responsibilities between `src`, `addons/core`, and other `addons`.

### 1. `src/utils` (The "Plumber" 🧰)

This directory is for pure, low-level, generic utilities that have **no knowledge** of the Discord bot's specific logic.

* **Purpose:** Reusable functions for JavaScript/Node.js tasks.
* **Rules:**
    * **MUST NOT** `require` or `import` `discord.js`.
    * **MUST NOT** `require` or `import` any database models (e.g., `ServerSetting`).
    * **MUST NOT** reference the global `kythia` config object.
    * Functions here should be "pure" (e.g., take an input, return an output).
* **Examples:** `logger.js`, `time.js`, `color.js`, `formatter.js` (for numbers/strings), `translator.js` (the "dumb" part that only handles JSON parsing and key replacement).

---

### 2. `addons/core/helpers` (The "Building Manager" 🏢)

This is the **main shared helper directory** for the bot. If a function is needed by **more than one addon**, it belongs here.

* **Purpose:** Bot-level helper functions that are shared across the application.
* **Rules:**
    * **CAN** and **SHOULD** `require` or `import` `discord.js`.
    * **CAN** `require` or `import` *core* models (e.g., `ServerSetting`, `KythiaUser`).
    * **MUST** be used for any function shared between different addons.
* **Examples:** `automod.js`, `embed.js` (for `embedFooter`), `auth.js` (for `isOwner`, `isPremium`), `i18n.js` (the "smart" `t()` function that fetches guild language from the DB).
* **Requirement:** This directory **MUST** use a barrel file (`index.js` or `index.ts`) for all its exports.

---

### 3. `addons/<addon_name>/helpers` (The "Specialist" 🧑‍🍳)

This directory is for helper functions that are **only** used by that *one* specific addon.

* **Purpose:** Internal logic, specific to a single feature.
* **Rules:**
    * **MUST NOT** be required or imported by any *other* addon.
    * If another addon needs a function from here, that function **MUST** be promoted to `addons/core/helpers`.
    * **CAN** `require` or `import` its *own* models (e.g., `addons/economy/helpers` can use `addons/economy/database/models`).
* **Examples:** `adventure/helpers/charManager.js`, `economy/helpers/banks.js`, `music/helpers/musicManager.js`.
* **Requirement:** *Should* use a barrel file (`index.js` or `index.ts`) if the folder contains more than 2-3 files.

---

## II. Naming Conventions

Consistency is key.

* **Files & Folders:** Use **`camelCase`** (e.g., `guildMemberAdd.js`, `autoSetup`, `kythiaManager.js`).
* **Variables & Functions:** Use **`camelCase`** (e.g., `let newCooldown = ...`, `async function addXp(...)`).
* **Classes:** Use **`PascalCase`** (e.g., `class KythiaManager {...}`).
* **Constants:** Use **`UPPER_SNAKE_CASE`** (e.g., `const SPAM_THRESHOLD = 5;`).
* **Special Prefixes (`_`):**
    * `_command.js`: This file defines the **base slash command** for an addon or a group that contains subcommands.
    * `_group.js`: This file defines a **slash command sub-group**.
    * `_donate.js` (etc.): A file prefixed with `_` in a command folder generally implies it is a "legacy" or non-standard command that needs review. (This rule can be refined).

---

## III. Module & Import/Export Rules

* **Barrel Files (`index.js` or `index.ts`):**
    * `src/utils` **MUST** use a barrel file.
    * `addons/core/helpers` **MUST** use a barrel file.
    * When importing from these locations, other files **MUST** import from the barrel file (`@utils`), not the specific file (`@coreHelpers/logger`).

* **Path Aliases (`@`)**:
    * **MUST** use path aliases (e.g., `@utils`, `@coreModels`, `@src`) for all imports pointing to `src` or `addons/core`.
    * **FORBIDDEN:** Do not use relative path "hell" (e.g., `../../../../src/utils/logger`).

* **Circular Dependencies:**
    * Files within the *same* helper directory (e.g., two files in `src/utils`) **MUST NOT** import each other. This creates circular dependencies and will crash the bot. If they depend on each other, they must be merged or one must be promoted to a higher-level module.

---

## IV. Internationalization (i18n) Rules

* **File Structure:** All translations MUST be in a **nested JSON** format (e.g., `en.json`).
* **Key Naming Convention:** Keys **MUST** follow a **semi-nested** structure that mirrors the project's file path.
    * `common.*`: For general-purpose text (e.g., `common.error.generic`).
    * `<addon>.<folder>.<file>.*`: For addons.
        * **Example (3-level addon):** `fun.commands.tictactoe.title`
        * **Example (4-level core):** `core.commands.moderation.ban.embed_title`
* **Key Conflicts:**
    * In the rare case a key is both a string and an object path, the string value **MUST** be assigned to a `.text` sub-key.
    * **Example:** `common.error.vote.locked` becomes an object: `{ "text": "...", "button": "..." }`.
    * Code must then call `t(..., 'common.error.vote.locked.text')` to get the string.
* **Dynamic Keys:**
    * Dynamic keys (e.g., <code>t(\`key.${variable}\`)</code>) are strongly discouraged.
    * If unavoidable, they **MUST** be clearly documented in the code, and all possible key variations **MUST** be manually added to the `en.json` file. They will be flagged by the `check_t_ast.js` linter for manual review.

---

## V. Addon Architecture

All new features should be built as self-contained addons. A standard addon should have the following structure:

* `addons/<addon_name>/`:
    * `addon.json`: Metadata file (version, feature flag, active status).
    * `commands/`: Contains all command files for this addon.
    * `events/`: (Optional) Contains event listener files (e.g., `messageCreate.js`).
    * `helpers/`: (Optional) Contains helper functions *specific* to this addon (Rule #I.3).
    * `database/models/`: (Optional) Contains Sequelize models *specific* to this addon.
    * `register.js`: (Optional) Handles initialization logic, like registering button/modal handlers with the `AddonManager`.

---

## VI. Code & Documentation Standards

* **JSDoc:**
    * **File Header:** Every `.js` / `.ts` file **MUST** have a JSDoc header explaining its `@file` or `@namespace`, `@description`, `@copyright`, and `@version`.
    * **Functions:** All public/exported functions (especially in `helpers` and `managers`) **MUST** have JSDoc explaining what they do, their `@param` (with description), and their `@returns` (with description).
* **Logging:**
    * **DO NOT** use `console.log()` for standard logging.
    * Use `logger.info()` for general events, `logger.warn()` for non-breaking issues, `logger.debug()` for development info, and `logger.error()` for handled errors.
    * Critical, unexpected errors that cause a command to fail **SHOULD** be captured by Sentry.
* **Linting & Formatting:**
    * All code **MUST** adhere to the `.prettierrc` file. Run the formatter before committing.
    * All code **MUST** pass the `check_t_ast.js` linter. All "Missing Keys" must be fixed. "Dynamic" and "Unanalyzable" keys must be manually verified.