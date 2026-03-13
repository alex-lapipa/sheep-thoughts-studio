

# Deploy ElevenLabs Conversational AI Agent

## Current State

The `BubblesConversation` component currently requires the user to manually enter an Agent ID before starting a conversation. The agent ID field is shown when disconnected, adding friction.

## Plan

### 1. Hardcode the Agent ID

Replace the manual `agentId` state and input field in `BubblesConversation.tsx` with the provided agent ID: `agent_0801kkm8f4q6f4yty4mfhezfr894`.

- Remove the `agentId` state variable and text input
- Hardcode `const BUBBLES_AGENT_ID = "agent_0801kkm8f4q6f4yty4mfhezfr894"` as a constant
- Update `startConversation` to use this constant directly (remove the empty-check guard)
- Update the edge function call to pass this constant

### 2. Update the edge function token request

The existing `elevenlabs-conversation-token` edge function already accepts `agentId` in the request body — no changes needed there.

### 3. Simplify the disconnected UI

Remove the Agent ID input section and settings popover. Replace with a simple "Call Bubbles" button that immediately requests mic permission and connects.

### Technical Details

- File changed: `src/components/BubblesConversation.tsx`
- No new dependencies (already has `@elevenlabs/react`)
- No database changes
- No edge function changes
- The agent is public-facing but we use the token flow (server-side) for security since `ELEVENLABS_API_KEY` is already configured as a secret

