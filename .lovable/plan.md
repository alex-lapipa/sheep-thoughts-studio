

# Floating Bubbles Voice Agent FAB

## What We're Building

A persistent floating action button (FAB) in the bottom-right corner of every page — Bubbles' head as a colorized version of the stencil, with a heartbeat pulse animation and radiating sound waves. Pressing it opens the full `BubblesVoiceAgent` in a floating overlay panel. The FAB lives at the App level so it's always available.

## Changes

### 1. Create colorized Bubbles head component: `BubblesFloatingHead.tsx`

A small circular component that:
- Uses the existing `bubbles-hero-stencil.png` but applies CSS filters to colorize it (hue-rotate + saturate + brightness to give it a vibrant teal/green tint — matching the brand accent)
- Clips to a circle showing just Bubbles' head area using `object-position: top` and `overflow: hidden` on a rounded-full container
- Has a continuous **heartbeat** scale animation: `scale: [1, 1.08, 1, 1.12, 1]` over ~1.5s, looping
- Radiating **pulse wave rings** behind it — 2-3 concentric circles that expand outward and fade (using framer-motion or CSS keyframes), like sonar/sound waves
- Glows with a soft accent-colored box-shadow that pulses in sync with the heartbeat

### 2. Create floating overlay wrapper: `BubblesFloatingWidget.tsx`

The persistent widget that renders on every page:
- **Collapsed state**: Just the `BubblesFloatingHead` FAB — fixed bottom-right (`bottom-6 right-6`), z-50
- **Expanded state**: The full `BubblesVoiceAgent` component slides up from the FAB position in a floating card (rounded, shadowed, glassmorphism), roughly 400px wide by 500px tall, anchored to bottom-right
- A small X button to collapse back to FAB
- When a call is active (connected), the FAB pulse waves change color to indicate live status
- AnimatePresence for smooth expand/collapse transitions

### 3. Add to App.tsx

Render `<BubblesFloatingWidget />` alongside `<CookieConsent />` and `<DevToolsPanel />` — always present, outside routes.

### 4. Hide on /talk page

Since `/talk` already has its own dedicated voice agent tab, hide the floating widget when the user is on that page to avoid duplication.

## Files

| Action | File |
|--------|------|
| Create | `src/components/BubblesFloatingHead.tsx` |
| Create | `src/components/BubblesFloatingWidget.tsx` |
| Edit | `src/App.tsx` (add the floating widget) |

## Technical Notes

- The stencil colorization uses CSS `filter: brightness(1.2) sepia(1) hue-rotate(120deg) saturate(2.5)` to transform the black-and-white stencil into a vibrant colored version — no new asset needed
- Pulse wave rings: 2-3 absolutely-positioned divs with `border` that scale from 1→2.5 while opacity fades 0.6→0, staggered by 0.5s
- The `BubblesVoiceAgent` component is reused as-is inside the expanded panel
- No new edge functions or database changes

