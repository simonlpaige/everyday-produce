# Everyday Produce Market - Photo Style Guide

> Client-specific overrides on top of the master `web-clients/_docs/PHOTO-STYLE-GUIDE.md`. Read the master first. This document only lists what's different for Everyday Produce Market.
>
> Applies to BOTH: (a) photo-pipeline.js processing of real photos, and
> (b) any AI-generated image (Claude Design, Stitch, Midjourney, etc.).
> Renamed 2026-04-24: "Everyday Produce" → "Everyday Produce Market."

**Client:** Everyday Produce Market (Konrad Pfeifauf, owner)
**Site:** everyday-produce.com
**Neighborhood:** Waldo, Kansas City
**Business character:** Open since 1985. Hand-picked local produce. Seasonal. Outdoor-ish stand under an awning at 7300 Wornall Rd. Regulars know it. Strangers find it because the tomatoes are real.

---

## 1. Brand-specific look

**North star:** *A hot Saturday morning in July, the awning casts warm shadows, and there's a pyramid of tomatoes that actually smells like tomatoes.*

- **Warmer than the house Prairie grade.** Tomatoes, peaches, peppers, corn - this is a warm-palette business. Don't cool the shots toward neutral if they came in warm; ride the warmth.
- **Color is the product.** Unlike the default brand pullback (sat 0.92), for Everyday Produce we go **sat 0.98** on normal shots and **sat 1.02** on the low-contrast ones. Real produce colors sell produce. Restraint here reads as *dull*.
- **Light should feel like outdoor daylight.** Even when shot under the awning. Lean toward 5000-5400K, never cooler than 5800K.
- **Dirt and imperfection are features.** Soil on carrots, a slightly bruised pear, Konrad's weathered hand reaching into a bin. Do not smooth, do not retouch, do not make this look like a supermarket.

## 2. Crops and CSS slot mapping

Default three crops from the master guide still apply (16:9 hero, 4:3 card, 3:4 portrait). Plus:

- **Hero priority:** 16:9 is the primary use case - the site already has a gallery billboard hero at the top. Process every eligible shot at hero first.
- **Produce close-ups** (berries, tomatoes, single bin shots): prefer **portrait 3:4**. Vertical fills mobile screens and the gallery grid likes the variety.
- **Storefront / awning / Konrad working shots:** **16:9 hero only** - these are atmosphere, not tiles.
- **Subject fill:** produce close-ups should fill **80-90%** of the frame (tighter than the 70-85% default). Tight equals appetizing.

### CSS slot constraints (enforced in index.html)

Every photo slot has an `aspect-ratio` lock. The photo must suit the slot's ratio or it will be center-cropped by `object-fit: cover`. Do NOT override with `object-fit: contain` - that creates letterboxed padding and looks broken.

| Slot class | CSS aspect-ratio | Best photo type | Notes |
|---|---|---|---|
| `.season-photo` | 4/3 landscape | Produce bins, wide stand shots | Locked in CSS |
| `.callout-photo` | 3/4 portrait | Tight produce close-ups | Locked in CSS |
| `.weekend-photo-card img` | 3/4 portrait | Any produce or sign photo | Locked in CSS |
| `.gallery-item` (hero row) | 16/9 | Storefront, awning, wide shots | Locked in CSS |

**HTML `width` + `height` attributes MUST match actual pixel dimensions.** The browser uses these before CSS loads to reserve space. Wrong values cause aspect ratio jank. Always check with `python3 -c "from PIL import Image; print(Image.open('photo.jpg').size)"`

### The `featured` class rule

`.weekend-photo-card.featured` spans 2 columns. Only use it for:
- Landscape (wider than tall) photos
- Produce shots where you want hero prominence

Do NOT use `featured` on portrait sign photos or casual Konrad snapshots - equal-size 4-up tile grid looks better for those.

### Photo type vs. slot

When Konrad sends photos, match them to slots before placing:

