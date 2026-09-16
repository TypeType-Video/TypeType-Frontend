---
name: TypeType
description: The existing neutral library and settings interface, extracted from clean upstream main.
colors:
  app: "oklch(14.1% 0.005 285.823)"
  surface: "oklch(21% 0.006 285.885)"
  surface-strong: "oklch(27.4% 0.006 286.033)"
  surface-soft: "oklch(37% 0.013 285.805)"
  fg: "oklch(96.7% 0.001 286.375)"
  fg-strong: "oklch(98.5% 0 0)"
  fg-muted: "oklch(70.5% 0.015 286.067)"
  border: "oklch(27.4% 0.006 286.033)"
  border-strong: "oklch(37% 0.013 285.805)"
  accent: "oklch(70.7% 0.165 254.624)"
  danger: "oklch(70.4% 0.191 22.216)"
typography:
  title:
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "32px"
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'"
    fontSize: "14px"
    lineHeight: "20px"
  label:
    fontSize: "12px"
    fontWeight: 500
    lineHeight: "16px"
rounded:
  square: "0px"
  avatar: "50%"
spacing:
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
components:
  button-primary:
    backgroundColor: "{colors.fg}"
    textColor: "{colors.app}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
  button-primary-hover:
    backgroundColor: "{colors.fg-strong}"
  button-secondary:
    textColor: "{colors.fg-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
  input:
    backgroundColor: "{colors.app}"
    textColor: "{colors.fg}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
  group-filter-selected:
    backgroundColor: "{colors.surface-strong}"
    textColor: "{colors.fg}"
    rounded: "{rounded.square}"
  membership-chip:
    textColor: "{colors.fg-muted}"
    rounded: "{rounded.square}"
  management-panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.square}"
---

# Design System: TypeType

## Overview

**Direction: TypeType's existing library and settings.** Preserve the application's restrained neutral surfaces, compact system typography, thin borders and recognizable channel identities. Derive new management controls from the closest existing workflow.

Extracted on 2026-09-16 from a separate, unmodified source snapshot of upstream `main` at [`0f3c37c`](https://github.com/TypeType-Video/TypeType-Frontend/tree/0f3c37c794a1a296032068ee2e13b6238b0b5495). Channels, Settings and the committed group prototype were inspected in the browser; the prototype was checked in both themes. Upstream's default branch is `dev`; this audit deliberately used `main` as requested.

**Key characteristics:**

- Neutral tonal hierarchy, with color reserved for state and feedback.
- Compact system text, ordinary icons and circular channel avatars.
- Flat, bordered management surfaces and square group controls.
- Context-specific shapes elsewhere; the application has no universal corner radius.

This records the incumbent system, not a new visual identity. [PRODUCT.md](PRODUCT.md) describes the product; the [manager brief](docs/subscription-groups-ux.md) owns that page's density and behavior.

## Colors

The frontmatter samples the default dark theme. [theme.css](apps/web/src/styles/theme.css) remains the runtime authority: semantic colors reference Tailwind zinc, blue and red primitives. Light mode remaps the zinc primitives. Use semantic classes so both themes inherit correctly; do not copy these sampled values into components.

| Role | Established use |
| --- | --- |
| `app` | Page canvas and inset input fields. |
| `surface` | Group panels and ordinary list rows. |
| `surface-strong`, `surface-soft` | Selection, hover and stronger tonal separation. |
| `fg`, `fg-strong` | Main text and foreground-filled primary actions; `app` is their contrasting text. |
| `fg-muted` | Secondary actions, counts, membership labels and supporting text. |
| `border`, `border-strong` | Panel dividers and stronger chip/popover edges. |
| `accent` | Blue focus and selection indicators; existing settings navigation markers. |
| `danger` | Red destructive actions and error feedback. |

In light mode, the canvas becomes near-white, surfaces pale gray and foreground dark charcoal. Preserve the same role hierarchy. The primary action in the group prototype uses foreground fill rather than accent fill.

## Typography

Use the existing system font stack throughout. The subscription title is semibold with tight tracking; settings titles use the same size with bold weight. Channel names and normal fields use body size; compact controls and counts use label size. The prototype's small membership labels are 11 px; 12 px is already used for its controls.

Avoid adding a display font, oversized heading or decorative uppercase treatment to a routine management view. Prototype-only step labels and presentation copy do not establish requirements for production pages.

## Layout

The app shell uses a 56 px top bar, a 192 px desktop sidebar (56 px collapsed) and page padding of 12 px, increasing to 16 px on desktop. Content uses a small 4 px-based spacing rhythm.

Settings use a 228 px navigation column beside a flexible body, divided by a thin rule. The clean group prototype uses a 248 px group column beside a flexible channel list, switching to columns at 1024 px. These are references for relationships, not a single mandatory width for every screen.

Keep related inputs and actions close, leave room for long channel/group names, and use dividers to structure repeated rows. The manager's user-approved compact dimensions and viewport pagination belong in its brief.

## Elevation & Depth

Library and settings surfaces are flat at rest: borders and surface tones supply separation. The clean prototype has no resting panel or button shadows. Its group popover uses an elevated shadow; some unrelated modals and media controls also use shadows. Do not add decorative elevation to management panels.

## Shapes

The closest reference for group management is [subscription-groups-preview.tsx](apps/web/src/components/subscription-groups-preview.tsx), already present unchanged in the audited `main`. Its panels, buttons, fields, group choices and membership chips all have square corners. Subscription tabs and settings navigation are also square.

The wider app is mixed: channel avatars are circular; channel hover targets have 16 px rounding; global search, some playlist controls and modals use rounded corners. Those treatments belong to their own components. They do not justify rounding an entire group-management workflow.

## Components

| Component | Treatment and states |
| --- | --- |
| Primary action | Foreground fill, app-colored text, square silhouette and compact medium-weight label. Hover strengthens the foreground fill. |
| Secondary action | Thin neutral border, muted text, square silhouette. Hover strengthens text and may add a neutral surface. Disabled controls are visibly subdued. |
| Search / text field | App-colored inset, thin neutral border, square corners and inherited text. Preserve a visible keyboard focus indicator. |
| Group filter | Muted inactive text. Selected group gets a foreground outline, foreground text and stronger surface. Keep the selected state distinct from hover. |
| Membership chip | Small square bordered label with muted text. An editable chip can expose a remove icon; ordinary membership labels are not buttons. |
| Management panel | Square border and neutral surface, without a resting shadow. Channel rows use separators and stronger fill for selection. |
| Subscription tab | Underline navigation, foreground active label, muted inactive labels. Reuse the existing header rather than introducing a new tab shape. |
| Channel identity | Reuse `ChannelAvatar` and `ChannelRouteLink`; retain circular avatars and existing link behavior. |

[SectionShell](apps/web/src/components/section-shell.tsx), [SubscriptionsHeader](apps/web/src/components/subscriptions-header.tsx), and the clean group prototype establish the relevant relationships. Lucide remains the action-icon library. Color transitions are brief and functional; controls do not need decorative motion.

## Do's and Don'ts

- Do use the semantic theme roles and check both light and dark themes.
- Do choose references from the same workflow before borrowing isolated controls from admin or media pages.
- Do keep management controls square, with thin borders and visible keyboard focus.
- Do preserve existing channel identity, icons and navigation patterns.
- Don't introduce a new font, palette, shadow or blanket corner radius for group management.
- Don't remove legitimate rounded media controls or circular avatars elsewhere.
- Don't promote a prototype's presentation scaffolding or one page's density into a global design rule.
