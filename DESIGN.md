---
name: 英國旅遊計畫
description: 旅伴共用的英國旅遊規劃工具，行程、費用、票券一站管理
colors:
  wine-red: "#c22b1f"
  wine-red-deep: "#a82318"
  parchment-white: "#FAFAF8"
  warm-cream: "#f6f3ea"
  charcoal: "#3D3D3D"
  warm-taupe: "#9a8878"
  muted-rose: "#c07a72"
typography:
  display:
    fontFamily: "'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.06em"
  title:
    fontFamily: "'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
  body:
    fontFamily: "'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0.02em"
  label:
    fontFamily: "'Microsoft JhengHei', '微軟正黑體', -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.13em"
rounded:
  sm: "4px"
spacing:
  xs: "6px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "28px"
components:
  button-primary:
    backgroundColor: "{colors.wine-red}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.sm}"
    padding: "9px 20px"
  button-primary-hover:
    backgroundColor: "{colors.wine-red-deep}"
    textColor: "{colors.parchment-white}"
    rounded: "{rounded.sm}"
    padding: "9px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "6px 13px"
  button-ghost-hover:
    backgroundColor: "transparent"
    textColor: "{colors.wine-red}"
    rounded: "{rounded.sm}"
    padding: "6px 13px"
  input-default:
    backgroundColor: "{colors.warm-cream}"
    textColor: "{colors.charcoal}"
    rounded: "{rounded.sm}"
    padding: "9px 12px"
---

# Design System: 英國旅遊計畫

## 1. Overview

**Creative North Star: "The Gentleman's Travel Almanac"**

Like a well-worn leather journal from a Victorian-era traveller's library — organized, detailed, with the occasional wine-ink annotation. This is not a productivity app trying to look friendly, nor a travel app chasing Instagram aesthetics. It is a personal reference object: authoritative, warm, quietly confident.

Every surface suggests paper and ink. The warm cream grounds long reading sessions without strain. The wine red appears with the restraint of a wax seal — only where something truly matters. Decorative details, when they appear, feel like typographic ornaments on a printed timetable, not decoration for decoration's sake.

This system explicitly rejects: SaaS dashboards with dark backgrounds and neon accent grids; glassmorphism overlays that prioritize visual effect over content; the busy visual language of consumer travel apps like Airbnb or GetYourGuide; full-bleed hero imagery that competes with the user's own photos.

**Key Characteristics:**
- Warm parchment surfaces with ink-like typography
- Single wine-red accent used sparingly — its rarity is its authority
- Generous vertical rhythm; information breathes
- Subtle letter-spacing on labels and headings, evoking typeset print
- Flat by default; elevation only for interactive state feedback
- British restraint: ornamental detail only at the edges, never at the center

## 2. Colors: The Almanac Palette

A two-tone paper-and-ink foundation with one authoritative accent. Every color earns its place by being either structural or signaling — never decorative.

