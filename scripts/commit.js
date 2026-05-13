#!/usr/bin/env node
/**
 * commit.js — THE GATE. Audit → Screenshot → Open → Visual confirm → git commit.
 *
 * Usage: node scripts/commit.js "Your commit message"
 * Options:
 *   --skip-audit <reason>    bypass audit (reason logged to CHANGELOG.md)
 *   --no-screenshot          skip screenshots (also skips visual verify prompt)
 *   --no-open                take screenshots but don't open the folder
 *   --dry-run                run all checks but don't commit or push
 *   --push                   git push after commit (default: yes, use --no-push to skip)
 *   --no-push                commit but don't push
 *
 * What this does:
 *   1. Runs audit.js (WCAG 2.1 AA + SEO + AI-friendly + required files)
 *      - If criticals found and no --skip-audit: STOP.
 *      - If --skip-audit <reason>: log reason to CHANGELOG.md and continue.
 *   2. Runs screenshot.js at 390 / 768 / 1440px
 *   3. Opens the screenshots folder so you actually look at them
 *   4. Prompts: "Visually verified? (y/N)"
 *      - Only on 'y' continues.
 *   5. git add -u (tracked files only — never git add -A)
 *   6. git commit -m "<message>"
 *   7. git push (unless --no-push)
 *   8. Logs everything to CHANGELOG.md
 *
 * This script is the only way commits should happen on client sites.
 */

