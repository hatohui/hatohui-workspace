---
name: ux-ui-principles
description: Universal UX/UI rules for building or reviewing any interface in hatohui-workspace — visual hierarchy, typography, content presentation, and user flow. Use when asked to improve the UI/UX, polish a page or component, or review a screen before shipping.
argument-hint: '[app, page, or component]'
metadata:
  version: '1.0.0'
---

# UX/UI Principles

Domain-free rules for a clean, professional, easy-to-use interface. Apply them to any app under `apps/*`. For aesthetic direction, palettes and font pairings, pair with `ui-ux-pro-max` or `frontend-design`; this skill is the checklist that keeps the result consistent and usable.

## When to Use

- "Improve the UI/UX" of a page, component, or whole app.
- Reviewing a screen before merging.
- Starting a new screen and wanting a baseline to design against.

## Workflow

1. Read `docs/conventions.md` (React apps section) before touching code.
2. Read the target screen and the shared pieces it uses (`packages/ui`, the app's `constants/` and design tokens). Reuse tokens and shared components; never hardcode colors, spacing, or copy.
3. Audit the screen against the checklist below. List violations before editing.
4. Fix the highest-impact ones first (hierarchy and flow before polish). Keep changes inside the repo rules: logic in hooks, one component per file, no emoji, strings through i18n, shared UI in `packages/ui`.
5. Verify in the browser preview at mobile and desktop widths, light and dark if the app supports both.

## Visual Hierarchy and Interface Logic

- **Element contrast.** Interactive or critical icons stay legible on any background. Give them a subtle container or outline instead of relying on the backdrop.
- **Standardized alignment.** One layout grid and one spacing scale per app. Every element aligns to it; nothing is nudged by eye.
- **Soft dividers.** Separate sections with light, low-contrast strokes or whitespace. The page should read as one cohesive experience, not a stack of harsh blocks.
- **Natural palette.** Soft, harmonious colors that support the content. Reserve saturated color for the primary action and for status.

## Typography and Readability

- **One font family.** Build structure through size, weight, and line height, not by mixing typefaces.
- **Text spacing.** Tracking on headings (tighter at large sizes, slightly open at small caps); generous line height (about 1.5-1.7) and a comfortable measure (roughly 60-75 characters) for body text.

## Content Presentation and Trust

- **Uniform imagery.** Same aspect ratio, framing, crop, and corner radius across a set (for example square gallery art). Mixed styles read as unfinished.
- **Trust signals near the subject.** Put status, ratings, credentials, and other metadata right beside the thing they describe so value is assessed at a glance.
- **Simplify information.** Drop redundant labels and filler. Text should say what the content is, once.

## User Flow

- **Reduce friction.** Place the primary action next to the content it affects.
- **Transparency.** Show real-time feedback and totals so the outcome is clear before the user commits (live previews, running counts, validation as they type).
- **Sticky essentials.** Keep key controls and navigation reachable without scrolling back (sticky header, sticky action bar on long forms).
- **Predefined options.** Offer quick common choices (presets, chips, defaults) alongside a custom option for flexibility.

## Baseline Checks

Always verify, regardless of the screen:

- Visible focus states, keyboard reachability, and 4.5:1 text contrast.
- Touch targets of at least 44px on mobile.
- Loading, empty, and error states exist and are designed, not blank.
- Motion is subtle and respects `prefers-reduced-motion`.
- No layout shift as images and data load; reserve space.

## Output

When reviewing, report findings grouped by the four sections above, each with the file and the proposed fix. When implementing, summarize what changed per principle.