### Primary
- **Seal Wax Red** (#c22b1f): The single accent. Used for CTAs, active navigation states, the section-title underbar, the timeline gradient origin, and interactive focus. Never used for large fills. Its deep, slightly muted quality reads as authority rather than alarm.
- **Pressed Red** (#a82318): Hover and active state of Seal Wax Red. Slightly darker, confirms interaction without drama.

### Neutral
- **Parchment White** (#FAFAF8): The primary page background. Tinted faintly warm — never pure white, which would feel cold and clinical against the ink tones.
- **Warm Cream** (#f6f3ea): Surface layer — sidebar, form inputs, activity cards. One step richer than Parchment White, creates depth without shadows.
- **Charcoal Ink** (#3D3D3D): All body and heading text. Not black; the warmth prevents harshness against parchment backgrounds.
- **Warm Taupe** (#9a8878): Secondary text, labels, borders, muted states. The connective tissue of the palette — present everywhere, asserting nothing.
- **Faded Rose** (#c07a72): Danger and destructive actions only. A desaturated rose rather than a jarring red — keeps the palette coherent.

### Named Rules
**The Seal Rule.** Seal Wax Red appears on ≤10% of any given screen. A page heavy with red is a page that has lost its voice. When everything is accented, nothing is.

**The Warmth Rule.** No pure whites (#fff), no pure blacks (#000). Every neutral tilts toward the warm amber-brown axis of the palette. Cold grays are forbidden — they break the almanac atmosphere.

## 3. Typography

**Body Font:** Microsoft JhengHei / 微軟正黑體 (with -apple-system, BlinkMacSystemFont, sans-serif fallback)

A single humanist sans-serif stack optimized for Chinese character legibility at small sizes. No display/body split — consistency serves the tool register. The stack's warmth pairs naturally with the parchment palette.

**Character:** Clean and unpretentious, with measured letter-spacing that suggests typeset print rather than digital UI. Labels read like printed field headings in a ledger form.

### Hierarchy
- **Display** (weight 400, 25px, line-height 1.3, letter-spacing 0.06em): Section headings only. Weight 400 keeps it editorial rather than loud; the letter-spacing does the authority work. Accompanied by a 26px wine-red underbar.
- **Title** (weight 500, 16px, line-height 1.4, letter-spacing 0.05em): Modal titles, day headers. Slightly heavier to anchor overlaid content.
- **Body** (weight 400, 14px, line-height 1.65, letter-spacing 0.02em): All content text. The generous line-height (1.65) is the system's primary breathing mechanism — do not compress it.
- **Label** (weight 400, 11px, line-height 1.4, letter-spacing 0.13em): Form field labels, nav numerals, metadata. The wide tracking gives small text the presence of printed captions without requiring bold.

### Named Rules
**The Weight Restraint Rule.** Only two weights are used: 400 and 500. There is no bold (700), no heavy, no thin. Hierarchy is expressed through size and letter-spacing, not weight extremes.

**The Line-Height Rule.** Body line-height is 1.65 and is not negotiable. Compressing it to fit more content is forbidden — the breathing room is the design.

## 4. Elevation

This system is flat by default. Surfaces are layered tonally — Warm Cream sits one step above Parchment White — without shadows. Depth is a color decision, not a shadow decision.

Shadows appear only as state feedback, never as ambient decoration.

### Shadow Vocabulary
- **Ambient Lift** (`0 2px 10px rgba(61, 61, 61, 0.07)`): Applied to floating elements (dropdowns, PWA banners). Extremely subtle — the equivalent of a page slightly raised from a desk.
- **Modal Scrim** (`rgba(45, 45, 45, 0.3)` + `backdrop-filter: blur(3px)`): Modal overlay only. The blur softens the page beneath without obscuring it.

### Named Rules
**The Flat-by-Default Rule.** At rest, surfaces are flat. No card gets a shadow just for existing. Shadows are earned by state: hover, focus, or float. A shadow on a static card is clutter, not depth.

## 5. Components

### Buttons
Buttons are understated instruments, not calls to attention. Their shape is sharp (4px radius), their typography measured.

- **Shape:** Sharply cornered (4px radius) — echoes typeset precision, not rounded consumer UI.
- **Primary** (`.btn-primary`): Seal Wax Red background (#c22b1f), Parchment White text, padding 9px 20px, font-size 12px, letter-spacing 0.04em.
- **Primary Hover:** Drops to Pressed Red (#a82318), rises 1px (`translateY(-1px)`). The lift is the feedback.
- **Ghost** (`.btn-ghost`): Transparent background, Charcoal Ink text, 1px Warm Taupe border. Hover shifts border and text to Seal Wax Red. No fill on hover — this is a tool button, not a CTA.
- **Danger** (`.btn-danger`): No border, Faded Rose text (#c07a72). Background tint appears on hover only. Visually quiet until the user moves toward it.

### Cards / Containers
- **Corner Style:** 4px radius — consistent with the button vocabulary.
- **Background:** Parchment White (`--bg`) for activity items, Warm Cream (`--surface`) for sidebar and section surfaces.
- **Shadow Strategy:** None at rest. The 1px Warm Taupe border (`rgba(154,136,120,0.38)`) provides containment without elevation.
- **Border:** `1px solid rgba(154, 136, 120, 0.38)` — translucent taupe, not a hard line.
- **Internal Padding:** 11–13px vertical, 14–15px horizontal. Compact but not cramped.

### Inputs / Fields
- **Style:** Warm Cream background (`--surface`), 1px Warm Taupe border, 4px radius, 9px 12px padding.
- **Focus:** Border shifts to Seal Wax Red. Background lifts to Parchment White. No glow, no box-shadow — ink on paper.
- **Labels:** 11px, letter-spacing 0.13em (small-caps rhythm without small-caps). Warm Taupe color — present but not competing.

### Navigation
- **Style:** Sidebar list on desktop; slide-in drawer on mobile (240px, fixed). Active item: Seal Wax Red text, no background fill. Accent indicator: 22px left-edge bar (2px wide, Seal Wax Red, border-radius 0 2px 2px 0).
- **Hover:** Subtle 7% wine-red tint background — shows affordance without grabbing attention.
- **Mobile:** Full-height overlay drawer. Hamburger toggle (top-left, 38×38px) with scrim overlay behind.

### Day Timeline (Signature Component)
The itinerary timeline is the heart of the app. A vertical gradient line descends from Seal Wax Red to transparent — like ink bleeding into paper at the bottom. Each activity item hangs off this line via a dot marker. The timeline communicates temporal sequence without requiring explicit numbering.

- **Spine:** 1px vertical line, `left: 10px`, gradient from `var(--accent)` to `transparent`, 40% opacity.
- **Activity item:** Full card with 1px border, animates in with `activityIn` (opacity + translateY) on load.
- **Collapsible days:** Max-height transition with `cubic-bezier(0.4,0,0.2,1)` for a natural paper-fold feel.

## 6. Do's and Don'ts

### Do:
- **Do** use Seal Wax Red (#c22b1f) only on interactive elements, active states, and the section-title underbar. Its scarcity is its authority.
- **Do** maintain line-height 1.65 on all body text. The breathing room is the design.
- **Do** use letter-spacing 0.13em on all 11px labels — it replaces the legibility that small point sizes lose.
- **Do** keep radius at 4px uniformly. Mixing radii fragments the precision vocabulary.
- **Do** tint every neutral toward the warm amber-brown axis. #FAFAF8 and #f6f3ea, not #ffffff and #f5f5f5.
- **Do** let the tonal layering (Warm Cream on Parchment White) communicate depth before reaching for shadows.
- **Do** keep decorative elements — any British ornamental touches — to edges and punctuation. They are marginalia, not headlines.

### Don't:
- **Don't** use dark backgrounds, neon accents, or gradient-heavy surfaces. This is not a SaaS dashboard.
- **Don't** use glassmorphism, heavy blurs, or layered semi-transparent cards decoratively. The modal scrim is the one exception, and it earns that by being functional.
- **Don't** imitate the visual language of Airbnb, GetYourGuide, or consumer travel apps — imagery-forward, CTA-saturated, color-drenched layouts.
- **Don't** use full-bleed hero imagery or background patterns behind content areas. Parchment is the texture.
- **Don't** use `border-left` thicker than 1px as a colored stripe accent. The left-edge nav indicator is the one permitted use, and it is structural, not decorative.
- **Don't** use gradient text (`background-clip: text`). A single solid color.
- **Don't** use weight 700 (bold) anywhere. If something needs more presence, increase size or letter-spacing.
- **Don't** compress the sidebar with icon-only navigation on desktop. The label text is part of the almanac character — numbered, spaced, deliberate.
