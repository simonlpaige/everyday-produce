#!/usr/bin/env node
/**
 * grade-photos.js - Apply EP warm color grade to raw photos, then open for labeling
 *
 * Run this AFTER you've dropped raw photos into the folder.
 * Produces graded JPGs in a _graded/ subfolder so originals are untouched.
 * Resizes to max 2400px on longest side - no cropping, no stretching.
 * Opens Explorer at _graded/ and launches Photopea in your browser.
 *
 * Usage:
 *   node scripts/grade-photos.js --folder photos/weekly-update-2026-05-23
 *   node scripts/grade-photos.js --folder photos/weekly-update-2026-05-23 --dry-run
 *   node scripts/grade-photos.js --folder photos/weekly-update-2026-05-23 --max-px 1600
 *
 * After this:
 *   - Open each _graded/ image in Photopea (drag in from Explorer)
 *   - Name it something descriptive: tomatoes.jpg, storefront.jpg, peaches.jpg
 *   - File -> Export As -> JPEG, save into the PARENT folder (not _graded/)
 *   - Run: node scripts/add-photos.js --folder photos/<folder> --no-grade
 *
 * Slot assignment (hero / card / portrait) is automatic from image dimensions.
 * No special naming required - just name it what it is.
 */

const fs   = require('fs');
const path = require('path');
const { spawnSync, execSync } = require('child_process');

// --- Args -------------------------------------------------------------------
const args = process.argv.slice(2);
const get  = (flag, def = null) => { const i = args.indexOf(flag); return i !== -1 && args[i+1] ? args[i+1] : def; };
const has  = (flag) => args.includes(flag);

const folderArg = get('--folder');
const dryRun    = has('--dry-run');
const maxPx     = parseInt(get('--max-px', '2400'), 10);
const quality   = parseInt(get('--quality', '92'), 10);

if (!folderArg) {
  console.error('Error: --folder <path> is required.');
  console.error('Example: node scripts/grade-photos.js --folder photos/weekly-update-2026-05-23');
  process.exit(1);
}

const siteRoot  = path.resolve(__dirname, '..');
const folder    = path.resolve(siteRoot, folderArg);
const gradedDir = path.join(folder, '_graded');

if (!fs.existsSync(folder)) {
  console.error('Error: folder not found: ' + folder);
  process.exit(1);
}

// --- Find raw photos (JPG + HEIC from iPhone) --------------------------------
const photos = fs.readdirSync(folder)
  .filter(f => /\.(jpg|jpeg|heic)$/i.test(f) && !f.startsWith('_'))
  .sort();

if (photos.length === 0) {
  console.error('No .jpg or .heic files found. Drop your raw photos into the folder first.');
  process.exit(1);
}

const heicCount = photos.filter(f => /\.heic$/i.test(f)).length;
console.log('\n🌽 Everyday Produce - grade-photos');
console.log('   Folder : ' + path.basename(folder));
console.log('   Found  : ' + photos.length + ' raw photo(s)' + (heicCount ? ' (' + heicCount + ' HEIC - will convert to JPG)' : ''));
console.log('   Resize : max ' + maxPx + 'px on longest side (no crop, no stretch)');
console.log('   Output : _graded/ subfolder');
if (dryRun) console.log('   MODE   : DRY RUN\n');
else console.log('');

// --- EP warm grade ffmpeg filter (PHOTO-STYLE-GUIDE.md values) ---------------
//
//   1. scale      - fit within maxPx x maxPx, preserve aspect ratio, no upscale
//   2. curves     - shadow lift (γ1.25 equivalent in shadow zone)
//   3. eq         - saturation 1.02, slight brightness warmth
//   4. colorchannelmixer - red x1.04, blue x0.96 (warm 5200K tint)
//
// Note: curves r/b channels would exceed [0,1] limit in this ffmpeg build,
// so warm tint is done via colorchannelmixer which has no output cap.

