

# Voice-Only Bubbles Agent with Animated Character Card

## What We're Building

Transform the "Call" tab experience from a generic card UI into an immersive voice-only interface centered on the Bubbles hero image in a floating glassmorphism card. No text transcripts, no chat — just Bubbles breathing, pulsing, and responding visually to the conversation state.

## Changes

### 1. New Component: `BubblesVoiceAgent.tsx`

Replaces the current `BubblesConversation` rendering in the Call tab. A dedicated voice-only agent component featuring:

- **Floating glassmorphism card** with backdrop blur, gradient borders, parallax-responsive glow orbs (matching the existing style from `BubblesVoiceChat`)
- **Bubbles hero image as the centerpiece** using `BubblesHeroImage` — large, centered, with three animated states:
  - **Idle/disconnected**: Static with subtle float
  - **Listening**: Gentle breathing scale animation (1.0 → 1.02), soft green glow ring
  - **Speaking**: Rhythmic expand/contract pulse (1.0 → 1.06 → 0.97), accent-colored glow ring intensifies, shadow grows — driven by `conversation.isSpeaking`
- **No text input, no transcript display** — pure voice-to-voice
- **Single call button** below Bubbles: "Call Bubbles" / "End Call"
- **Mode badge** (innocent/triggered/savage) overlaid on the card
- **Volume control** as a small popover
- **Tool action toasts** continue working (navigate, products, etc.)
- **Parallax mouse-tracking** on the glow effects behind the card (using `onMouseMove` for subtle depth)

### 2. Speaking Animation Detail

Using framer-motion `animate` driven by `conversation.isSpeaking`:

```text
Speaking:
  scale: [1, 1.06, 0.97, 1.03, 1]  (breathing rhythm, ~1.5s loop)
  filter: drop-shadow grows from 2xl to a bright accent glow
  glow ring: opacity pulses from 0.3 → 0.8

Listening:
  scale: [1, 1.02, 1]  (calm breath, ~3s loop)
  glow ring: steady soft green at 0.3 opacity

Disconnected:
  scale: 1 (static)
  subtle y float: [0, -4, 0] over 6s (existing behavior)
```

### 3. Update TalkToBubbles Page

- Keep both tabs (Chat / Call)
- Replace `<BubblesConversation />` in the Call tab with the new `<BubblesVoiceAgent />`
- All existing client tools, agent overrides, token flow, mode detection stay intact — moved into the new component

### 4. Wire to Orchestrator

The ElevenLabs agent prompt already references the Bubbles persona. The `BUBBLES_SYSTEM_PROMPT` in the overrides will import from the shared persona module (`_shared/bubbles-persona.ts`) for consistency with the orchestrator, using `buildSystemPrompt({ capability: 'voice-agent' })`.

### Files

| Action | File |
|--------|------|
| Create | `src/components/BubblesVoiceAgent.tsx` |
| Edit | `src/pages/TalkToBubbles.tsx` (swap component in Call tab) |

### Technical Notes

- Reuses `useConversation` from `@elevenlabs/react` — same WebRTC flow
- All existing client tools (`navigateTo`, `showProduct`, `showCollection`, `triggerSavageMode`, `channelMentor`, etc.) preserved
- `BubblesHeroImage` used at `xl` size inside the card, `flipped` prop for facing left
- framer-motion `animate` prop switches between variants based on `conversation.isSpeaking` and `conversation.status`
- Mouse-tracking parallax on glow orbs via `onMouseMove` handler (transform translate based on cursor position relative to card center)
- No database changes, no new edge functions

