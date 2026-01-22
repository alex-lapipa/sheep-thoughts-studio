import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate a simple browser fingerprint for anonymous voting
const generateFingerprint = (): string => {
  const nav = window.navigator;
  const screen = window.screen;
  const data = [
    nav.userAgent,
    nav.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join("|");
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

interface VoteRecord {
  submission_id: string;
  voter_fingerprint: string;
}

interface VoteState {
  [submissionId: string]: {
    count: number;
    hasVoted: boolean;
  };
}

export function useVoting(submissionIds: string[]) {
  const [votes, setVotes] = useState<VoteState>({});
  const [loading, setLoading] = useState(true);
  const [fingerprint, setFingerprint] = useState<string>("");

  useEffect(() => {
    setFingerprint(generateFingerprint());
  }, []);

  // Fetch vote counts and user's vote status
  useEffect(() => {
    if (!fingerprint || submissionIds.length === 0) return;

    const fetchVotes = async () => {
      setLoading(true);
      try {
        // Get all votes for these submissions using raw query to avoid type issues
        const { data: allVotes, error } = await supabase
          .from("hall_of_fame_votes" as any)
          .select("submission_id, voter_fingerprint")
          .in("submission_id", submissionIds);

        if (error) throw error;

        // Build vote state
        const newVotes: VoteState = {};
        const votesData = (allVotes as unknown as VoteRecord[]) || [];
        submissionIds.forEach((id) => {
          const submissionVotes = votesData.filter((v) => v.submission_id === id);
          newVotes[id] = {
            count: submissionVotes.length,
            hasVoted: submissionVotes.some((v) => v.voter_fingerprint === fingerprint),
          };
        });
        setVotes(newVotes);
      } catch (error) {
        console.error("Error fetching votes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, [fingerprint, submissionIds.join(",")]);

  const toggleVote = useCallback(
    async (submissionId: string) => {
      if (!fingerprint) return;

      const currentState = votes[submissionId];
      const hasVoted = currentState?.hasVoted || false;

      // Optimistic update
      setVotes((prev) => ({
        ...prev,
        [submissionId]: {
          count: (prev[submissionId]?.count || 0) + (hasVoted ? -1 : 1),
          hasVoted: !hasVoted,
        },
      }));

      try {
        if (hasVoted) {
          // Remove vote
          const { error } = await supabase
            .from("hall_of_fame_votes" as any)
            .delete()
            .eq("submission_id", submissionId)
            .eq("voter_fingerprint", fingerprint);

          if (error) throw error;
          toast.success("Vote removed");
        } else {
          // Add vote
          const { error } = await supabase
            .from("hall_of_fame_votes" as any)
            .insert({
              submission_id: submissionId,
              voter_fingerprint: fingerprint,
            });

          if (error) throw error;
          toast.success("Vote added! 🐑");
        }
      } catch (error: any) {
        // Revert optimistic update
        setVotes((prev) => ({
          ...prev,
          [submissionId]: {
            count: (prev[submissionId]?.count || 0) + (hasVoted ? 1 : -1),
            hasVoted: hasVoted,
          },
        }));
        console.error("Vote error:", error);
        toast.error("Failed to vote. Try again!");
      }
    },
    [fingerprint, votes]
  );

  const getVoteCount = (submissionId: string) => votes[submissionId]?.count || 0;
  const hasVoted = (submissionId: string) => votes[submissionId]?.hasVoted || false;

  return {
    votes,
    loading,
    toggleVote,
    getVoteCount,
    hasVoted,
  };
}
