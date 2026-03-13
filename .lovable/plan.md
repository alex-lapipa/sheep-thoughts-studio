

# Bubbles Master Orchestrator Agent

## The Problem

The project has **8+ independent AI edge functions** that each maintain their own system prompts, RAG integrations, and character logic:

- `bubbles-chat` — Text chat (Gemini, RAG-powered)
- `bubbles-voice-chat` — Voice chat (Grok, RAG-powered)
- `bubbles-explain` — Explains topics wrong (Lovable AI)
- `bubbles-answer` — Q&A with spam filtering (Lovable AI)
- `bubbles-challenge` — Escalation system (Lovable AI)
- `bubbles-generate` — Content generation (Lovable AI)
- `store-ops-agent` — Store operations (Shopify health checks, RAG)
- `elevenlabs-conversation-token` — ElevenLabs voice agent token
- `BubblesConversation.tsx` — Contains its own duplicate system prompt

Each has a copy-pasted or divergent version of the Bubbles personality. There's no shared prompt, no unified routing, and no central coordination.

## The Plan

### 1. Create a shared character prompt module

**File:** `supabase/functions/_shared/bubbles-persona.ts`

A single source of truth for the Bubbles character prompt, mode system, voice rules, and Irish cadence. All edge functions import from here instead of maintaining local copies.

Contains:
- `BUBBLES_CORE_PERSONA` — personality, modes, triggers, writing rules
- `BUBBLES_IRISH_VOICE` — speech patterns, Wicklow specifics, storytelling style  
- `BUBBLES_ORIGIN_STORY` — Alex, Anthony, Jimmy, Peggy, Carmel backstory
- `BUBBLES_ANTHONYS_WISDOM` — philosopher quotes and delivery
- `buildSystemPrompt(config)` — assembles the right prompt for each capability

### 2. Create the master orchestrator edge function

**File:** `supabase/functions/bubbles-orchestrator/index.ts`

A single entry point that routes to the correct capability based on the request:

```text
Client Request
    │
    ▼
┌──────────────────────┐
│  bubbles-orchestrator │
│                      │
│  ├─ intent detection │
│  ├─ shared RAG fetch │
│  ├─ persona assembly │
│  └─ route to handler │
└──────┬───────────────┘
       │
       ├─► chat handler (streaming text conversation)
       ├─► explain handler (wrong explanations)
       ├─► challenge handler (escalation system)
       ├─► generate handler (content generation)
       ├─► answer handler (Q&A)
       └─► ops handler (store operations, admin only)
```

**Capabilities:**
- `chat` — multi-turn streaming conversation with RAG context
- `explain` — single-shot wrong explanation
- `challenge` — escalation mode responses  
- `generate` — thought bubbles, scenarios, product copy
- `answer` — Q&A with spam filtering
- `ops` — store operations (delegates to existing store-ops-agent logic)

**Shared services within the orchestrator:**
- Unified RAG context fetcher (embeddings + knowledge base queries)
- Single embedding generation helper
- Centralized spam detection
- Consistent error handling and rate limit responses

### 3. Create a client-side orchestrator hook

**File:** `src/hooks/useBubblesOrchestrator.ts`

Replaces direct `supabase.functions.invoke('bubbles-*')` calls across the codebase with a unified interface:

```typescript
const { chat, explain, challenge, generate, answer } = useBubblesOrchestrator();
```

### 4. Update all consumer components

Refactor these components to use the new hook:
- `AskBubbles.tsx` — uses `explain` capability
- `ChallengeBubbles.tsx` — uses `challenge` capability
- `BubblesVoiceChat.tsx` — uses `chat` capability (voice path stays separate for streaming)
- `AnimatedBubblesExplainsWidget.tsx` — uses `explain` capability
- `BubblesConversation.tsx` — ElevenLabs agent stays separate (it's a WebRTC connection, not our edge function)
- Admin Generate page — uses `generate` capability

### 5. Remove duplicate system prompts

Delete the inline `BUBBLES_SYSTEM_PROMPT` from:
- `bubbles-chat/index.ts` (252 lines, ~80 lines of prompt)
- `bubbles-voice-chat/index.ts` (626 lines, ~200 lines of prompt)
- `BubblesConversation.tsx` (client-side prompt for ElevenLabs overrides)

All now import from `_shared/bubbles-persona.ts`.

### 6. Keep existing edge functions as thin wrappers (backward compatibility)

The existing `bubbles-chat`, `bubbles-explain`, etc. functions remain deployed but become thin redirects to the orchestrator. This prevents breaking any external integrations or cached URLs.

## What stays separate (and why)

- **ElevenLabs Conversational Agent** (`BubblesConversation.tsx`) — this is a WebRTC connection to ElevenLabs' servers, not our edge function. The system prompt lives in ElevenLabs dashboard. We only provide a token.
- **Store Ops Agent** — remains its own edge function for Shopify API calls, but the RAG/chat portion routes through the orchestrator's shared context.
- **OG image generators** — static image rendering, no AI personality needed.
- **Newsletter/email functions** — infrastructure, not character-driven.

## Technical Details

- The orchestrator uses the Lovable AI gateway (`ai.gateway.lovable.dev`) with `google/gemini-3-flash-preview` for most capabilities and streaming for chat
- RAG context is fetched once per request using the shared embedding helper, then injected into the assembled prompt
- The `_shared/` directory pattern is the Deno standard for shared code across edge functions
- No database changes required — all existing tables (bubbles_knowledge, bubbles_thoughts, bubbles_rag_content, bubbles_triggers) continue to be queried the same way
- No new secrets needed

## Files Changed

| Action | File |
|--------|------|
| Create | `supabase/functions/_shared/bubbles-persona.ts` |
| Create | `supabase/functions/bubbles-orchestrator/index.ts` |
| Create | `src/hooks/useBubblesOrchestrator.ts` |
| Edit | `supabase/functions/bubbles-chat/index.ts` (thin wrapper) |
| Edit | `supabase/functions/bubbles-explain/index.ts` (thin wrapper) |
| Edit | `supabase/functions/bubbles-answer/index.ts` (thin wrapper) |
| Edit | `supabase/functions/bubbles-challenge/index.ts` (thin wrapper) |
| Edit | `supabase/functions/bubbles-generate/index.ts` (thin wrapper) |
| Edit | `supabase/functions/bubbles-voice-chat/index.ts` (import shared persona) |
| Edit | `src/components/AskBubbles.tsx` (use orchestrator hook) |
| Edit | `src/components/ChallengeBubbles.tsx` (use orchestrator hook) |
| Edit | `src/components/AnimatedBubblesExplainsWidget.tsx` (use orchestrator hook) |

