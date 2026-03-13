import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Unified client-side hook for all Bubbles AI capabilities.
 * Routes everything through the bubbles-orchestrator edge function.
 */

interface ExplainResponse {
  explanation: string;
  confidence: string;
  source: string;
}

interface AnswerResponse {
  answer: string;
  ragContextUsed: boolean;
}

interface ChallengeResponse {
  response: string;
  confidence: string;
  innerThought?: string;
  mode: string;
  isMaxEscalation: boolean;
}

interface GenerateResponse {
  success: boolean;
  data: any;
}

interface ChallengeParams {
  originalQuestion: string;
  originalAnswer: string;
  challenge: string;
  currentMode: string | null;
  conversationHistory: any[];
}

interface GenerateParams {
  type: "thoughts" | "scenario" | "product";
  mode?: string;
  count?: number;
  context?: string;
  triggerCategory?: string;
}

export function useBubblesOrchestrator() {
  const invoke = useCallback(async (capability: string, body: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke("bubbles-orchestrator", {
      body: { capability, ...body },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  }, []);

  const explain = useCallback(
    async (question: string): Promise<ExplainResponse> => {
      return invoke("explain", { question });
    },
    [invoke]
  );

  const answer = useCallback(
    async (question: string): Promise<AnswerResponse> => {
      return invoke("answer", { question });
    },
    [invoke]
  );

  const challenge = useCallback(
    async (params: ChallengeParams): Promise<ChallengeResponse> => {
      return invoke("challenge", params);
    },
    [invoke]
  );

  const generate = useCallback(
    async (params: GenerateParams): Promise<GenerateResponse> => {
      return invoke("generate", params);
    },
    [invoke]
  );

  /**
   * Streaming chat — returns a ReadableStream.
   * Use with SSE parsing for token-by-token rendering.
   */
  const chatStream = useCallback(
    async (messages: { role: string; content: string }[]): Promise<ReadableStream | null> => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bubbles-orchestrator`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ capability: "chat", messages }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Stream failed" }));
        throw new Error(err.error || `Stream error: ${response.status}`);
      }

      return response.body;
    },
    []
  );

  return { explain, answer, challenge, generate, chatStream };
}
