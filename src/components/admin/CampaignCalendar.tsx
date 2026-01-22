import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronLeft, ChevronRight, Clock, Send, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  subject: string;
  preview_text: string | null;
  html_content: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  recipient_count: number;
  delivered_count: number;
  failed_count: number;
}

interface CampaignCalendarProps {
  campaigns: Campaign[];
  onCampaignClick?: (campaign: Campaign) => void;
}

export function CampaignCalendar({ campaigns, onCampaignClick }: CampaignCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = monthStart.getDay();
  
  // Create padding for days before month starts (to align with weekday columns)
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => null);

  // Group campaigns by date
  const campaignsByDate = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    
    campaigns.forEach((campaign) => {
      // Use scheduled_at for scheduled campaigns, sent_at for sent ones
      let dateStr: string | null = null;
      
      if (campaign.status === "scheduled" && campaign.scheduled_at) {
        dateStr = format(parseISO(campaign.scheduled_at), "yyyy-MM-dd");
      } else if (campaign.status === "sent" && campaign.sent_at) {
        dateStr = format(parseISO(campaign.sent_at), "yyyy-MM-dd");
      } else if (campaign.status === "sending" && campaign.scheduled_at) {
        dateStr = format(parseISO(campaign.scheduled_at), "yyyy-MM-dd");
      }
      
      if (dateStr) {
        const existing = map.get(dateStr) || [];
        existing.push(campaign);
        map.set(dateStr, existing);
      }
    });
    
    return map;
  }, [campaigns]);

  const getCampaignsForDay = (day: Date): Campaign[] => {
    const dateStr = format(day, "yyyy-MM-dd");
    return campaignsByDate.get(dateStr) || [];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "sending":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "sent":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-3 w-3" />;
      case "sending":
      case "sent":
        return <Send className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Get upcoming campaigns for sidebar
  const upcomingCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns
      .filter(c => c.status === "scheduled" && c.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .slice(0, 5);
  }, [campaigns]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Calendar */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {format(currentMonth, "MMMM yyyy")}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Padding for days before month starts */}
            {paddingDays.map((_, index) => (
              <div key={`pad-${index}`} className="min-h-[100px] bg-muted/30 rounded-lg" />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const dayCampaigns = getCampaignsForDay(day);
              const hasScheduled = dayCampaigns.some(c => c.status === "scheduled");
              const hasSent = dayCampaigns.some(c => c.status === "sent");

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[100px] p-1.5 rounded-lg border transition-colors",
                    isToday(day)
                      ? "bg-primary/5 border-primary/30"
                      : "bg-card border-border/50 hover:border-border",
                    !isSameMonth(day, currentMonth) && "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1">
                    <TooltipProvider>
                      {dayCampaigns.slice(0, 3).map((campaign) => (
                        <Tooltip key={campaign.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onCampaignClick?.(campaign)}
                              className={cn(
                                "w-full text-left text-xs px-1.5 py-1 rounded border truncate flex items-center gap-1",
                                getStatusColor(campaign.status),
                                "hover:opacity-80 transition-opacity cursor-pointer"
                              )}
                            >
                              {getStatusIcon(campaign.status)}
                              <span className="truncate">{campaign.subject}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-medium">{campaign.subject}</p>
                              {campaign.preview_text && (
                                <p className="text-xs text-muted-foreground">
                                  {campaign.preview_text}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className={cn("text-xs", getStatusColor(campaign.status))}>
                                  {campaign.status}
                                </Badge>
                                {campaign.scheduled_at && (
                                  <span className="text-muted-foreground">
                                    {format(parseISO(campaign.scheduled_at), "h:mm a")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                    
                    {dayCampaigns.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayCampaigns.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Legend:</span>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", "bg-amber-500/50")} />
              <span className="text-xs text-muted-foreground">Scheduled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", "bg-blue-500/50")} />
              <span className="text-xs text-muted-foreground">Sending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-3 h-3 rounded", "bg-emerald-500/50")} />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Campaigns Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingCampaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No scheduled campaigns
            </p>
          ) : (
            upcomingCampaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => onCampaignClick?.(campaign)}
                className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <p className="font-medium text-sm truncate">{campaign.subject}</p>
                {campaign.scheduled_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(parseISO(campaign.scheduled_at), "EEE, MMM d 'at' h:mm a")}
                  </p>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
