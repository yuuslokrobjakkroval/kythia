/**
 * @namespace: src/utils/integrity.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.10-beta
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Recursively collects full file paths under a directory.
 * @param {string} dir - Directory to scan.
 * @returns {Promise<string[]>} List of absolute file paths.
 */
async function getFilePaths(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
        dirents.map((dirent) => {
            const res = path.resolve(dir, dirent.name);
            return dirent.isDirectory() ? getFilePaths(res) : res;
        })
    );
    return Array.prototype.concat(...files);
}

/**
 * Creates a single, consistent SHA256 hash from all files within a directory.
 * @param {string} directoryPath - Path to the addon folder.
 * @returns {Promise<string>} Hex-encoded SHA256 digest.
 */
async function createDirectoryHash(directoryPath) {
    const sha256 = crypto.createHash('sha256');
    let filePaths = await getFilePaths(directoryPath);

    // 1) Filter out addon.json itself from the hash calculation
    filePaths = filePaths.filter((p) => path.basename(p) !== 'addon.json');

    // 2) Sort paths to ensure consistent order, regardless of the OS
    filePaths.sort();

    // 3) Read each file and update the hash
    for (const filePath of filePaths) {
        const fileData = await fs.readFile(filePath);
        sha256.update(fileData);
    }

    return sha256.digest('hex');
}

module.exports = { createDirectoryHash };
