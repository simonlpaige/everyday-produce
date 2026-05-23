#!/usr/bin/env node
/**
 * add-photos.js — Everyday Produce Market image intake workflow
 *
 * Drop a folder of raw JPGs from Konrad, run this, get:
 *   - webp versions (same folder)
 *   - pixel-correct width/height attributes
 *   - AI-generated alt text (Gemma vision, EP-aware prompt)
 *   - HTML snippets pre-slotted by aspect ratio
 *   - _manifest.json for the folder
 *   - _contact-sheet.jpg visual grid
 *
 * Usage:
 *   node scripts/add-photos.js --folder photos/weekly-update-2026-05-23
 *   node scripts/add-photos.js --folder photos/weekly-update-2026-05-23 --grade
 *   node scripts/add-photos.js --folder photos/weekly-update-2026-05-23 --no-ai
 *   node scripts/add-photos.js --folder photos/weekly-update-2026-05-23 --dry-run
 *
 * Flags:
 *   --folder <path>   Required. Relative or absolute path to photo folder.
 *   --grade           Apply EP-specific warm color grade during webp conversion.
 *   --no-ai           Skip Gemma alt text (uses filename-based fallback).
 *   --dry-run         Print what would happen, create nothing.
 *   --model <name>    Ollama model for vision (default: gemma4:e4b).
 *   --quality <n>     webp quality 1-100 (default: 85).
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const https = require('http');

// ─── Parse args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const get = (flag, def = null) => {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : def;
};
const has = (flag) => args.includes(flag);

const folderArg = get('--folder');
const applyGrade = has('--grade');
const skipAI = has('--no-ai');
const dryRun = has('--dry-run');
const model = get('--model', 'gemma4:e4b');
const quality = parseInt(get('--quality', '85'), 10);

if (!folderArg) {
  console.error('Error: --folder <path> is required.');
  console.error('Example: node scripts/add-photos.js --folder photos/weekly-update-2026-05-23');
  process.exit(1);
}

// Resolve relative to site root (one level up from scripts/)
const siteRoot = path.resolve(__dirname, '..');
const folder = path.resolve(siteRoot, folderArg);

if (!fs.existsSync(folder)) {
  console.error(`Error: folder not found: ${folder}`);
  process.exit(1);
}

const folderName = path.basename(folder);
console.log(`\n🌽 Everyday Produce — add-photos`);
console.log(`   Folder : ${folderName}`);
console.log(`   Grade  : ${applyGrade ? 'EP warm grade ON' : 'off'}`);
console.log(`   AI alt : ${skipAI ? 'off (filename fallback)' : `Gemma vision (${model})`}`);
console.log(`   Quality: ${quality}`);
if (dryRun) console.log(`   MODE   : DRY RUN — nothing will be written\n`);
else console.log('');

// ─── Find JPGs ───────────────────────────────────────────────────────────────
const jpegs = fs.readdirSync(folder)
  .filter(f => /\.(jpg|jpeg)$/i.test(f) && !f.startsWith('_'))
  .sort();

if (jpegs.length === 0) {
  console.error('No .jpg files found in folder (skipping _-prefixed files).');
  process.exit(1);
}
console.log(`Found ${jpegs.length} image(s): ${jpegs.join(', ')}\n`);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDimensions(imgPath) {
  try {
    const result = spawnSync('ffprobe', [
      '-v', 'quiet', '-print_format', 'json', '-show_streams', imgPath
    ], { encoding: 'utf8' });
    const data = JSON.parse(result.stdout);
    const stream = data.streams.find(s => s.width && s.height);
    if (stream) return { width: stream.width, height: stream.height };
  } catch (_) {}
  // Fallback: Python PIL
  try {
    const result = spawnSync('python', [
      '-c', `from PIL import Image; img=Image.open(${JSON.stringify(imgPath)}); print(img.width, img.height)`
    ], { encoding: 'utf8' });
    const [w, h] = result.stdout.trim().split(' ').map(Number);
    if (w && h) return { width: w, height: h };
  } catch (_) {}
  throw new Error(`Could not read dimensions for ${imgPath}`);
}

function inferSlot(width, height) {
  const ratio = width / height;
  // EP slot rules from PHOTO-STYLE-GUIDE.md:
  //   16:9 (ratio ~1.78) -> .gallery-item hero row (storefront / awning / wide)
  //   4:3  (ratio ~1.33) -> .season-photo (produce bins, wide stand shots)
  //   3:4  (ratio ~0.75) -> .callout-photo / .weekend-photo-card (tight produce close-ups)
  //   square-ish         -> .weekend-photo-card
  if (ratio >= 1.6) return 'gallery-item';
  if (ratio >= 1.1) return 'season-photo';
  if (ratio <= 0.8) return 'callout-photo';
  return 'weekend-photo-card';
}

function slotDescription(slot) {
  const map = {
    'gallery-item':       '16/9 hero row — storefront / awning / wide stand shots',
    'season-photo':       '4/3 landscape — produce bins, wide stand shots',
    'callout-photo':      '3/4 portrait — tight produce close-ups (money shot)',
    'weekend-photo-card': '3/4 portrait — weekly update grid card',
  };
  return map[slot] || slot;
}

function toWebp(srcPath, destPath) {
  // EP warm grade (--grade flag):
  //   sat +2%, warm tint: red *1.04 / blue *0.96, slight shadow lift
  const gradeFilter = applyGrade
    ? 'eq=saturation=1.02:brightness=0.01,curves=r=\'0/0 1/1.04\':b=\'0/0 1/0.95\''
    : null;

  const ffArgs = ['-y', '-i', srcPath];
  if (gradeFilter) ffArgs.push('-vf', gradeFilter);
  ffArgs.push('-quality', String(quality), destPath);

  const result = spawnSync('ffmpeg', ffArgs, { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${path.basename(srcPath)}: ${result.stderr}`);
  }
}

function makeContactSheet(imagePaths, outPath) {
  // Scale each to 400px wide, then tile using hstack + vstack.
  // Supports 1-8 images; falls back gracefully.
  const n = imagePaths.length;
  if (n === 0) return false;

  const labels = 'abcdefgh'.slice(0, n).split('');
  const inputs = imagePaths.flatMap(p => ['-i', p]);
  const scales = labels.map((l, i) => `[${i}:v]scale=400:-1[${l}]`).join(';');

  let stack;
  if (n === 1) {
    stack = `[a]copy[out]`;
  } else if (n === 2) {
    stack = `[a][b]hstack[out]`;
  } else if (n === 3) {
    stack = `[a][b]hstack[top];[top][c]hstack[out]`;
  } else if (n === 4) {
    stack = `[a][b]hstack[top];[c][d]hstack[bot];[top][bot]vstack[out]`;
  } else if (n <= 6) {
    // 2 rows: first row n-3, second row 3
    const r1 = labels.slice(0, 3).map(l => `[${l}]`).join('') + `hstack=inputs=3[top]`;
    const r2 = labels.slice(3, n).map(l => `[${l}]`).join('') + `hstack=inputs=${n-3}[bot]`;
    stack = `${r1};${r2};[top][bot]vstack[out]`;
  } else {
    // 2 rows of 4
    const r1 = `[a][b][c][d]hstack=inputs=4[top]`;
    const r2 = labels.slice(4, 8).map(l => `[${l}]`).join('') + `hstack=inputs=${Math.min(n-4,4)}[bot]`;
    stack = `${r1};${r2};[top][bot]vstack[out]`;
  }

  const filter = `${scales};${stack}`;
  const result = spawnSync('ffmpeg', [
    '-y', ...inputs,
    '-filter_complex', filter,
    '-map', '[out]',
    '-frames:v', '1', '-update', '1',
    outPath
  ], { encoding: 'utf8' });
  return result.status === 0;
}

function fallbackAlt(filename, slot) {
  const base = path.basename(filename, path.extname(filename))
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
  return `${base} at Everyday Produce Market`;
}

function resizeForVision(srcPath) {
  // Scale to max 512px on longest side, save as temp JPEG for Ollama.
  // Gemma4 patches: 16x16px each. 512px max = ~1024 patches, well within 4096 ctx.
  const tmp = srcPath.replace(/\.(jpg|jpeg)$/i, '_vision_thumb.jpg');
  const result = spawnSync('ffmpeg', [
    '-y', '-i', srcPath,
    '-vf', 'scale=512:-1',
    '-q:v', '5',
    '-update', '1',
    tmp
  ], { encoding: 'utf8' });
  if (result.status !== 0) return srcPath; // fallback: use original
  return tmp;
}

async function getAltText(imgPath, slot, dims) {
  if (skipAI) return fallbackAlt(imgPath, slot);

  // Resize to thumbnail before sending — full images exceed Ollama context (4096 tokens)
  const thumbPath = resizeForVision(imgPath);
  const imgBase64 = fs.readFileSync(thumbPath).toString('base64');
  // Clean up thumb after reading
  try { if (thumbPath !== imgPath) fs.unlinkSync(thumbPath); } catch (_) {}
  const prompt = `You are writing alt text for a produce market website photo.
The image slot is: ${slotDescription(slot)}
Business: Everyday Produce Market, Waldo, Kansas City. Open since 1985. Real produce, real colors, outdoor stand.

Write ONE concise alt text (max 12 words) that:
- Describes the actual produce or scene visible
- Ends with "at Everyday Produce Market"
- Is plain English, no marketing fluff
- Mentions specific produce if visible (tomatoes, peaches, watermelons, etc.)
- Does NOT start with "Image of" or "Photo of"

Respond with ONLY the alt text, nothing else.`;

  // Use /api/chat — images work there; /api/generate ignores images in Ollama 0.24.x
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt, images: [imgBase64] }],
      stream: false,
      options: { temperature: 0.3 }
    });

    const req = https.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = (parsed.message?.content || '').trim().replace(/^["']|["']$/g, '');
          resolve(text || fallbackAlt(imgPath, slot));
        } catch {
          resolve(fallbackAlt(imgPath, slot));
        }
      });
    });

    req.on('error', () => resolve(fallbackAlt(imgPath, slot)));
    req.setTimeout(60000, () => { req.destroy(); resolve(fallbackAlt(imgPath, slot)); });
    req.write(body);
    req.end();
  });
}

function buildHTML(basename, dims, slot, altText, hasWebp) {
  const rel = `${folderArg}/${basename}`;
  const webpRel = `${folderArg}/${basename.replace(/\.(jpg|jpeg)$/i, '.webp')}`;
  const { width, height } = dims;

  if (slot === 'gallery-item') {
    return hasWebp
      ? `<picture>\n  <source srcset="${webpRel}" type="image/webp">\n  <img class="gallery-item" src="${rel}" alt="${altText}" loading="lazy" width="${width}" height="${height}">\n</picture>`
      : `<img class="gallery-item" src="${rel}" alt="${altText}" loading="lazy" width="${width}" height="${height}">`;
  }

  if (slot === 'season-photo') {
    return hasWebp
      ? `<picture>\n  <source srcset="${webpRel}" type="image/webp">\n  <img class="season-photo" src="${rel}" alt="${altText}" loading="lazy" width="${width}" height="${height}">\n</picture>`
      : `<img class="season-photo" src="${rel}" alt="${altText}" loading="lazy" width="${width}" height="${height}">`;
  }

  if (slot === 'callout-photo') {
    return `<div class="callout-photo"><img src="${rel}" alt="${altText}" loading="eager" width="${width}" height="${height}"></div>`;
  }

  // weekend-photo-card
  return `<div class="weekend-photo-card">\n  <img src="${rel}" alt="${altText}" loading="lazy" width="${width}" height="${height}">\n</div>`;
}

// ─── Main loop ───────────────────────────────────────────────────────────────
async function run() {
  const manifest = { folder: folderName, generated: new Date().toISOString(), photos: [] };
  const snippetsBySlot = {};

  for (const file of jpegs) {
    const srcPath = path.join(folder, file);
    const webpFile = file.replace(/\.(jpg|jpeg)$/i, '.webp');
    const webpPath = path.join(folder, webpFile);
    const hasWebp = fs.existsSync(webpPath);

    process.stdout.write(`  ${file} `);

    // 1. Dimensions
    const dims = getDimensions(srcPath);
    const slot = inferSlot(dims.width, dims.height);
    process.stdout.write(`(${dims.width}x${dims.height}) → ${slot} `);

    // 2. webp conversion
    let webpConverted = hasWebp;
    if (!hasWebp) {
      if (!dryRun) {
        process.stdout.write('[converting to webp] ');
        toWebp(srcPath, webpPath);
        webpConverted = true;
      } else {
        process.stdout.write('[would convert to webp] ');
      }
    } else {
      process.stdout.write('[webp exists] ');
    }

    // 3. Alt text
    process.stdout.write('[alt text] ');
    let altText;
    if (!dryRun) {
      altText = await getAltText(srcPath, slot, dims);
    } else {
      altText = fallbackAlt(file, slot);
    }
    process.stdout.write('✓\n');

    // 4. Build HTML snippet
    const html = buildHTML(file, dims, slot, altText, webpConverted);

    if (!snippetsBySlot[slot]) snippetsBySlot[slot] = [];
    snippetsBySlot[slot].push({ file, html, altText });

    manifest.photos.push({ file, webp: webpFile, width: dims.width, height: dims.height, slot, altText });
  }

  // 5. Contact sheet
  if (!dryRun && jpegs.length > 1) {
    process.stdout.write('\n  Generating contact sheet... ');
    const sheetPath = path.join(folder, '_contact-sheet.jpg');
    const allPaths = jpegs.map(f => path.join(folder, f));
    const ok = makeContactSheet(allPaths, sheetPath);
    console.log(ok ? `✓ → _contact-sheet.jpg` : 'skipped (complex layout)');
  }

  // 6. Write manifest
  if (!dryRun) {
    fs.writeFileSync(path.join(folder, '_manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(`\n  Wrote _manifest.json`);
  }

  // 7. Write HTML snippets file
  const snippetLines = ['# HTML Snippets — ' + folderName, ''];
  snippetLines.push('Copy the relevant blocks into index.html.');
  snippetLines.push('Slot guide:');
  snippetLines.push('  .callout-photo      → "What\'s in" section, top 2 photos');
  snippetLines.push('  .weekend-photo-card → weekly update grid');
  snippetLines.push('  .season-photo       → "What\'s in Season" wide grid');
  snippetLines.push('  .gallery-item       → hero billboard row (16:9 wide shots)');
  snippetLines.push('');

  for (const [slot, items] of Object.entries(snippetsBySlot)) {
    snippetLines.push(`## ${slot} (${slotDescription(slot)})`);
    snippetLines.push('');
    for (const { file, html, altText } of items) {
      snippetLines.push(`<!-- ${file} -->`);
      snippetLines.push(html);
      snippetLines.push(`<!-- alt: "${altText}" -->`);
      snippetLines.push('');
    }
  }

  // Also show in console
  console.log('\n' + '─'.repeat(60));
  console.log(snippetLines.join('\n'));
  console.log('─'.repeat(60));

  if (!dryRun) {
    const snippetPath = path.join(folder, '_html-snippets.md');
    fs.writeFileSync(snippetPath, snippetLines.join('\n'));
    console.log(`\n  Wrote _html-snippets.md`);
  }

  // 8. Summary
  const counts = {};
  manifest.photos.forEach(p => { counts[p.slot] = (counts[p.slot] || 0) + 1; });
  console.log('\n✅ Done.');
  console.log(`   ${jpegs.length} photos processed`);
  Object.entries(counts).forEach(([slot, n]) => console.log(`   ${n}x ${slot}`));
  if (!skipAI) console.log(`   Alt text: Gemma ${model}`);
  if (applyGrade) console.log(`   EP warm grade applied`);
  if (dryRun) console.log('\n⚠️  DRY RUN — no files written.');
}

run().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
