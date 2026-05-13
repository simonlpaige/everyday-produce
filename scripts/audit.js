#!/usr/bin/env node
/**
 * audit.js — ADA + AI-friendly + SEO audit for a static site.
 *
 * Run from the site root: node scripts/audit.js
 * Options:
 *   --url <url>       pa11y target URL (default: http://localhost:8080)
 *   --no-a11y         skip pa11y accessibility scan (use when server is not running)
 *   --json            machine-readable output
 *   --fix-meta        scaffold missing robots.txt / sitemap.xml / llms.txt (non-destructive)
 *
 * Exit codes: 0 = pass, 1 = criticals found
 *
 * Checks:
 *   ADA/Accessibility  — pa11y (WCAG 2.1 AA) against the live local server
 *   SEO                — title, meta description, h1, canonical, lang attr
 *   AI-friendly        — llms.txt, JSON-LD schema, robots.txt, sitemap.xml, semantic HTML
 *   Required files     — 404.html, favicon.ico, robots.txt, sitemap.xml, llms.txt
 *   Footer credit      — checks for simonlpaige.com in each page footer
 *   Gemma flags        — checks for unreviewed data-ai-alt="true" attributes
 *
 * Requires: pa11y (global npm), Node.js built-ins only for file checks
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
function argVal(flag) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; }

const baseUrl = argVal('--url') || 'http://localhost:8080';
const skipA11y = args.includes('--no-a11y');
const jsonMode = args.includes('--json');
const fixMeta = args.includes('--fix-meta');
const siteDir = process.cwd();

// ---- Findings accumulator ------------------------------------------------

const findings = [];
function add(severity, code, message, file = null) {
  findings.push({ severity, code, message, file });
}

// ---- Required files check ------------------------------------------------

const REQUIRED_FILES = [
  { file: 'robots.txt',  code: 'missing-robots',  msg: 'robots.txt missing — AI crawlers cannot parse crawl rules' },
  { file: 'sitemap.xml', code: 'missing-sitemap',  msg: 'sitemap.xml missing — search engines and AI agents cannot discover pages' },
  { file: '404.html',    code: 'missing-404',      msg: '404.html missing — broken URLs give browsers a generic error page' },
  { file: 'favicon.ico', code: 'missing-favicon',  msg: 'favicon.ico missing — browsers show a broken icon in tabs' },
  { file: 'llms.txt',    code: 'missing-llms-txt', msg: 'llms.txt missing — AI agents cannot understand what this site is for' },
];

function checkRequiredFiles() {
  console.log('\n[Required files]');
  for (const { file, code, msg } of REQUIRED_FILES) {
    const exists = fs.existsSync(path.join(siteDir, file));
    if (exists) {
      console.log(`  PASS  ${file}`);
    } else {
      add('critical', code, msg, file);
      console.log(`  FAIL  ${file} — ${msg}`);
    }
  }
}

// ---- Find HTML files -------------------------------------------------------

function findHtmlFiles(dir) {
  const out = [];
  const skip = new Set([
    '.git', 'node_modules', 'screenshots', 'design-system', '_archive', 'scripts',
    // Design/staging dirs — not deployed pages
    'logo-concepts', 'v2', 'scratch', 'staging', 'drafts', 'tmp',
  ]);
  function walk(d) {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (skip.has(e.name) || e.name.startsWith('.')) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith('.html')) out.push(full);
    }
  }
  walk(dir);
  return out;
}

// ---- HTML file audits -------------------------------------------------------

function auditHtml() {
  const htmlFiles = findHtmlFiles(siteDir);
  if (!htmlFiles.length) {
    add('warning', 'no-html', 'No HTML files found in site directory');
    return;
  }

  console.log(`\n[HTML files: ${htmlFiles.length} found]`);

  for (const filePath of htmlFiles) {
    const rel = path.relative(siteDir, filePath).replace(/\\/g, '/');
    let html;
    try { html = fs.readFileSync(filePath, 'utf8'); } catch { continue; }

    const fileFindings = [];

    // Lang attribute
    if (!/<html[^>]*\blang=/i.test(html))
      fileFindings.push({ severity: 'critical', code: 'no-lang', msg: '<html> missing lang attribute' });

    // Title
    if (!/<title>/i.test(html))
      fileFindings.push({ severity: 'critical', code: 'no-title', msg: '<title> tag missing' });

    // Meta description
    if (!/<meta[^>]*name=["']description["']/i.test(html))
      fileFindings.push({ severity: 'warning', code: 'no-meta-desc', msg: 'meta description missing' });

    // H1 (home page especially important)
    if (!/<h1[\s>]/i.test(html))
      fileFindings.push({ severity: 'warning', code: 'no-h1', msg: 'no <h1> found' });

    // JSON-LD schema
    if (!/<script[^>]+type=["']application\/ld\+json["']/i.test(html))
      fileFindings.push({ severity: 'warning', code: 'no-schema', msg: 'no JSON-LD schema markup' });

    // Semantic landmarks
    if (!/<main[\s>]/i.test(html))
      fileFindings.push({ severity: 'warning', code: 'no-main', msg: 'no <main> landmark' });
    if (!/<nav[\s>]/i.test(html))
      fileFindings.push({ severity: 'info', code: 'no-nav', msg: 'no <nav> landmark (OK for simple pages)' });
    if (!/<footer[\s>]/i.test(html))
      fileFindings.push({ severity: 'warning', code: 'no-footer', msg: 'no <footer> element' });

    // Footer credit
    if (!html.includes('simonlpaige.com'))
      fileFindings.push({ severity: 'warning', code: 'no-footer-credit', msg: 'simonlpaige.com footer credit missing' });

    // Alt text on images
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const missingAlt = imgTags.filter(t => !/\balt=/i.test(t));
    if (missingAlt.length)
      fileFindings.push({ severity: 'critical', code: 'missing-alt', msg: `${missingAlt.length} image(s) missing alt attribute` });

    // Unreviewed Gemma alt text
    const gemmaAlt = (html.match(/data-ai-alt="true"/gi) || []).length;
    if (gemmaAlt)
      fileFindings.push({ severity: 'warning', code: 'unreviewed-ai-alt', msg: `${gemmaAlt} image(s) have unreviewed Gemma-generated alt text (data-ai-alt="true")` });

    // Print per-file results
    if (fileFindings.length === 0) {
      console.log(`  PASS  ${rel}`);
    } else {
      const hasCrit = fileFindings.some(f => f.severity === 'critical');
      console.log(`  ${hasCrit ? 'FAIL' : 'WARN'}  ${rel}`);
      for (const f of fileFindings) {
        console.log(`        [${f.severity.toUpperCase()}] ${f.msg}`);
        add(f.severity, f.code, f.msg, rel);
      }
    }
  }
}

// ---- robots.txt / llms.txt content checks -----------------------------------

function checkFileContent() {
  console.log('\n[File content checks]');

  const robotsPath = path.join(siteDir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    // Check that common AI crawlers are not blocked
    const blocksAll = /Disallow:\s*\//m.test(robots) && /User-agent:\s*\*/m.test(robots);
    if (blocksAll) {
      add('warning', 'robots-blocks-all', 'robots.txt blocks all crawlers — AI agents cannot read this site');
      console.log('  WARN  robots.txt — blocks all user-agents including AI crawlers');
    } else {
      console.log('  PASS  robots.txt — AI crawlers allowed');
    }
  }

  const llmsPath = path.join(siteDir, 'llms.txt');
  if (fs.existsSync(llmsPath)) {
    const llms = fs.readFileSync(llmsPath, 'utf8');
    if (llms.trim().length < 50) {
      add('warning', 'llms-txt-thin', 'llms.txt exists but is nearly empty — should describe the site and audience');
      console.log('  WARN  llms.txt — file is nearly empty');
    } else {
      console.log('  PASS  llms.txt — content present');
    }
  }
}