const { execSync, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const args = process.argv.slice(2);

// Pull commit message (first non-flag arg)
const messageArg = args.find(a => !a.startsWith('--'));
const message = messageArg || '';

const skipAuditIdx = args.indexOf('--skip-audit');
const skipAudit = skipAuditIdx >= 0;
const skipAuditReason = skipAudit ? (args[skipAuditIdx + 1] || 'no reason given') : null;

const noScreenshot = args.includes('--no-screenshot');
const noOpen = args.includes('--no-open');
const dryRun = args.includes('--dry-run');
const noPush = args.includes('--no-push');

const siteDir = process.cwd();
const scriptsDir = __dirname;

// ---- Helpers ---------------------------------------------------------------

function run(cmd, opts = {}) {
  return execSync(cmd, { cwd: siteDir, stdio: opts.silent ? 'pipe' : 'inherit', shell: true, encoding: 'utf8', ...opts });
}

function ask(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

function getGitUser() {
  try { return run('git config user.name', { silent: true }).trim(); } catch { return 'unknown'; }
}

function getGitBranch() {
  try { return run('git rev-parse --abbrev-ref HEAD', { silent: true }).trim(); } catch { return 'unknown'; }
}

function getStagedCount() {
  try {
    const out = run('git diff --cached --name-only', { silent: true });
    return out.trim().split('\n').filter(Boolean).length;
  } catch { return 0; }
}

function getChangedCount() {
  try {
    const out = run('git status --short', { silent: true });
    return out.trim().split('\n').filter(Boolean).length;
  } catch { return 0; }
}

// ---- Changelog append -------------------------------------------------------

function appendChangelog(entry) {
  const changelogPath = path.join(siteDir, 'CHANGELOG.md');
  const header = `## ${new Date().toISOString().slice(0, 10)} — ${message || '(no message)'}\n`;
  const block = `${header}${entry}\n\n`;
  try {
    const existing = fs.existsSync(changelogPath) ? fs.readFileSync(changelogPath, 'utf8') : '';
    fs.writeFileSync(changelogPath, block + existing);
  } catch {}
}

// ---- Screenshot opener (Windows) -------------------------------------------

function openScreenshotsFolder(screenshotDir) {
  if (!screenshotDir) return;
  const cmd = process.platform === 'win32'
    ? `explorer "${screenshotDir}"`
    : `open "${screenshotDir}"`;
  try { execSync(cmd, { stdio: 'ignore', shell: true }); } catch {}
}

function getLatestScreenshotDir() {
  const latestFile = path.join(siteDir, 'screenshots', 'latest.txt');
  if (fs.existsSync(latestFile)) {
    const dir = fs.readFileSync(latestFile, 'utf8').trim();
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

// ---- Main flow -------------------------------------------------------------

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('COMMIT GATE');
  console.log('='.repeat(60));

  if (!message) {
    console.error('\nUsage: node scripts/commit.js "Your commit message"');
    process.exit(1);
  }

  if (dryRun) console.log('\n[DRY RUN — no changes will be made]\n');

  const changedCount = getChangedCount();
  if (changedCount === 0) {
    console.log('\nNo changes to commit.');
    process.exit(0);
  }

  console.log(`\nSite:    ${siteDir}`);
  console.log(`Branch:  ${getGitBranch()}`);
  console.log(`Changes: ${changedCount} file(s)`);
  console.log(`Message: "${message}"\n`);

  // ---- Step 1: Audit -------------------------------------------------------
  let auditPassed = false;
  let auditSkipped = false;

  if (skipAudit) {
    console.log(`[1/4] Audit SKIPPED — reason: "${skipAuditReason}"`);
    auditSkipped = true;
    auditPassed = true;
  } else {
    console.log('[1/4] Running audit...\n');
    const auditScript = path.join(scriptsDir, 'audit.js');
    const result = spawnSync('node', [auditScript, '--no-a11y'], {
      cwd: siteDir,
      stdio: 'inherit',
    });

    if (result.status === 0) {
      console.log('\n[1/4] Audit PASSED');
      auditPassed = true;
    } else {
      console.log('\n[1/4] Audit FAILED — criticals found.\n');
      console.log('Fix the criticals above, then try again.');
      console.log('To override (use sparingly): node scripts/commit.js "msg" --skip-audit "reason why"\n');
      process.exit(1);
    }
  }

  // ---- Step 2: Screenshots -------------------------------------------------
  let screenshotDir = null;

  if (noScreenshot) {
    console.log('[2/4] Screenshots SKIPPED (--no-screenshot)');
  } else {
    console.log('\n[2/4] Taking screenshots...\n');
    const screenshotScript = path.join(scriptsDir, 'screenshot.js');
    const result = spawnSync('node', [screenshotScript], {
      cwd: siteDir,
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      console.warn('\nScreenshots failed. Is the local server running?');
      console.warn('Try: node scripts/preview.js in another terminal, then re-run commit.js');
      const proceed = await ask('\nContinue without screenshots? (y/N) ');
      if (proceed.toLowerCase() !== 'y') { console.log('Aborted.'); process.exit(0); }
    } else {
      screenshotDir = getLatestScreenshotDir();
      console.log(`\n[2/4] Screenshots saved: ${screenshotDir || 'unknown dir'}`);
    }
  }

  // ---- Step 3: Open screenshots -------------------------------------------
  if (!noScreenshot && screenshotDir && !noOpen) {
    console.log('\n[3/4] Opening screenshots folder — look at all three viewports...\n');
    openScreenshotsFolder(screenshotDir);
    // Small pause to let Explorer open
    await new Promise(r => setTimeout(r, 1500));
  } else {
    console.log('[3/4] Screenshots open step skipped');
  }

  // ---- Step 4: Visual verification ----------------------------------------
  let verified = false;

  if (noScreenshot) {
    console.log('[4/4] Visual verification skipped (no screenshots taken)');
    verified = true;
  } else {
    console.log('[4/4] Visual verification required.\n');
    console.log('  Check each screenshot:');
    console.log('  - Mobile (390px): does the layout stack cleanly?');
    console.log('  - Tablet (768px): does it look right at mid-width?');
    console.log('  - Desktop (1440px): does the full layout look as intended?');
    console.log('  - Is the footer credit present on every page?');
    console.log('  - Does anything look obviously broken?\n');

    const answer = await ask('Visually verified? (y/N) ');
    verified = answer.toLowerCase() === 'y';

    if (!verified) {
      console.log('\nCommit aborted — visual verification failed.');
      console.log('Fix what looks wrong and try again.\n');
      process.exit(0);
    }
  }

  // ---- Step 5: git add -u --------------------------------------------------
  if (!dryRun) {
    console.log('\nStaging tracked files (git add -u)...');
    try { run('git add -u'); }
    catch (err) { console.error('git add -u failed:', err.message); process.exit(1); }

    const staged = getStagedCount();
    if (staged === 0) {
      console.log('Nothing staged after git add -u. Are the changed files tracked?');
      console.log('(If you added new files, git add them manually first.)');
      process.exit(0);
    }
    console.log(`${staged} file(s) staged.`);
  }

  // ---- Step 6: git commit --------------------------------------------------
  if (!dryRun) {
    console.log(`\nCommitting: "${message}"`);
    try { run(`git commit -m "${message.replace(/"/g, '\\"')}"`); }
    catch (err) { console.error('git commit failed:', err.message); process.exit(1); }
  } else {
    console.log(`\n[DRY RUN] Would commit: "${message}"`);
  }

  // ---- Step 7: git push ----------------------------------------------------
  if (!noPush && !dryRun) {
    console.log('\nPushing to origin...');
    try { run('git push'); }
    catch (err) {
      console.error('git push failed:', err.message);
      console.warn('Commit is local. Run `git push` manually when ready.');
    }
  } else if (dryRun) {
    console.log('[DRY RUN] Would push to origin');
  } else {
    console.log('Skipping push (--no-push)');
  }

  // ---- Step 8: Changelog ---------------------------------------------------
  const changelogEntry = [
    `- **Author**: ${getGitUser()}`,
    `- **Branch**: ${getGitBranch()}`,
    auditSkipped ? `- **Audit**: SKIPPED — ${skipAuditReason}` : '- **Audit**: PASSED',
    noScreenshot ? '- **Screenshots**: skipped' : `- **Screenshots**: ${screenshotDir || 'taken'}`,
    `- **Visual verify**: ${verified ? 'yes' : 'skipped'}`,
    dryRun ? '- **DRY RUN**: no actual changes made' : '',
  ].filter(Boolean).join('\n');

  if (!dryRun) appendChangelog(changelogEntry);

  // ---- Done ----------------------------------------------------------------
  console.log('\n' + '='.repeat(60));
  if (dryRun) {
    console.log('DRY RUN COMPLETE — nothing was changed.');
  } else {
    console.log('COMMITTED AND PUSHED. Done.');
    console.log(`\nCHANGELOG.md updated.`);
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(err => { console.error('Commit gate error:', err.message); process.exit(1); });