| Photo type | Right slot | Notes |
|---|---|---|
| Tight produce close-up (peaches, tomatoes) | `.callout-photo` + `.weekend-photo-card` | The money shot |
| Stand sign ("GEORGIA PEACHES") | `.weekend-photo-card` (no featured) | Atmosphere, 4-up grid |
| Stand-wide / awning / Konrad working | `.gallery-item` hero row | 16:9 crop first |
| Casual context shot (stand from distance) | `.weekend-photo-card` or reject | Needs tight crop |
| Any photo with price tags visible | Crop out or reject | See section 3 |

## 3. Text / price removal (IMPORTANT for this client)

Produce stands have hand-written price tags. **These must come off** for the website - prices change weekly and we don't want a photo of "$2.49/lb" living on the site for six months.

Priority:
1. **Re-crop to exclude** - almost always works on produce shots because the pyramid/bin fills most of the frame.
2. **Patch** - acceptable for a price tag floating on a wooden crate or a chalkboard if the patch region is small (< 5% of image area) and the surrounding texture is uniform.
3. **Reject** - if the price is integral to the composition (e.g., the hand-written chalkboard IS the photo), reject and re-shoot.

**What stays:**
- The "Everyday Produce" sign/storefront - that's identity.
- Seasonal hand-lettered signs that say "LOCAL TOMATOES" (no price) - those are atmosphere.
- Any signage that is clearly Konrad's voice and not a price.

**Anything with a specific dollar amount must be removed before the photo goes live.**

## 4. Adaptive grade - Everyday Produce overrides

The master pipeline's adaptive analysis runs as usual. These overrides apply:

| Setting | Master default | Everyday Produce |
|---|---|---|
| Saturation (normal shots) | 0.92 | **0.98** |
| Saturation (low-contrast) | 0.96 | **1.02** |
| Warm tint (red boost) | ×1.03 | **×1.04** |
| Warm tint (blue trim) | ×0.97 | **×0.96** |
| Shadow lift on high-contrast | γ1.22 | **γ1.25** (awning = deep shadow) |
| Max lift on crushed-blacks | γ1.28 | γ1.28 (unchanged) |
| White balance target | 5400K | 5200K (slightly warmer) |

Rationale: shots under an awning on a sunny day have brutal shadow/highlight contrast. Shadow lift gets bumped so you can actually see into the bins. Saturation gets bumped because you're selling the color of real tomatoes.

## 5. Rejection rules (client-specific additions)

In addition to master-guide rejection rules, reject if:
- A price is unavoidable and can't be cropped or patched.
- Konrad's face is clearly identifiable and we haven't confirmed he's okay with web use. (Safer to reject and ask.)
- A customer's face is clearly identifiable at all. (Privacy; reject or crop.)
- Produce is visibly past-prime in a way that reads as "sad" (black banana, wilted lettuce). We're selling the good stuff.

## 6. Output location

Processed images land under `web-clients/everyday-produce/site/Media/<shoot-date>/processed/` with the master guide's role subfolders (`hero/`, `card/`, `portrait/`, `_rejected/`, `_report.md`).

Source (`_raw`) stays in place - we don't delete originals.

## 7. Run command for this client

```
node web-clients/_docs/photo-pipeline.js `
  --in web-clients/everyday-produce/site/Media/<shoot-date> `
  --out web-clients/everyday-produce/site/Media/<shoot-date>/processed `
  --client "Everyday Produce" `
  --client-config web-clients/everyday-produce/PHOTO-STYLE-GUIDE.json `
  --emit-html
```

The `--client-config` flag loads the JSON overrides (see sibling `PHOTO-STYLE-GUIDE.json`) so the adaptive grade uses Everyday Produce settings instead of the Prairie defaults.

---

## One-line summary

> **Warm summer Saturday morning. Real produce colors. No prices on the photo. Dirt is a feature.**
