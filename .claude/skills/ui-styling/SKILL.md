---
name: claude-design-system
description: Anthropic Claude.com design system (DESIGN.md) — cream canvas, coral #cc785c accent, Copernicus serif display, StyreneB/Inter sans body, dark navy product surfaces. Use when building or restyling UI/marketing pages that should match Claude's editorial warm-cream + coral + dark-navy visual identity, or when the user asks for "Claude's design system", "Anthropic style", or references this DESIGN.md.
---

# Claude Design System

version: alpha
name: Claude
website: "https://claude.com"
description: A warm-canvas editorial interface for Anthropic's Claude product. The system anchors on a tinted cream canvas with serif display headlines, warm coral CTAs, and dark navy product surfaces (code editor mockups, model showcase cards). Brand voltage comes from the cream/coral pairing — deliberately warm and humanist where most AI brands use cool blue + slate. Type voice runs a slab-serif display ("Copernicus" / Tiempos Headline) for h1/h2 and a humanist sans for body. The signature Anthropic black-radial-spike mark anchors the wordmark.

## Overview

Claude.com is the warmest, most editorial interface in the AI-product category. The base atmosphere is a **tinted cream canvas** (`colors.canvas` — #faf9f5) — distinctly warm, deliberately not the cool gray-white that every other AI brand uses. Headlines run a **slab-serif display** ("Copernicus" / Tiempos Headline) at weight 400 with negative letter-spacing, paired with **StyreneB / Inter** body sans. The combination feels like a literary publication, not a SaaS marketing page.

Brand voltage comes from the **cream + coral pairing** — coral (`colors.primary` — #cc785c) is the signature Anthropic accent, used on every primary CTA, on the brand wordmark, and on full-bleed callout cards. The coral is warm, slightly muted, never cyan/blue — a deliberate counter-positioning against OpenAI's cool slate, Google's saturated blue, and Microsoft's corporate cyan.

The system has three surface modes that alternate page-by-page:
1. **Cream canvas** (`colors.canvas`) — default body floor
2. **Light cream cards** (`colors.surface-card`) — feature card backgrounds
3. **Dark navy product surfaces** (`colors.surface-dark`) — code editor mockups, model showcase cards, pre-footer CTAs, footer itself

The dark surfaces are where Claude shows its product chrome — code blocks, terminal output, model comparison tables, agentic-flow diagrams. The cream-to-dark contrast is the page's pacing rhythm.

**Key Characteristics:**
- Warm cream canvas (`colors.canvas` — #faf9f5) with dark warm-ink text (`colors.ink` — #141413). The brand's defining color choice.
- Coral primary CTA (`colors.primary` — #cc785c). Used scarcely on individual buttons, generously on full-bleed coral callout cards.
- Slab-serif display headlines via Copernicus / Tiempos Headline at weight 400 with negative letter-spacing. Pairs with humanist sans body for a literary editorial voice.
- Dark navy product mockup cards (`colors.surface-dark` — #181715) carrying code blocks, terminal panels, model comparison data — the brand shows the product chrome at scale rather than abstract marketing illustrations.
- Light cream feature cards (`colors.surface-card` — #efe9de) — slightly darker than canvas, used for content-driven feature explanations.
- Anthropic radial-spike mark — a small black asterisk-like glyph (4-spoke radial) — appears as the brand wordmark prefix and as a content marker.
- Border radius is hierarchical: `rounded.md` (8px) for buttons + inputs, `rounded.lg` (12px) for content + product cards, `rounded.xl` (16px) for the hero illustration container, `rounded.pill` for badges.
- Section rhythm `spacing.section` (96px) — modern-SaaS standard. Internal card padding stays generous at `spacing.xl` (32px).

## Colors

### Brand & Accent
- **Coral / Primary** `#cc785c` — every primary CTA background, full-bleed coral callout cards, brand wordmark accent.
- **Coral Active** `#a9583e` — press / hover-darker variant.
- **Coral Disabled** `#e6dfd8` — desaturated cream-tinted disabled state.
- **Accent Teal** `#5db8a6` — sparingly on secondary product surfaces (status indicators).
- **Accent Amber** `#e8a55a` — small companion warm-tone on category badges and inline highlights.

### Surface
- **Canvas** `#faf9f5` — default page floor. Warm, deliberately not pure white.
- **Surface Soft** `#f5f0e8` — section dividers, soft band backgrounds.
- **Surface Card** `#efe9de` — feature/content cards, one step darker than canvas.
- **Surface Cream Strong** `#e8e0d2` — selected category tabs, emphasized section bands.
- **Surface Dark** `#181715` — code editor mockups, model showcase cards, footer.
- **Surface Dark Elevated** `#252320` — elevated cards inside dark bands.
- **Surface Dark Soft** `#1f1e1b` — code block backgrounds inside larger dark cards.
- **Hairline** `#e6dfd8` — 1px border tone on cream surfaces.
- **Hairline Soft** `#ebe6df` — barely-visible divider.

### Text
- **Ink** `#141413` — headlines and primary text.
- **Body Strong** `#252523` — emphasized paragraphs, lead text.
- **Body** `#3d3d3a` — default running text.
- **Muted** `#6c6a64` — sub-headings, breadcrumbs.
- **Muted Soft** `#8e8b82` — captions, fine-print.
- **On Primary** `#ffffff` — text on coral buttons.
- **On Dark** `#faf9f5` — cream-tinted white on dark surfaces.
- **On Dark Soft** `#a09d96` — footer body text, secondary labels in dark mockups.

### Semantic
- **Success** `#5db872` · **Warning** `#d4a017` · **Error** `#c64545`

## Typography

Copernicus (or Tiempos Headline) slab-serif display, weight 400, negative tracking, for h1–h3. StyreneB (or Inter) humanist sans for body/nav/UI. JetBrains Mono for code.

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| display-xl | 64px | 400 | 1.05 | -1.5px | Homepage h1 — Copernicus |
| display-lg | 48px | 400 | 1.1 | -1px | Section heads — Copernicus |
| display-md | 36px | 400 | 1.15 | -0.5px | Sub-section heads, model names |
| display-sm | 28px | 400 | 1.2 | -0.3px | Pricing tier names, callout headlines |
| title-lg | 22px | 500 | 1.3 | 0 | Pricing plan size labels |
| title-md | 18px | 500 | 1.4 | 0 | Feature card titles, intro paragraphs |
| title-sm | 16px | 500 | 1.4 | 0 | Connector tile titles, list labels |
| body-md | 16px | 400 | 1.55 | 0 | Default running text |
| body-sm | 14px | 400 | 1.55 | 0 | Footer body, fine print |
| caption | 13px | 500 | 1.4 | 0 | Badge labels |
| caption-uppercase | 12px | 500 | 1.4 | 1.5px | Category tags, "NEW" badges |
| code | 14px | 400 | 1.6 | 0 | Code blocks — JetBrains Mono |
| button | 14px | 500 | 1.0 | 0 | Button labels |
| nav-link | 14px | 500 | 1.4 | 0 | Top-nav menu items |

Display sizes use weight 400, never bold — negative letter-spacing (-0.3 to -1.5px) is essential. Body stays weight 400 for paragraphs, 500 for labels.

**Substitutes if Copernicus/StyreneB unavailable:** Cormorant Garamond (weight 500, -0.02em) or EB Garamond for serif; Inter or Söhne for sans.

## Layout

- Base unit 4px. Tokens: xxs 4 · xs 8 · sm 12 · md 16 · lg 24 · xl 32 · xxl 48 · section 96.
- Section padding 96px; card padding 32px (feature/pricing/model cards), 24px (code-window/connector tiles); coral callout padding 48px.
- Max content width ~1200px centered. Hero often 6/6 split. Feature grids 3-up desktop / 2-up tablet / 1-up mobile. Connector tiles 4-6-up desktop.

## Elevation

Color-block first, shadow rare. Flat sections have no shadow/border. Inputs/cards use hairline borders or flat cream/dark surface-color blocks. Only a faint `0 1px 3px rgba(20,20,19,0.08)` shadow on rare hover-elevated states.

## Shapes

| Token | Value | Use |
|---|---|---|
| xs | 4px | badge accents, tiny dropdowns |
| sm | 6px | small inline buttons |
| md | 8px | CTA buttons, text inputs, category tabs |
| lg | 12px | content cards |
| xl | 16px | hero illustration container |
| pill/full | 9999px | badges, avatars |

Illustrations: simple coral + dark-navy line-art on cream, code editor mockups, terminal output, abstract model-comparison thumbnails. Rarely photography; when used, circular avatars at 40px.

## Components

- **top-nav** — 64px, cream bg, spike-mark + wordmark left, menu center, Sign-in + Try-Claude (coral button-primary) right.
- **button-primary** — coral bg, white text, 12x20 padding, 40px height, 8px radius. `button-primary-active` darkens to #a9583e.
- **button-secondary** — cream bg, hairline border, ink text, same sizing as primary.
- **button-secondary-on-dark** — dark-elevated bg (#252320), on-dark text. Never inverts to light on dark surfaces.
- **button-text-link** — no background, inline (e.g. "Sign in").
- **button-icon-circular** — 36px circle, cream bg, hairline border.
- **text-link** — coral inline links, underline on press.
- **hero-band** — cream canvas, 6/6 grid (h1+sub+buttons left, illustration/mockup right), 96px vertical padding.
- **hero-illustration-card** — cream or dark, 16px radius.
- **feature-card** — surface-card bg (#efe9de), 12px radius, 32px padding, icon + title-md + body-md.
- **product-mockup-card-dark** — surface-dark bg, 12px radius, 32px padding, shows real product chrome.
- **code-window-card** — surface-dark bg with surface-dark-soft inner code block, JetBrains Mono, 12px radius, 24px padding. The signature Claude Code visual.
- **model-comparison-card** — cream + hairline border, 12px radius, 32px padding.
- **pricing-tier-card** — cream + hairline, 32px padding; **pricing-tier-card-featured** flips to surface-dark (the dark bg IS the "featured" signal).
- **callout-card-coral** — full-bleed coral bg, white text, 12px radius, 48px padding — coral surface IS the voltage.
- **connector-tile** — cream + hairline, 12px radius, 20px padding.
- **text-input** / **text-input-focused** — cream bg, 8px radius, 40px height, hairline border; focus shifts border to coral + 3px coral-15%-alpha ring.
- **cookie-consent-card** — surface-dark, 12px radius, 24px padding, floating bottom-right.
- **badge-pill** — surface-card bg, pill radius, caption type.
- **badge-coral** — coral bg, white caption-uppercase, pill radius.
- **category-tab** / **category-tab-active** — transparent/muted vs surface-card/ink, 8px radius.
- **cta-band-coral** / **cta-band-dark** — pre-footer CTA bands, 12px radius, 64px padding, display-sm headline (still serif).
- **footer** — surface-dark, on-dark-soft text, 4-column links, 64px padding. Never inverts.

## Do's and Don'ts

**Do:**
- Anchor every page on the cream canvas, never pure white.
- Use Copernicus serif for every display headline with negative letter-spacing; pair with StyreneB/Inter body.
- Reserve coral for primary CTAs and full-bleed callout cards only.
- Use dark product-mockup/code-window cards to show real Claude product chrome, not illustrations of it.
- Alternate cream feature cards with dark navy mockup cards for pacing.
- Apply 96px between major sections.

**Don't:**
- Don't use cool grays or pure white for canvas.
- Don't bold the serif display weight (stays 400).
- Don't use cool blue/cyan as a brand accent — coral is the only accent voltage.
- Don't scatter coral everywhere — scarce on elements, generous only on full-bleed coral cards.
- Don't use Inter for display headlines — serif is the brand voice.
- Don't repeat the same surface mode in two consecutive bands — alternate cream → cream-card → dark-mockup → cream → coral-callout → dark-footer.
- Don't add hover states beyond what's specified (primary darkens on press; nothing else changes).

## Responsive

| Breakpoint | Width | Key Changes |
|---|---|---|
| Mobile | < 768px | Hamburger nav; h1 64→32px; illustration stacks below; grids 1-up; footer 4→1 col |
| Tablet | 768–1024px | Nav tightens; feature cards 2-up; connector tiles 3-up; pricing 2-up |
| Desktop | 1024–1440px | Full nav; 3-up feature cards; 4/6-up connectors; 3-up pricing |
| Wide | > 1440px | Same as desktop, max content width caps at 1200px |

Code blocks scroll horizontally rather than wrap at every breakpoint. Featured pricing tier's dark surface stays distinct at every breakpoint.

## Known Gaps

- Copernicus and StyreneB are licensed Anthropic typefaces with no public web fonts — use the substitutes listed above.
- The Anthropic radial-spike-mark is a logo asset (inline SVG), not a formalized token.
- Animation/transition timings (chat reveals, code typewriter, agentic-flow diagrams) are out of scope.
- Form validation states beyond focus aren't specified.
- claude.ai's actual product chrome (chat bubbles, message tools, conversation sidebar) isn't covered — this is the marketing-surface system only.
