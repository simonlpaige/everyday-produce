# Everyday Produce Market — design.markdown

> Source of truth for everyday-produce.com. Rebuilt 2026-04-24 after Konrad
> approved a completely new direction (bold vintage farmstand, not the
> Apr 22 Playfair stamp/basket/wordmark concepts). Existing logo system
> lives in `site\logo-concepts` alongside this file.
>
> When Claude Design generates anything, use THIS file for tokens. When
> Claude Code implements, regenerate CSS from it. Update here, not in HTML.
>
> Spec: Google's `design.markdown` (open-source, April 2026).

## 0. Important naming note

- **Brand name (approved):** Everyday Produce Market
- **Domain:** everyday-produce.com (unchanged — no domain rename)
- **Tagline:** Waldo Tradition Since 1985 (confirmed real 2026-04-24)

## 1. Brand identity

- **Name:** Everyday Produce Market
- **Parent:** Client of Simon L. Paige Web Design (Groundlayer DBA)
- **Kind:** consumer, hyper-local, single-location produce stand
- **Owner:** Konrad Pfeifauf (Everyday Produce only - does NOT own Brookside Party Warehouse)
- **One-line:** A neighborhood produce stand in Waldo, Kansas City — a
  Waldo tradition since 1985, run by people who care whether the peaches
  are ready.
- **Voice:** Warm neighbor, vintage farmstand. Feynman curious-explainer
  applied to produce. "Peaches came in Tuesday, there's maybe three days
  of them left" over "experience our farm-fresh summer bounty."
- **Visual DNA:** Bold, hand-painted vintage roadside-stand sign energy.
  Think county-fair market signage, not boutique organic grocery. Every
  shape has a heavy black outline. Colors are confident and flat.
- **Not:** A corporate grocery chain. Not Whole-Foods-aesthetic.
  Not farm-to-table Instagram. Not Playfair-serif-elegance (that was the
  earlier direction; Konrad went the opposite way).
- **Spirit reference:** Charlie Stark 1980s hand-painted produce sign
  (`assets/charlie-stark-1980s-sign-reference.jpg`) + Konrad's own
  vintage-stand reference image. Both say the same thing: hand-made,
  warm, unmissable at 50 feet.

## 2. Color palette

Pulled directly from `"site\logo-concepts\logo.jsx"` (`EP_COLORS`).
These are the production values — do not drift.

| Token            | Hex      | Role                                       |
|------------------|----------|--------------------------------------------|
| red              | `#B8232A` | Wordmark, tomatoes, primary accent        |
| red-dark         | `#8F1A20` | Red hover/darker tomato shading           |
| green            | `#2F7A3A` | Tent stripes, tagline, leaves, buttons    |
| green-dark       | `#1F5228` | Watermelon rind, darker leaf tones        |
| yellow           | `#F2C438` | Cantaloupe pile, basket weave, sun accents|
| yellow-dark      | `#D4A419` | Shadow for yellow elements                |
| brown            | `#7A4A28` | Table, basket body                        |
| brown-dark       | `#5A3518` | Table legs, basket rim                    |
| cream            | `#F5EDD8` | Tent stripe base, page background warmth  |
| ink              | `#2A1A0E` | All outlines (black outline on red text   |
|                  |           | is the Konrad-requested signature detail)|
| watermelon-dark  | `#1F5228` | Watermelon body                           |
| watermelon-light | `#3D8A4A` | Watermelon stripes                        |

Accessibility pairs (verify with tooling before shipping):
- `red` on `cream` — AA for large/display only (use for big wordmarks, not body)
- `green` on `cream` — AA for most sizes
- `ink` on `cream` — AAA everywhere
- Reversed: `cream` on `ink` — AAA (safe for dark sections / footer)