// ---- pa11y accessibility ---------------------------------------------------

async function runA11y() {
  console.log(`\n[Accessibility: pa11y WCAG 2.1 AA against ${baseUrl}]`);

  // Check pa11y is available
  let pa11yPath;
  try {
    pa11yPath = execSync('where pa11y', { stdio: 'pipe' }).toString().trim().split('\n')[0].trim();
  } catch {
    add('warning', 'pa11y-not-found', 'pa11y not found — install with: npm install -g pa11y. Accessibility check skipped.');
    console.log('  SKIP  pa11y not found (npm install -g pa11y to enable)');
    return;
  }

  // Find HTML files to test (just index.html and contact.html if they exist)
  const pagePaths = ['/', '/contact.html', '/about.html'].filter(p => {
    if (p === '/') return true;
    return fs.existsSync(path.join(siteDir, p.replace('/', '')));
  });

  for (const pagePath of pagePaths) {
    const url = `${baseUrl}${pagePath}`;
    try {
      const result = execSync(
        `"${pa11yPath}" "${url}" --standard WCAG2AA --reporter json --timeout 30000`,
        { stdio: 'pipe', encoding: 'utf8', timeout: 45000 }
      );
      const issues = JSON.parse(result || '[]');
      const errors = issues.filter(i => i.type === 'error');
      const warnings = issues.filter(i => i.type === 'warning');

      if (errors.length === 0 && warnings.length === 0) {
        console.log(`  PASS  ${pagePath} — 0 issues`);
      } else {
        if (errors.length) {
          console.log(`  FAIL  ${pagePath} — ${errors.length} error(s), ${warnings.length} warning(s)`);
          for (const e of errors.slice(0, 5)) {
            console.log(`        [ERROR] ${e.message} (${e.selector || e.code})`);
            add('critical', 'a11y-error', `${pagePath}: ${e.message}`, pagePath);
          }
          if (errors.length > 5) console.log(`        ... and ${errors.length - 5} more errors`);
        } else {
          console.log(`  WARN  ${pagePath} — 0 errors, ${warnings.length} warning(s)`);
        }
        for (const w of warnings.slice(0, 3)) {
          console.log(`        [WARN]  ${w.message} (${w.selector || w.code})`);
          add('warning', 'a11y-warning', `${pagePath}: ${w.message}`, pagePath);
        }
      }
    } catch (err) {
      // pa11y exits non-zero when it finds issues — parse stdout anyway
      const raw = err.stdout || '';
      if (raw.includes('"type"')) {
        try {
          const issues = JSON.parse(raw);
          const errors = issues.filter(i => i.type === 'error');
          const warnings = issues.filter(i => i.type === 'warning');
          if (errors.length) {
            console.log(`  FAIL  ${pagePath} — ${errors.length} accessibility error(s)`);
            for (const e of errors.slice(0, 5)) {
              console.log(`        [ERROR] ${e.message}`);
              add('critical', 'a11y-error', `${pagePath}: ${e.message}`, pagePath);
            }
          } else {
            console.log(`  WARN  ${pagePath} — ${warnings.length} accessibility warning(s)`);
          }
          continue;
        } catch {}
      }
      // Actual failure (server not running, timeout, etc.)
      console.log(`  SKIP  ${pagePath} — pa11y failed (is the server running? try: node scripts/preview.js)`);
      add('warning', 'a11y-skip', `${pagePath}: pa11y could not connect — run preview.js first`, pagePath);
    }
  }
}

