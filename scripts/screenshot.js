#!/usr/bin/env node
/**
 * screenshot.js — Capture the site at 390 / 768 / 1440px using Puppeteer.
 *
 * Run from the site root: node scripts/screenshot.js
 * Options:
 *   --url <url>     base URL to screenshot (default: http://localhost:8080)
 *   --out <dir>     output dir (default: screenshots/<timestamp>/)
 *   --widths 390,768,1440   widths to capture (comma-separated)
 *   --page /contact.html    also screenshot this extra page
 *   --open          open the output folder after capturing
 *
 * Saves: screenshots/<timestamp>/desktop-1440.png, tablet-768.png, mobile-390.png
 * Also creates screenshots/latest/ symlink (or junction on Windows) for quick access.
 *
 * Requires: puppeteer (globally installed via md-to-pdf, or locally in node_modules)
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
function argVal(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : null;
}

const baseUrl = argVal('--url') || 'http://localhost:8080';
const widths = (argVal('--widths') || '390,768,1440').split(',').map(Number);
const extraPages = args.filter((a, i) => args[i - 1] === '--page');
const doOpen = args.includes('--open');

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = argVal('--out') || path.join(process.cwd(), 'screenshots', timestamp);
fs.mkdirSync(outDir, { recursive: true });

// Width to label map
const widthLabels = { 390: 'mobile', 768: 'tablet', 1440: 'desktop' };

// ---- Resolve puppeteer from global npm or local node_modules --------------

function resolvePuppeteer() {
  // Try local first
  const local = path.join(process.cwd(), 'node_modules', 'puppeteer');
  if (fs.existsSync(local)) return local;

  // Try global npm locations
  const globalDirs = [
    process.env.npm_config_prefix ? path.join(process.env.npm_config_prefix, 'node_modules', 'puppeteer') : null,
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'md-to-pdf', 'node_modules', 'puppeteer'),
    path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'puppeteer'),
    '/usr/local/lib/node_modules/puppeteer',
    '/usr/lib/node_modules/puppeteer',
  ].filter(Boolean);

  for (const dir of globalDirs) {
    if (fs.existsSync(dir)) return dir;
  }

  // Try require.resolve
  try { return require.resolve('puppeteer'); } catch {}

  return null;
}

// ---- Main -----------------------------------------------------------------

async function main() {
  const puppeteerPath = resolvePuppeteer();
  if (!puppeteerPath) {
    console.error('puppeteer not found. Install with: npm install -g puppeteer');
    console.error('Or run: npm install --save-dev puppeteer (in this site\'s scripts/ dir)');
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = require(puppeteerPath);
  } catch (err) {
    console.error('Failed to load puppeteer:', err.message);
    process.exit(1);
  }

  const pages = ['/', ...extraPages];
  const saved = [];

  console.log(`\nScreenshots: ${outDir}\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const pagePath of pages) {
    const url = `${baseUrl}${pagePath}`;
    const pageSlug = pagePath === '/' ? 'home' : pagePath.replace(/[^a-z0-9]/gi, '-').replace(/^-|-$/g, '');

    for (const width of widths) {
      const label = widthLabels[width] || `w${width}`;
      const filename = pages.length > 1
        ? `${pageSlug}-${label}-${width}.png`
        : `${label}-${width}.png`;
      const outPath = path.join(outDir, filename);

      const page = await browser.newPage();
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
        await page.screenshot({ path: outPath, fullPage: true });
        console.log(`  ${label} (${width}px) -> ${filename}`);
        saved.push(outPath);
      } catch (err) {
        console.warn(`  WARN: failed to screenshot ${url} at ${width}px: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  // Write manifest so commit.js can find and open screenshots
  const manifestPath = path.join(outDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ timestamp, baseUrl, files: saved }, null, 2));
  console.log(`\nManifest: ${manifestPath}`);

  // Update latest/ pointer (simple folder copy reference on Windows)
  const latestFile = path.join(process.cwd(), 'screenshots', 'latest.txt');
  fs.writeFileSync(latestFile, outDir);
  console.log(`Latest pointer updated: ${latestFile}`);

  // Open folder if requested
  if (doOpen) {
    const openCmd = process.platform === 'win32' ? `explorer "${outDir}"` : `open "${outDir}"`;
    try { execSync(openCmd, { stdio: 'ignore', shell: true }); } catch {}
  }

  console.log(`\nDone. ${saved.length} screenshot(s) saved.\n`);
  return saved;
}

main().catch(err => {
  console.error('Screenshot failed:', err.message);
  process.exit(1);
});
