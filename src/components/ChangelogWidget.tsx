import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Rss } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChangelogEntry {
  id: string;
  title: string;
  description: string;
  category: string;
  published_at: string | null;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  feature: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  improvement: { bg: "bg-sky-500/10", text: "text-sky-600 dark:text-sky-400" },
  fix: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  announcement: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400" },
};

export function ChangelogWidget() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestChanges() {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("id, title, description, category, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);

      if (!error && data) {
        setEntries(data);
      }
      setLoading(false);
    }

    fetchLatestChanges();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4 text-accent" />
            What's New
          </CardTitle>
          <div className="flex items-center gap-2">
            <a
              href="https://exdpmwoucahnfbgpzmzr.supabase.co/functions/v1/changelog-rss"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="RSS Feed"
            >
              <Rss className="h-4 w-4" />
            </a>
            <Link
              to="/whats-new"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {entries.map((entry) => {
          const style = CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.feature;
          return (
            <Link
              key={entry.id}
              to="/whats-new"
              className="block p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-medium text-sm group-hover:text-accent transition-colors line-clamp-1">
                  {entry.title}
                </h4>
                <Badge variant="secondary" className={`${style.bg} ${style.text} text-[10px] shrink-0`}>
                  {entry.category}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                {entry.description}
              </p>
              {entry.published_at && (
                <span className="text-[10px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(entry.published_at), { addSuffix: true })}
                </span>
              )}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
