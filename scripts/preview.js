#!/usr/bin/env node
/**
 * preview.js — Start a local HTTP server for the current site and open the browser.
 *
 * Run from the site root: node scripts/preview.js
 * Options:
 *   --port 8080     (default 8080)
 *   --no-browser    don't open the browser automatically
 *   --no-screenshot don't take screenshots after opening
 *
 * Requires: Python 3 or npx http-server (tries Python first, then http-server)
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
const port = parseInt(args[args.indexOf('--port') + 1] || '8080', 10);
const openBrowser = !args.includes('--no-browser');
const takeScreenshot = !args.includes('--no-screenshot');
const siteDir = process.cwd();

// ---- Find a server to use ------------------------------------------------

function hasPython() {
  try { execSync('python --version', { stdio: 'ignore' }); return true; } catch {}
  try { execSync('python3 --version', { stdio: 'ignore' }); return true; } catch {}
  return false;
}

function startServer() {
  if (hasPython()) {
    console.log(`Starting Python HTTP server on port ${port}...`);
    const py = process.platform === 'win32' ? 'python' : 'python3';
    return spawn(py, ['-m', 'http.server', String(port)], {
      cwd: siteDir,
      stdio: 'inherit',
      shell: true,
    });
  }
  // Fallback: npx http-server
  console.log(`Python not found — falling back to npx http-server on port ${port}...`);
  return spawn('npx', ['http-server', '-p', String(port), '-c-1', '--no-dotfiles'], {
    cwd: siteDir,
    stdio: 'inherit',
    shell: true,
  });
}

// ---- Wait for server to be ready ------------------------------------------

function waitForServer(attempts = 20) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    function check() {
      const req = http.get(`http://localhost:${port}/`, res => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (++tries >= attempts) return reject(new Error('Server did not start in time'));
        setTimeout(check, 300);
      });
      req.setTimeout(500, () => { req.destroy(); });
    }
    check();
  });
}

// ---- Open browser ---------------------------------------------------------

function openUrl(url) {
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : `open "${url}"`;
  try { execSync(cmd, { stdio: 'ignore', shell: true }); } catch { /* best-effort */ }
}

// ---- Main -----------------------------------------------------------------

async function main() {
  console.log(`\nSite preview: ${siteDir}`);
  console.log(`URL: http://localhost:${port}/\n`);

  const server = startServer();
  server.on('error', err => { console.error('Server error:', err.message); process.exit(1); });

  try {
    await waitForServer();
    console.log('Server ready.\n');
  } catch (err) {
    console.error(err.message);
    server.kill();
    process.exit(1);
  }

  if (openBrowser) {
    console.log('Opening browser...');
    openUrl(`http://localhost:${port}/`);
  }

  if (takeScreenshot) {
    // Give the browser a moment to render before screenshotting
    console.log('Taking screenshots in 3s...');
    await new Promise(r => setTimeout(r, 3000));
    try {
      execSync(`node "${path.join(__dirname, 'screenshot.js')}"`, {
        cwd: siteDir,
        stdio: 'inherit',
      });
    } catch {
      console.warn('Screenshot step failed (non-fatal). Run `node scripts/screenshot.js` manually.');
    }
  }

  console.log('\nServer running. Press Ctrl+C to stop.');

  // Keep running until killed
  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.kill();
    process.exit(0);
  });
}

main().catch(err => { console.error(err.message); process.exit(1); });