// ---- Fix meta scaffold -----------------------------------------------------

function scaffoldMissing() {
  const skillsDir = path.join(
    process.env.LARRY_WORKSPACE || 'C:\\Users\\simon\\.openclaw\\workspace',
    'skills', 'website-workflow', 'templates'
  );

  const missing = REQUIRED_FILES.filter(({ file }) => !fs.existsSync(path.join(siteDir, file)));
  if (!missing.length) { console.log('\nAll required files present. Nothing to scaffold.'); return; }

  console.log(`\n[Scaffolding ${missing.length} missing file(s)]`);
  for (const { file } of missing) {
    const tplName = file.endsWith('.html') || file.endsWith('.txt') || file.endsWith('.xml')
      ? `${file}.template`
      : file;
    const tplPath = path.join(skillsDir, tplName);
    const fallback = path.join(skillsDir, file);
    const src = fs.existsSync(tplPath) ? tplPath : (fs.existsSync(fallback) ? fallback : null);

    if (src) {
      let content = fs.readFileSync(src, 'utf8');
      // Replace {{DOMAIN}} placeholder with CNAME if present
      const cname = fs.existsSync(path.join(siteDir, 'CNAME'))
        ? fs.readFileSync(path.join(siteDir, 'CNAME'), 'utf8').trim()
        : 'yourdomain.com';
      content = content.replace(/\{\{DOMAIN\}\}/g, cname);
      fs.writeFileSync(path.join(siteDir, file), content);
      console.log(`  Created ${file} from template`);
    } else {
      console.log(`  SKIP  ${file} — no template found at ${tplPath}`);
    }
  }
}

// ---- Summary & exit --------------------------------------------------------

function printSummary() {
  const criticals = findings.filter(f => f.severity === 'critical');
  const warnings  = findings.filter(f => f.severity === 'warning');
  const infos     = findings.filter(f => f.severity === 'info');

  console.log('\n' + '='.repeat(60));
  console.log('AUDIT SUMMARY');
  console.log('='.repeat(60));
  console.log(`  Critical : ${criticals.length}`);
  console.log(`  Warning  : ${warnings.length}`);
  console.log(`  Info     : ${infos.length}`);

  if (criticals.length) {
    console.log('\nCriticals (must fix before shipping):');
    for (const c of criticals) {
      console.log(`  [${c.file || 'site'}] ${c.message}`);
    }
    console.log('\nFix criticals or use: node scripts/commit.js "msg" --skip-audit <reason>');
  } else {
    console.log('\nNo criticals. Good to commit.');
  }
  console.log('');

  if (jsonMode) {
    const jsonOut = { criticals: criticals.length, warnings: warnings.length, infos: infos.length, findings };
    fs.writeFileSync(path.join(siteDir, 'audit-result.json'), JSON.stringify(jsonOut, null, 2));
    console.log('audit-result.json written.');
  }

  return criticals.length;
}

// ---- Entry -----------------------------------------------------------------

async function main() {
  console.log(`\nAudit: ${siteDir}`);
  console.log(`Target: ${skipA11y ? 'file checks only (--no-a11y)' : baseUrl}`);

  checkRequiredFiles();
  auditHtml();
  checkFileContent();
  if (!skipA11y) await runA11y();
  if (fixMeta) scaffoldMissing();

  const criticalCount = printSummary();
  process.exit(criticalCount > 0 ? 1 : 0);
}

main().catch(err => { console.error('Audit error:', err.message); process.exit(1); });
