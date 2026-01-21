import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareIndicatorProps {
  contentType?: string;
  contentId?: string;
  className?: string;
  showRecent?: boolean;
}

export function ShareIndicator({ 
  contentType, 
  contentId, 
  className,
  showRecent = true 
}: ShareIndicatorProps) {
  const [totalShares, setTotalShares] = useState(0);
  const [recentShares, setRecentShares] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        let query = supabase
          .from('share_events')
          .select('id', { count: 'exact' });
        
        if (contentType) {
          query = query.eq('content_type', contentType);
        }
        if (contentId) {
          query = query.eq('content_id', contentId);
        }

        const { count: total } = await query;

        // Get recent shares
        let recentQuery = supabase
          .from('share_events')
          .select('id', { count: 'exact' })
          .gte('created_at', yesterday.toISOString());
        
        if (contentType) {
          recentQuery = recentQuery.eq('content_type', contentType);
        }
        if (contentId) {
          recentQuery = recentQuery.eq('content_id', contentId);
        }

        const { count: recent } = await recentQuery;

        setTotalShares(total || 0);
        setRecentShares(recent || 0);
      } catch (error) {
        console.error('Failed to fetch share stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('share_events_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'share_events',
        },
        () => {
          // Increment counts on new share
          setTotalShares(prev => prev + 1);
          setRecentShares(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contentType, contentId]);

  if (isLoading || totalShares === 0) {
    return null;
  }

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className={cn(
      "flex items-center gap-3 text-xs text-muted-foreground",
      className
    )}>
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{formatCount(totalShares)} shared</span>
      </div>
      
      {showRecent && recentShares > 0 && (
        <div className="flex items-center gap-1 text-primary">
          <TrendingUp className="h-3 w-3" />
          <span>{recentShares} today</span>
        </div>
      )}
    </div>
  );
}
