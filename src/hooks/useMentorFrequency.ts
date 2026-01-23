import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, endOfDay } from "date-fns";

export interface MentorFrequency {
  mentor_id: string;
  mentor_name: string;
  trigger_count: number;
  avg_confidence: number;
  percentage: number;
}

export function useMentorFrequency(days: number = 30) {
  const dateRange = { from: subDays(new Date(), days), to: new Date() };

  return useQuery({
    queryKey: ["mentor-frequency", days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_trigger_events")
        .select("mentor_id, mentor_name, confidence_score")
        .gte("created_at", startOfDay(dateRange.from).toISOString())
        .lte("created_at", endOfDay(dateRange.to).toISOString());

      if (error) throw error;

      // Aggregate by mentor
      const stats: Record<string, MentorFrequency> = {};
      let total = 0;

      (data || []).forEach((event) => {
        if (!stats[event.mentor_id]) {
          stats[event.mentor_id] = {
            mentor_id: event.mentor_id,
            mentor_name: event.mentor_name,
            trigger_count: 0,
            avg_confidence: 0,
            percentage: 0,
          };
        }
        stats[event.mentor_id].trigger_count++;
        stats[event.mentor_id].avg_confidence += Number(event.confidence_score) || 0;
        total++;
      });

      // Calculate averages and percentages
      Object.values(stats).forEach((s) => {
        s.avg_confidence = s.trigger_count > 0 ? s.avg_confidence / s.trigger_count : 0;
        s.percentage = total > 0 ? (s.trigger_count / total) * 100 : 0;
      });

      return {
        stats: Object.values(stats).sort((a, b) => b.trigger_count - a.trigger_count),
        total,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
