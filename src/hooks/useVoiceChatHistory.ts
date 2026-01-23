import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "bubbles-voice-chat-session";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  created_at?: string;
}

interface VoiceChatSession {
  sessionId: string;
  createdAt: string;
  messageCount: number;
  lastMessage: string;
}

const getOrCreateSessionId = (): string => {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Use existing session if less than 24 hours old
      const createdAt = new Date(parsed.createdAt);
      const now = new Date();
      const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursDiff < 24) {
        return parsed.sessionId;
      }
    }
  } catch (e) {
    console.warn("Failed to load session:", e);
  }
  
  // Create new session
  const newSessionId = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    sessionId: newSessionId,
    createdAt: new Date().toISOString()
  }));
  return newSessionId;
};

export const useVoiceChatHistory = () => {
  const [sessionId] = useState(getOrCreateSessionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<VoiceChatSession[]>([]);

  // Load messages for current session
  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("voice_chat_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMessages(
        (data || []).map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          mode: msg.mode || undefined,
          created_at: msg.created_at,
        }))
      );
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Load previous sessions for history view
  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("voice_chat_history")
        .select("session_id, created_at, content")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by session
      const sessionMap = new Map<string, VoiceChatSession>();
      (data || []).forEach((msg) => {
        const existing = sessionMap.get(msg.session_id);
        if (!existing) {
          sessionMap.set(msg.session_id, {
            sessionId: msg.session_id,
            createdAt: msg.created_at,
            messageCount: 1,
            lastMessage: msg.content,
          });
        } else {
          existing.messageCount++;
        }
      });

      setSessions(Array.from(sessionMap.values()).slice(0, 10));
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  }, []);

  // Save a message to database
  const saveMessage = useCallback(
    async (message: Omit<Message, "id" | "created_at">) => {
      try {
        const { data, error } = await supabase
          .from("voice_chat_history")
          .insert({
            session_id: sessionId,
            role: message.role,
            content: message.content,
            mode: message.mode || null,
          })
          .select()
          .single();

        if (error) throw error;

        const savedMessage: Message = {
          id: data.id,
          role: data.role as "user" | "assistant",
          content: data.content,
          mode: data.mode || undefined,
          created_at: data.created_at,
        };

        setMessages((prev) => [...prev, savedMessage]);
        return savedMessage;
      } catch (error) {
        console.error("Failed to save message:", error);
        // Return a local message as fallback
        const localMessage: Message = {
          id: crypto.randomUUID(),
          ...message,
        };
        setMessages((prev) => [...prev, localMessage]);
        return localMessage;
      }
    },
    [sessionId]
  );

  // Start a new conversation session
  const startNewSession = useCallback(() => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      sessionId: newSessionId,
      createdAt: new Date().toISOString()
    }));
    setMessages([]);
    // Force reload to use new session
    window.location.reload();
  }, []);

  // Load a specific session's messages
  const loadSession = useCallback(async (targetSessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("voice_chat_history")
        .select("*")
        .eq("session_id", targetSessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        mode: msg.mode || undefined,
        created_at: msg.created_at,
      }));
    } catch (error) {
      console.error("Failed to load session:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMessages();
    loadSessions();
  }, [loadMessages, loadSessions]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel(`voice-chat-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "voice_chat_history",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            role: string;
            content: string;
            mode: string | null;
            created_at: string;
          };
          // Only add if not already present
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                role: newMsg.role as "user" | "assistant",
                content: newMsg.content,
                mode: newMsg.mode || undefined,
                created_at: newMsg.created_at,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return {
    sessionId,
    messages,
    isLoading,
    sessions,
    saveMessage,
    startNewSession,
    loadSession,
    loadSessions,
  };
};
