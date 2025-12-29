/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import fs   from 'fs';
import path from 'path';

/**
 * Manages file backups with a "Last 10 + Decades" retention policy.
 * @param {string} dataDir - Directory containing the source file.
 * @param {string} fileName - Name of the file (e.g. 'neuland.sqlite').
 */
export function manageBackups(dataDir = 'data', fileName = 'neuland.sqlite') {
    const backupDir = path.join(dataDir, 'backup');
    const maxRecentBackups = 10;

    // 1. Resolve paths and dynamic extension
    const sourcePath = path.resolve(dataDir, fileName);
    const resolvedBackupDir = path.resolve(backupDir);

    const fileInfo = path.parse(fileName);
    const baseName = fileInfo.name; // 'neuland'
    const extension = fileInfo.ext;  // '.sqlite', '.db', etc.

    // 2. Pre-flight checks
    if (!fs.existsSync(sourcePath)) {
        console.warn(`Source file not found: ${sourcePath}`);
        return;
    }

    if (!fs.existsSync(resolvedBackupDir)) {
        fs.mkdirSync(resolvedBackupDir, { recursive: true });
    }

    // 3. Get existing backups and find highest number
    const files = fs.readdirSync(resolvedBackupDir);

    // Escaping dots in extension for the RegEx
    const escapedExt = extension.replace('.', '\\.');
    const backupPattern = new RegExp(`^${baseName}_(\\d+)${escapedExt}$`);

    let backupNums = files
        .map(f => {
            const match = f.match(backupPattern);
            return match ? parseInt(match[1], 10) : null;
        })
        .filter(n => n !== null)
        .sort((a, b) => a - b);

    const nextNum = backupNums.length > 0 ? backupNums[backupNums.length - 1] + 1 : 1;

    // 4. Copy the file using the original extension
    const newBackupName = `${baseName}_${nextNum}${extension}`;
    const destPath = path.join(resolvedBackupDir, newBackupName);

    try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Backup created: ${newBackupName}`);
    } catch (err) {
        console.error(`Failed to create backup: ${err.message}`);
        return;
    }

    // Update list for cleanup logic
    backupNums.push(nextNum);
    backupNums.sort((a, b) => a - b);

    // 5. Retention Logic: Keep last 10 OR any multiple of 10
    const keepThreshold = backupNums.length - maxRecentBackups;

    backupNums.forEach((num, index) => {
        const isRecent = index >= keepThreshold;
        const isDecade = num % 10 === 0;

        if (!isRecent && !isDecade) {
            const fileToDelete = `${baseName}_${num}${extension}`;
            try {
                fs.unlinkSync(path.join(resolvedBackupDir, fileToDelete));
                console.log(`Cleanup: Removed ${fileToDelete}`);
            } catch (err) {
                console.error(`Error removing ${fileToDelete}: ${err.message}`);
            }
        }
    });
}