**Outline rule** (Konrad-specified): all logo elements and illustrated
produce carry a black (`ink` #2A1A0E) outline. Outline width scales with
element size; target 2px at 200px viewbox. This is brand-critical and
non-negotiable — the outline is the vintage-sign signature.

**Tent-stripe rule** (Simon 2026-04-24, HARD): the tent tarp has
**exactly 3 green stripes and 3 cream stripes**, alternating, starting
with green at the peak. No more, no less. Same rule applies to every
rendering of the tent — master logo SVG, `logo.jsx` EPTent component,
simplified favicon variant, print sheet, any future lockup. If you
add a new tent rendering, it must have 3+3. Verify with a quick count
before committing.

## 3. Typography

Two typefaces. Both free via Google Fonts. The SVG logo's wordmark is
already outlined as paths (not a live font), so the typography below is
for the WEBSITE, not the logo.

- **Display / signage (headings, hero):** Alfa Slab One, regular only.
  Chunky vintage slab. Pairs visually with the logo wordmark.
- **UI / signage secondary (tagline, eyebrows, buttons):** Oswald,
  weights 500 + 700. Condensed, confident, reads like county-fair signage.
- **Body / long-form:** Inter, weights 400/500/600. Neutral workhorse for
  paragraphs, hours, review cards.

Note on the Apr 22 concepts: Playfair Display + DM Sans are **retired**.
Do not use them on this brand anywhere going forward.

Type scale:

| Role        | Size (desktop)          | Font          | Weight | Notes |
|-------------|-------------------------|---------------|--------|-------|
| hero-slab   | clamp(48px, 8vw, 96px)  | Alfa Slab One | 400    | Letter-spacing 0, uppercase recommended, `ink` outline optional (1px text-shadow trick) |
| h1          | clamp(32px, 5vw, 56px)  | Alfa Slab One | 400    | |
| h2          | 32px                    | Oswald        | 700    | Uppercase, 0.04em tracking |
| h3          | 22px                    | Oswald        | 700    | Uppercase, 0.06em tracking |
| tagline     | 18–22px                 | Oswald        | 500    | Uppercase, 0.18em tracking, green |
| eyebrow     | 11–12px                 | Oswald        | 500    | Uppercase, 0.22em tracking |
| body        | 17px                    | Inter         | 400    | 1.6 line-height |
| small       | 14px                    | Inter         | 500    | Metadata, captions |

## 4. Spacing + radius

- Base unit: 4px. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Section rhythm: 80–120px desktop, 48–64px mobile.
- Radius: minimal. Max 6px on cards. The brand is sign-painted, not
  soft-cornered. Pills are OK for eyebrows (999px) as an exception.
- Shadow: optional hard drop-shadow on signage-style elements
  (`2px 2px 0 rgba(42,26,14,0.2)`). No soft blurred shadows — they fight
  the hand-painted feel.

## 5. Components (canonical list)

- **Hero lockup:** Use `EPLogoHorizontal` (from `logo.jsx`) at width ~800px,
  or the standalone `everyday-produce-logo.svg`. On mobile, switch to
  `EPLogoStacked` at width 320–400px.
- **Tent mark (icon/favicon):** Use `EPTent` component alone. Favicon
  simplifies to roof + 3 produce dots + table at ≤32px (see
  `deliverables.jsx` → `EPFaviconMark simplified`).
- **Button — primary:** `red` bg, `cream` text, 4px radius, 14px/28px
  padding, Oswald 700 uppercase. 2px `ink` outline.
- **Button — secondary:** `cream` bg, `ink` text, 2px `ink` outline, same
  sizing, same Oswald treatment.
- **Open/closed status pill:** `green` bg (open) or `red` bg (closed), cream
  text, Oswald 700 uppercase, 999px radius, 2px `ink` outline.
- **Card (review, seasonal item):** `cream` bg, 2px `ink` outline, hard
  drop-shadow (signage style), 24px padding.
- **Eyebrow pill:** `cream` bg, 1px `ink` outline, Oswald 500 uppercase,
  0.22em tracking, 4px/10px padding.
- **Section heading block:** eyebrow → h2 (Oswald 700) → optional intro
  paragraph in Inter.
- **Produce illustration:** SVG only, `ink` outline on every shape,
  confident flat color fills. Use the palette above — no inventing new
  produce colors.
- **Footer:** `ink` background, `cream` text, small tent mark + wordmark,
  single Oswald tagline line, contact info in Inter.

## 6. Imagery + iconography

- **Photography:** real produce only, shot in daylight at the stand. Keep
  the honest photos already on the live site, drop any with visible price
  tags (already done per MEMORY.md). If replacing, hand-drawn SVG
  illustration beats any stock photo.
- **Illustration style:** flat color + heavy black outline, matching the
  logo tent. All new illustrations use the `EP_COLORS` palette.
- **Icons:** Lucide, 1.5–2px stroke, `currentColor`. Used sparingly —
  only for map pin, clock, phone in the Visit block.
- **Logo lockups** (all in `site\logo-concepts`):
  - `everyday-produce-logo.svg` — full horizontal lockup, 920×400
  - `logo.jsx` — React components (`EPTent`, `EPWordmark`,
    `EPLogoHorizontal`, `EPLogoStacked`)
  - `deliverables.jsx` — favicon, business card, web banner, social
    avatar, signage mockup

### 6a. Photo treatment (applies to ALL images — real photos AND AI-generated)

> Full guide: `PHOTO-STYLE-GUIDE.md` (rationale) + `PHOTO-STYLE-GUIDE.json`
> (pipeline config). This section is the short version that AI tools and
> sub-agents must follow. Every photo or generated image on this brand
> gets the same treatment so the site feels like one scene, not a
> collage.

**North star:**
> A hot Saturday morning in July. The awning casts warm shadows. A pyramid
> of tomatoes that actually smells like tomatoes.

**Mandatory rules** (same for real photos and AI output):

1. **Warm + saturated, not neutral.** White balance target 5200K
   (slightly warmer than default 5400K). Saturation runs hot: 0.98 on
   normal shots, 1.02 on low-contrast. Real produce color sells produce.
   Restraint reads as dull here.
2. **Color is the product.** Red boost `×1.04`, blue trim `×0.96`. Red
   tomatoes, yellow corn, green peppers should look like you can smell
   them through the screen.
3. **Daylight only.** 5000–5400K, never cooler than 5800K. No cool/blue
   studio lighting, no magic-hour orange sunsets, no flash.
4. **Shadow lift on high-contrast shots.** Awnings make brutal shadows;
   lift so bins are legible (gamma 1.25 vs master default 1.22).
5. **Dirt and imperfection are features.** Soil on carrots, a slightly
   bruised pear, Konrad's weathered hand reaching into a bin. Do NOT
   smooth skin, retouch produce, or make anything look supermarket-clean.
6. **No prices on the photo.** Ever. Crop out, patch out, or reject.
   Prices change weekly; photos last for six months.
7. **Subject fill 80–90%** on produce close-ups (tighter than the 70–85%
   house default). Tight equals appetizing.
8. **Crops:** 16:9 hero (storefront, awning, Konrad working),
   4:3 card (grid items, seasonal callouts),
   3:4 portrait (produce close-ups, mobile-first).

**Reject a photo/image if:**
- It has a visible price tag that can't be cropped or patched.
- Konrad's face is identifiable and we haven't confirmed web-use consent.
- A customer's face is identifiable at all (privacy).
- Produce is past-prime in a way that reads "sad" (black banana, wilted
  lettuce). We sell the good stuff.
- Lighting is cool/blue, interior-studio, or dusk/night. Daylight only.

**AI-generated-image extras (Claude Design, Stitch, Midjourney, etc.):**
- Prefer stylized illustration over photo-realistic when generating.
  Flat color + black outline (matching the logo style) is the safer
  default — real photo is the gold standard, AI-realistic is the risky
  middle ground.
- If generating a photo-realistic scene, include these in the prompt:
  "Kansas City neighborhood produce stand under a green-and-white striped
  awning, July morning sun, warm saturated color, visible dirt on
  carrots, no price tags, no text on the image."
- Never generate a human face for this brand. If a person is needed, use
  a silhouette or hands-only composition, or use a real photo of Konrad
  with his consent.
- Always run the output through the photo-pipeline adaptive grade with
  the `PHOTO-STYLE-GUIDE.json` overrides so AI images match real ones.

**Where processed images live:**
`web-clients/everyday-produce/site/Media/<shoot-date>/processed/`
with role subfolders (`hero/`, `card/`, `portrait/`, `_rejected/`,
`_report.md`). Source `_raw` files stay in place — never delete originals.

## 7. Motion

- Ease: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Durations: 150ms (hover), 250ms (reveal), 400ms (hero, once).
- No parallax. No autoplay video. No scroll-jacking.
- Optional: a subtle bounce on the tent mark on page load (100ms squash,
  200ms release). Do not overdo — this is signage, not a cartoon.

## 8. Accessibility floor

- WCAG 2.2 AA minimum. Currently Lighthouse 96, targeting 98+.
- Skip-to-content link already in place — preserve it.
- Red wordmark (`#B8232A`) on cream: **passes AA for large/display only**.
  Never use red for body copy. Body copy is `ink` on `cream`.
- Focus rings visible, 2px outline `ink` on cream, `cream` on dark.
- All produce illustrations use `aria-hidden="true"` (decorative). Alt
  text lives on photos only.
- Hours block uses semantic `<time>`.

## 9. Voice + tone (for all site copy, social captions, emails, alt text)

> The tone rules apply to EVERY word that goes out under this brand —
> homepage copy, review responses, Google Business Profile posts, social
> media, email replies, even alt text on produce images.

**Voice, in one line:**
> A Waldo neighbor who knows when the peaches came in and will tell you
> straight whether they're ready yet.

**The three anchors:**

1. **Specific beats generic.** Always.
   - Yes: "Peaches came in Tuesday. Maybe three days left."
   - No: "Experience our farm-fresh seasonal bounty."
2. **Warm but not saccharine.** Friendly neighbor, not a hostess greeting.
   - Yes: "Come see us. We're open till the melons run out."
   - No: "We'd love to welcome you to our family-owned tradition!"
3. **Plain words, real sentences.** Feynman curious-explainer voice —
   like telling a smart friend something true, not marketing to them.
   - Yes: "Most of our tomatoes come from a guy in Grain Valley."
   - No: "Thoughtfully sourced heirloom varietals from curated growers."

**Sentence length:** Short. Most sentences under 15 words. Mix with the
occasional longer one for rhythm, but never run-on. Read it aloud — if
it sounds like a brochure, rewrite.

**Headings:** Declarative and specific.
- Yes: "This week at the stand" / "Come see us" / "What folks say"
- No: "Seasonal Selections" / "Visit Our Location" / "Testimonials"

**Buttons / CTAs:** Verb first, plain. 1–3 words ideal.
- Yes: "Get directions" / "Call the stand" / "See what's in season"
- No: "Learn more" / "Discover" / "Explore our offerings"

**Tagline:** "Waldo Tradition Since 1985." 

### Banned words and phrases

Never use any of these. They are either AI-speak, marketing-speak, or
both.

- unlock, elevate, seamless, seamlessly, empower, revolutionize, curate,
  curated, bespoke, artisan, artisanal, crafted, handcrafted
- bounty, farm-fresh, farm-to-table, garden-fresh, freshest, premium,
  finest, quality (as an adjective)
- journey, passion, passionate, dedicated, commitment, community
  (as filler — use only if you name the actual community thing)
- experience (as a noun), experience (the verb when it means "visit")
- delve, tapestry, whimsical, leverage, synergy, robust, cutting-edge,
  state-of-the-art, game-changer, disrupt, vertical, solution
- "Nestled in the heart of" + any neighborhood
- "Since time immemorial" / "For generations" (unless actually true and
  documented — 1985 is documented if we verify it; anything vaguer is out)

### Banned punctuation / formatting

- **No em dashes.** Use regular dashes (`-`) or reword. Hard rule, brand
  and workspace-wide.
- No exclamation points in body copy. One per page maximum, and only if
  it's genuinely exclamatory ("We're open!" on a status banner is OK).
- No all-caps in prose. ALL-CAPS is reserved for Oswald/Alfa Slab One
  display headings + eyebrows, never inside paragraphs.
- No "smart quotes" that break copy-paste. Straight quotes in HTML, and
  let the typography layer render curly quotes at render time if needed.
- No oxford-comma debate — use oxford commas. Consistency wins.

### Specific copy patterns

**Open/closed status:**
- Open: "Open today 9–6." (no colon in time, en-dash or plain hyphen)
- Closed: "Closed today. Back tomorrow 9–6."
- Seasonal close: "See you in April. Follow for the opening date."

**Seasonal item card (3-line pattern):**
- Line 1 (name, Oswald 700 uppercase): "PEACHES"
- Line 2 (status, Inter 500): "In now. Maybe three days left."
- Line 3 (source/note, Inter 400 italic, optional): "From a guy in Grain
  Valley."

**Review response voice** (if Konrad replies to Google reviews through
the site or a template):
- Thank by name, name the specific thing, keep it short.
- Yes: "Thanks Sarah — the sweet corn this week is unreal, glad you
  caught it." (regular dash, not em dash)
- No: "Thank you for your amazing review! We are so grateful for our
  wonderful community!"

**Alt text for produce photos:**
- Describe what's in the image, plainly.
- Yes: "Red tomatoes piled on a wooden bin under the stand's awning."
- No: "Fresh local tomatoes from Everyday Produce Market."

**404 / empty states:**
- Keep it in voice. "That page grew legs and walked off. Try the home
  page."

### Legal / safety (the non-negotiables)

- Never list Konrad's personal cell (816-520-5801). Public number only:
  **816-942-6344.**
- Never list customer faces, names, or vehicles without consent.
- Don't claim organic, certified, or non-GMO unless verified in writing.
- Don't claim a year (1985) on the public site until confirmed.
- Don't invent reviews. Pull real ones from Google.

## 10. Do + Don't (quick reference)

**Do:**
- Lead with "open now / closed / seasonal" — the #1 question visitors have.
- Use specific, warm copy ("peaches ready Tuesday") over generic
  ("farm-fresh bounty").
- Keep phone (816-942-6344) and address reachable in one tap from anywhere.
- Preserve the black outline on all logo and produce illustration elements
  — Konrad specifically requested this and it's the brand signature.
- Apply the photo treatment in section 6a to EVERY image (real or AI-
  generated) before it goes live.
- Run copy through the banned-words list in section 9 before shipping.

**Don't:**
- **Never use Playfair Display or DM Sans on this brand.** (Retired when
  Konrad rejected the Apr 22 concepts.)
- No em dashes in body copy. Regular dashes or reword.
- No AI-style language (full list in section 9).
- No stock photos (smiling farmers, wicker baskets on gingham, glistening
  heirloom tomatoes from Shutterstock).
- Do NOT list Konrad's personal cell (816-520-5801). Public number only:
  816-942-6344.
- No newsletter signup unless Konrad asks.
- Don't soften the brand — no rounded 16px radii, no soft drop shadows,
  no pastel fills. Vintage sign-painted is the whole point.

## 11. Handoff

- Live site: https://everyday-produce.com (GitHub Pages + Cloudflare DNS)
- Repo: GitHub Pages site (check CNAME for repo name)
- Design system home: `modules/groundlayer/factory/clients/everyday-produce/`
- Project brief: `PROJECT.md`
- Logo system: `site\logo-concepts` (all files)
- Claude Design brief: `\modules\groundlayer\factory\clients\everyday-produce\everyday-produce.design.md`
- Photo style guide: `PHOTO-STYLE-GUIDE.md` + `.json`
- When Claude Code implements from a Claude Design artifact, prompt with:
  "Use `modules/groundlayer/factory/clients/everyday-produce/everyday-produce.design.md`
   as source of truth for colors, typography, and components. Import
   the logo system from `site\logo-concepts\logo.jsx` (or use the
   standalone `everyday-produce-logo.svg`). Preserve skip-to-content link
   and ADA fixes. Don't touch Cloudflare DNS."

## 12. Handing the logo to external tools (Claude Design, Stitch, Figma)

The master SVG at `clients\everyday-produce\site\logo-concepts\Everyday Produce Logo.html`
uses a `<style>` block with class references. Most external AI design
tools strip or sandbox style blocks, which makes every path fall back
to the default SVG fill (black) and the whole logo renders as a black
silhouette.

**Always hand the INLINED version to any external tool:**
- `logo-concepts-2026-04-22/everyday-produce-logo.inlined.svg`
- Or regenerate with: `node tools/svg-inline-styles.js <input.svg>`

Renders byte-identically to the original in librsvg (and any compliant
renderer) but works everywhere — no style block to strip.

#
