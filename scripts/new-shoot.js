#!/usr/bin/env node
/**
 * new-shoot.js — Create today's photo folder and open it in Explorer
 *
 * Usage:
 *   node scripts/new-shoot.js
 *   node scripts/new-shoot.js --name "mothers-day"
 *   node scripts/new-shoot.js --date 2026-05-24
 *
 * Creates: photos/<name>/ (default: weekly-update-YYYY-MM-DD)
 * Opens the new folder in Windows Explorer.
 * Prints next-step instructions.
 */

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args  = process.argv.slice(2);
const get   = (flag, def = null) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };

const today    = get('--date') || new Date().toISOString().slice(0, 10);
const nameArg  = get('--name');
const folder   = nameArg ? nameArg : `weekly-update-${today}`;

const siteRoot  = path.resolve(__dirname, '..');
const photoDir  = path.join(siteRoot, 'photos', folder);

// Create folder
if (fs.existsSync(photoDir)) {
  console.log(`\n📁 Folder already exists: photos/${folder}`);
} else {
  fs.mkdirSync(photoDir, { recursive: true });
  console.log(`\n📁 Created: photos/${folder}`);
}

// Drop a .gitkeep so git tracks the empty folder
const keep = path.join(photoDir, '.gitkeep');
if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');

// Open in Explorer
try {
  execSync(`explorer "${photoDir}"`);
  console.log('   Explorer opened.');
} catch (e) {
  console.log(`   (Could not open Explorer automatically — folder is at ${photoDir})`);
}

// Print instructions
console.log(`
───────────────────────────────────────────────
 STEP 1 ✅  Folder ready — drop your raw photos in
 STEP 2     When photos are in, run:
            node scripts/grade-photos.js --folder photos/${folder}
 STEP 3     Crop + label in Photopea (instructions printed then)
 STEP 4     node scripts/add-photos.js --folder photos/${folder} --no-grade
 STEP 5     Paste HTML snippets → node scripts/commit.js "Add ${folder} photos"
───────────────────────────────────────────────
`);
