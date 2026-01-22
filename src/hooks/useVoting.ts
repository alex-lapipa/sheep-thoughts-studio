import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const FIRST_VOTE_KEY = "bubbles-first-vote-celebrated";
const MILESTONE_THRESHOLDS = [10, 50, 100] as const;

// Fire celebratory confetti for first vote
const fireFirstVoteConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15', '#a78bfa'],
  });
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15'],
    });
  }, 150);
  
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#4ade80', '#60a5fa', '#f472b6', '#facc15'],
    });
  }, 300);
};

// Fire epic milestone confetti with escalating intensity
const fireMilestoneConfetti = (milestone: number) => {
  const intensity = milestone === 100 ? 3 : milestone === 50 ? 2 : 1;
  const colors = milestone === 100 
    ? ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#fef3c7'] // Gold nuclear
    : milestone === 50 
    ? ['#f472b6', '#ec4899', '#db2777', '#a78bfa', '#8b5cf6'] // Pink savage
    : ['#4ade80', '#22c55e', '#16a34a', '#60a5fa', '#3b82f6']; // Green/blue triggered

  // Initial burst
  confetti({
    particleCount: 50 * intensity,
    spread: 100,
    origin: { y: 0.5, x: 0.5 },
    colors,
    startVelocity: 45,
    gravity: 0.8,
  });

  // Side cannons
  for (let i = 0; i < intensity; i++) {
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.6 },
        colors,
        startVelocity: 40,
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.6 },
        colors,
        startVelocity: 40,
      });
    }, 200 * (i + 1));
  }

  // Stars/sparkles for 100 milestone
  if (milestone === 100) {
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 180,
        origin: { y: 0.4 },
        colors: ['#fbbf24', '#ffffff'],
        shapes: ['star'],
        scalar: 1.5,
        gravity: 0.5,
      });
    }, 400);
  }
};

// Check if vote crosses a milestone threshold
const checkMilestone = (oldCount: number, newCount: number): number | null => {
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (oldCount < threshold && newCount >= threshold) {
      return threshold;
    }
  }
  return null;
};

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
          
          const oldCount = currentState?.count || 0;
          const newCount = oldCount + 1;
          
          // Check for milestone celebrations
          const milestone = checkMilestone(oldCount, newCount);
          if (milestone) {
            fireMilestoneConfetti(milestone);
            const milestoneEmoji = milestone === 100 ? '☢️' : milestone === 50 ? '💅' : '🔥';
            toast.success(`${milestoneEmoji} ${milestone} votes! This meltdown is legendary!`);
          } else {
            // Check if this is their first vote ever
            const hasVotedBefore = localStorage.getItem(FIRST_VOTE_KEY);
            if (!hasVotedBefore) {
              localStorage.setItem(FIRST_VOTE_KEY, "true");
              fireFirstVoteConfetti();
              toast.success("🎉 Your first vote! Welcome to the flock!");
            } else {
              toast.success("Vote added! 🐑");
            }
          }
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
