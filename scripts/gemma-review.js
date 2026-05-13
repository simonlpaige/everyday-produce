#!/usr/bin/env node
/**
 * gemma-review.js — Local Gemma scan for alt text, SEO, and design consistency.
 *
 * Run from the site root: node scripts/gemma-review.js
 * Options:
 *   --task alt-text|seo|design|all   which checks to run (default: all)
 *   --apply-alt                      write Gemma alt text suggestions into HTML files
 *                                    (marks with data-ai-alt="true" — audit will flag for review)
 *   --model e4b|26b                  override model (default: auto-select by task)
 *   --file index.html                only scan this specific file
 *
 * Output: gemma-review-<timestamp>.md in the site root
 *
 * ALL Gemma output is flagged as "needs human review" — nothing is applied silently.
 * Alt text written with --apply-alt gets data-ai-alt="true" so audit.js catches it.
 *
 * Requires: Ollama running locally with gemma4:e4b and/or gemma4:26b
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const args = process.argv.slice(2);
function argVal(flag) { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; }

const task = argVal('--task') || 'all';
const applyAlt = args.includes('--apply-alt');
const modelOverride = argVal('--model');
const fileFilter = argVal('--file');
const siteDir = process.cwd();
const ollamaBase = process.env.OLLAMA_HOST || 'http://localhost:11434';

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const reportPath = path.join(siteDir, `gemma-review-${timestamp}.md`);
const reportLines = [`# Gemma Review — ${new Date().toLocaleString()}\n`, `Site: \`${siteDir}\`\n`];
const report = (line) => { reportLines.push(line); console.log(line); };

// ---- Ollama API call -------------------------------------------------------

function ollamaGenerate(model, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ model, prompt, stream: false, options: { num_ctx: 4096 } });
    const req = http.request(`${ollamaBase}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data).response || ''); }
        catch { reject(new Error('Invalid JSON from Ollama')); }
      });
    });
    req.on('error', reject);
    req.setTimeout(60000, () => { req.destroy(new Error('Ollama request timed out')); });
    req.write(body);
    req.end();
  });
}

function selectModel(taskName) {
  if (modelOverride) return modelOverride === 'e4b' ? 'gemma4:e4b' : 'gemma4:26b';
  // e4b for quick extraction tasks, 26b for judgment/consistency tasks
  return ['alt-text', 'seo'].includes(taskName) ? 'gemma4:e4b' : 'gemma4:26b';
}

// ---- Find HTML files -------------------------------------------------------

function findHtmlFiles() {
  if (fileFilter) {
    const p = path.isAbsolute(fileFilter) ? fileFilter : path.join(siteDir, fileFilter);
    return fs.existsSync(p) ? [p] : [];
  }
  const out = [];
  const skip = new Set(['.git', 'node_modules', 'screenshots', 'design-system', '_archive', 'scripts']);
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
  walk(siteDir);
  return out;
}

// ---- Task: Alt text --------------------------------------------------------

async function reviewAltText(htmlFiles) {
  report('\n## Alt Text Review\n');
  report('> Model: gemma4:e4b | These are suggestions — review before accepting.\n');
  const model = selectModel('alt-text');
  let totalSuggestions = 0;

  for (const filePath of htmlFiles) {
    const rel = path.relative(siteDir, filePath).replace(/\\/g, '/');
    let html = fs.readFileSync(filePath, 'utf8');

    // Find images missing alt or with empty alt
    const missing = [];
    const imgRegex = /<img([^>]*)>/gi;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
      const attrs = match[1];
      const altMatch = attrs.match(/\balt=["']([^"']*)["']/i);
      const src = (attrs.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || 'unknown';
      if (!altMatch || altMatch[1].trim() === '') {
        missing.push({ original: match[0], src, index: match.index });
      }
    }

    if (!missing.length) {
      report(`**${rel}**: no missing alt text`);
      continue;
    }

    report(`\n### ${rel} — ${missing.length} image(s) need alt text\n`);
    totalSuggestions += missing.length;

    // Batch-prompt Gemma for suggestions
    const srcList = missing.map((m, i) => `${i + 1}. ${m.src}`).join('\n');
    const prompt = `You are writing alt text for a business website. Be descriptive but brief (under 15 words each).
For each image filename below, write concise alt text. Output ONLY a numbered list matching the input numbers.
No explanations, no extra text.

Images:
${srcList}`;

    let suggestions = [];
    try {
      const raw = await ollamaGenerate(model, prompt);
      suggestions = raw.split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim())
        .filter(l => l.length > 0);
    } catch (err) {
      report(`> WARNING: Gemma call failed for ${rel}: ${err.message}`);
      continue;
    }

    for (let i = 0; i < missing.length; i++) {
      const suggestion = suggestions[i] || '';
      report(`- \`${missing[i].src}\`\n  - Suggested: "${suggestion}"`);

      if (applyAlt && suggestion) {
        // Write the suggestion into the HTML with a review flag
        const newTag = missing[i].original.replace(
          /<img/i,
          `<img alt="${suggestion.replace(/"/g, '&quot;')}" data-ai-alt="true"`
        );
        // Use simple string replacement (safe for static HTML)
        html = html.slice(0, missing[i].index) + newTag + html.slice(missing[i].index + missing[i].original.length);
      }
    }

    if (applyAlt) {
      fs.writeFileSync(filePath, html);
      report(`\n> Applied ${missing.length} suggestion(s) to ${rel}. Each has \`data-ai-alt="true"\` — audit.js will flag these for your review before commit.`);
    }
  }

  report(`\n**Total missing alt text:** ${totalSuggestions}`);
  if (!applyAlt && totalSuggestions > 0) {
    report('\n> Suggestions not applied. Run with `--apply-alt` to write them in (they will be flagged for review).');
  }
}

// ---- Task: SEO review -------------------------------------------------------

async function reviewSeo(htmlFiles) {
  report('\n## SEO Review\n');
  report('> Model: gemma4:e4b | Suggestions only — review before accepting.\n');
  const model = selectModel('seo');

  for (const filePath of htmlFiles) {
    const rel = path.relative(siteDir, filePath).replace(/\\/g, '/');
    const html = fs.readFileSync(filePath, 'utf8');

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch  = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const h1Match    = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

    const current = {
      title: titleMatch ? titleMatch[1].trim() : '(missing)',
      description: descMatch ? descMatch[1].trim() : '(missing)',
      h1: h1Match ? h1Match[1].trim() : '(missing)',
    };

    const prompt = `You are reviewing on-page SEO for a local business website page.
Current values:
- Title: ${current.title}
- Meta description: ${current.description}
- H1: ${current.h1}

If any are missing or could be improved, suggest better versions. Keep titles under 60 chars, descriptions under 160 chars.
If they look fine, just say "Looks good."
Be brief. No lengthy explanations.`;

    try {
      const response = await ollamaGenerate(model, prompt);
      report(`### ${rel}\n- Title: \`${current.title}\`\n- Description: \`${current.description}\`\n- H1: \`${current.h1}\`\n\nGemma says:\n> ${response.replace(/\n/g, '\n> ')}\n`);
    } catch (err) {
      report(`> WARNING: Gemma call failed for ${rel}: ${err.message}`);
    }
  }
}

// ---- Task: Design consistency -----------------------------------------------

async function reviewDesign() {
  report('\n## Design Consistency Review\n');
  report('> Model: gemma4:26b | Judgment task — suggestions only, never auto-applied.\n');
  const model = selectModel('design');

  const designMdPath = path.join(siteDir, 'DESIGN.md');
  const styleCssPath = path.join(siteDir, 'style.css');
  const tokensCssPath = path.join(siteDir, 'design-system', 'tokens.css');

  if (!fs.existsSync(designMdPath)) {
    report('> SKIP: DESIGN.md not found. Create one with `node scripts/init.js` or manually.');
    return;
  }

  const designMd = fs.readFileSync(designMdPath, 'utf8');
  const css = fs.existsSync(styleCssPath) ? fs.readFileSync(styleCssPath, 'utf8') : '';
  const tokens = fs.existsSync(tokensCssPath) ? fs.readFileSync(tokensCssPath, 'utf8') : '';

  const prompt = `You are reviewing CSS consistency for a static HTML website.
DESIGN.md defines the brand rules. Compare the CSS to the rules and flag any mismatches.
Be specific. List only real issues, not nitpicks. Keep the list under 10 items.
If everything looks consistent, say so.

DESIGN.md (excerpt — first 800 chars):
${designMd.slice(0, 800)}

tokens.css (excerpt — first 600 chars):
${tokens.slice(0, 600)}

style.css (excerpt — first 800 chars):
${css.slice(0, 800)}`;

  try {
    const response = await ollamaGenerate(model, prompt);
    report(`### Design consistency\n\nGemma says:\n> ${response.replace(/\n/g, '\n> ')}\n`);
  } catch (err) {
    report(`> WARNING: Gemma design review failed: ${err.message}`);
  }
}

// ---- Main ------------------------------------------------------------------

async function main() {
  console.log(`\nGemma review: ${siteDir}`);
  const htmlFiles = findHtmlFiles();
  if (!htmlFiles.length) { console.log('No HTML files found.'); process.exit(0); }

  const runAlt    = ['all', 'alt-text'].includes(task);
  const runSeo    = ['all', 'seo'].includes(task);
  const runDesign = ['all', 'design'].includes(task);

  if (runAlt)    await reviewAltText(htmlFiles);
  if (runSeo)    await reviewSeo(htmlFiles);
  if (runDesign) await reviewDesign();

  report(`\n---\n*Generated ${new Date().toLocaleString()} by gemma-review.js. All suggestions need human review.*`);
  fs.writeFileSync(reportPath, reportLines.join('\n'));
  console.log(`\nReport saved: ${reportPath}`);
}

main().catch(err => { console.error('Gemma review error:', err.message); process.exit(1); });