const scaleFilter  = 'scale=w=min(iw\\,' + maxPx + '):h=min(ih\\,' + maxPx + '):force_original_aspect_ratio=decrease:flags=lanczos';
const shadowFilter = 'curves=all=0/0 0.12/0.16 0.85/0.88 1/1';
const satFilter    = 'eq=saturation=1.02:brightness=0.008';
const tintFilter   = 'colorchannelmixer=rr=1.04:bb=0.96';

const GRADE_FILTER = [scaleFilter, shadowFilter, satFilter, tintFilter].join(',');

// --- Create _graded/ dir -----------------------------------------------------
if (!dryRun && !fs.existsSync(gradedDir)) {
  fs.mkdirSync(gradedDir, { recursive: true });
}

// --- Process each file -------------------------------------------------------
const results = [];

for (const file of photos) {
  const srcPath  = path.join(folder, file);
  const outFile  = file.replace(/\.heic$/i, '.jpg'); // HEIC -> jpg
  const destPath = path.join(gradedDir, outFile);

  process.stdout.write('  ' + file + ' -> _graded/' + outFile + ' ');

  if (dryRun) {
    console.log('[dry run]');
    results.push({ file, status: 'would-grade' });
    continue;
  }

  if (fs.existsSync(destPath)) {
    console.log('[already graded - skipping]');
    results.push({ file, status: 'skipped' });
    continue;
  }

  const r = spawnSync('ffmpeg', [
    '-y', '-i', srcPath,
    '-vf', GRADE_FILTER,
    '-q:v', '2',
    '-frames:v', '1',
    '-update', '1',
    destPath
  ], { encoding: 'utf8' });

  if (r.status !== 0) {
    console.log('[FAILED]');
    // Pull just the error line from stderr
    const errLine = (r.stderr || '').split('\n').find(l => /error|failed|invalid/i.test(l)) || r.stderr.split('\n').slice(-3).join(' ');
    console.log('  ' + errLine.trim());
    results.push({ file, status: 'error', err: errLine });
  } else {
    const srcSz  = (fs.statSync(srcPath).size / 1024).toFixed(0);
    const destSz = (fs.statSync(destPath).size / 1024).toFixed(0);
    console.log('ok (' + srcSz + 'KB -> ' + destSz + 'KB)');
    results.push({ file, status: 'ok' });
  }
}

const ok   = results.filter(r => r.status === 'ok').length;
const skip = results.filter(r => r.status === 'skipped').length;
const errs = results.filter(r => r.status === 'error').length;

console.log('\nGraded: ' + ok + ' | Skipped: ' + skip + ' | Errors: ' + errs);

if (dryRun) {
  console.log('\nDRY RUN - no files written.');
  process.exit(0);
}

if (errs > 0) {
  console.log('\nSome files failed. Check errors above.');
}

// --- Open _graded/ in Explorer + Photopea ------------------------------------
if (ok > 0 || skip > 0) {
  try { execSync('explorer "' + gradedDir + '"'); } catch (_) {}
  try { execSync('start https://www.photopea.com'); } catch (_) {}
}

// --- Instructions ------------------------------------------------------------
console.log([
  '',
  '---------------------------------------------------------------',
  ' GRADED FILES READY: photos/' + path.basename(folder) + '/_graded/',
  '',
  ' IN PHOTOPEA:',
  '   1. Drag a graded file from Explorer into Photopea',
  '   2. Name it something descriptive:',
  '      tomatoes.jpg, storefront.jpg, peaches.jpg, etc.',
  '   3. File -> Export As -> JPEG',
  '   4. Save into the PARENT folder (not _graded/)',
  '',
  ' Slot (hero/card/portrait) is assigned automatically from dimensions.',
  ' No special prefix needed. Just name it what it is.',
  '',
  ' THEN RUN:',
  '   node scripts/add-photos.js --folder ' + folderArg + ' --no-grade',
  '',
  ' NOTE: Crop out or reject any photos with price tags visible.',
  '---------------------------------------------------------------',
  ''
].join('\n'));
