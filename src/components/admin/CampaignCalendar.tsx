import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isToday, 
  parseISO,
  getHours,
  setHours,
  isSameHour,
  isWithinInterval
} from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ChevronLeft, ChevronRight, Clock, Send, CalendarDays, LayoutGrid, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "./CountdownTimer";

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

type ViewMode = "month" | "week";

export function CampaignCalendar({ campaigns, onCampaignClick }: CampaignCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // Month view calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => null);

  // Week view calculations
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Group campaigns by date
  const campaignsByDate = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    
    campaigns.forEach((campaign) => {
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

  // Group campaigns by hour for week view
  const campaignsByHour = useMemo(() => {
    const map = new Map<string, Campaign[]>();
    
    campaigns.forEach((campaign) => {
      let dateTime: Date | null = null;
      
      if (campaign.status === "scheduled" && campaign.scheduled_at) {
        dateTime = parseISO(campaign.scheduled_at);
      } else if (campaign.status === "sent" && campaign.sent_at) {
        dateTime = parseISO(campaign.sent_at);
      } else if (campaign.status === "sending" && campaign.scheduled_at) {
        dateTime = parseISO(campaign.scheduled_at);
      }
      
      if (dateTime) {
        const key = `${format(dateTime, "yyyy-MM-dd")}-${getHours(dateTime)}`;
        const existing = map.get(key) || [];
        existing.push(campaign);
        map.set(key, existing);
      }
    });
    
    return map;
  }, [campaigns]);

  const getCampaignsForDay = (day: Date): Campaign[] => {
    const dateStr = format(day, "yyyy-MM-dd");
    return campaignsByDate.get(dateStr) || [];
  };

  const getCampaignsForHour = (day: Date, hour: number): Campaign[] => {
    const key = `${format(day, "yyyy-MM-dd")}-${hour}`;
    return campaignsByHour.get(key) || [];
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

  const upcomingCampaigns = useMemo(() => {
    const now = new Date();
    return campaigns
      .filter(c => c.status === "scheduled" && c.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .slice(0, 5);
  }, [campaigns]);

  const navigatePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    }
    return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Calendar */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              {getHeaderTitle()}
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                <Button
                  variant={viewMode === "month" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("month")}
                  className="h-7 px-2 text-xs"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  Month
                </Button>
                <Button
                  variant={viewMode === "week" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("week")}
                  className="h-7 px-2 text-xs"
                >
                  <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                  Week
                </Button>
              </div>
              
              {/* Navigation */}
              <div className="flex gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "month" ? (
            <>
              {/* Month View - Weekday headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Month View - Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, index) => (
                  <div key={`pad-${index}`} className="min-h-[100px] bg-muted/30 rounded-lg" />
                ))}

                {monthDays.map((day) => {
                  const dayCampaigns = getCampaignsForDay(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        "min-h-[100px] p-1.5 rounded-lg border transition-colors",
                        isToday(day)
                          ? "bg-primary/5 border-primary/30"
                          : "bg-card border-border/50 hover:border-border",
                        !isSameMonth(day, currentDate) && "opacity-50"
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
                                    <p className="text-xs text-muted-foreground">{campaign.preview_text}</p>
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
            </>
          ) : (
            /* Week View */
            <div className="border rounded-lg overflow-hidden">
              {/* Week View - Day headers */}
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
                <div className="p-2 text-xs text-muted-foreground font-medium border-r" />
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "p-2 text-center border-r last:border-r-0",
                      isToday(day) && "bg-primary/10"
                    )}
                  >
                    <div className="text-xs text-muted-foreground font-medium">
                      {format(day, "EEE")}
                    </div>
                    <div
                      className={cn(
                        "text-lg font-semibold mt-0.5",
                        isToday(day) && "text-primary"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {/* Day summary */}
                    {getCampaignsForDay(day).length > 0 && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {getCampaignsForDay(day).length} campaign{getCampaignsForDay(day).length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* Week View - Hour grid */}
              <ScrollArea className="h-[500px]">
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                  {hours.map((hour) => (
                    <div key={hour} className="contents">
                      {/* Hour label */}
                      <div className="p-2 text-xs text-muted-foreground text-right border-r border-b bg-muted/10 sticky left-0">
                        {format(setHours(new Date(), hour), "h a")}
                      </div>
                      
                      {/* Hour cells for each day */}
                      {weekDays.map((day) => {
                        const hourCampaigns = getCampaignsForHour(day, hour);
                        const isCurrentHour = isToday(day) && new Date().getHours() === hour;
                        
                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            className={cn(
                              "min-h-[50px] p-1 border-r border-b last:border-r-0 relative",
                              isCurrentHour && "bg-primary/5",
                              isToday(day) && "bg-primary/[0.02]"
                            )}
                          >
                            {/* Current time indicator */}
                            {isCurrentHour && (
                              <div 
                                className="absolute left-0 right-0 border-t-2 border-primary z-10"
                                style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                              >
                                <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-primary" />
                              </div>
                            )}
                            
                            <TooltipProvider>
                              {hourCampaigns.map((campaign) => (
                                <Tooltip key={campaign.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => onCampaignClick?.(campaign)}
                                      className={cn(
                                        "w-full text-left text-xs px-1.5 py-1 rounded border mb-1 flex items-center gap-1",
                                        getStatusColor(campaign.status),
                                        "hover:opacity-80 transition-opacity cursor-pointer"
                                      )}
                                    >
                                      {getStatusIcon(campaign.status)}
                                      <span className="truncate text-[10px]">{campaign.subject}</span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs z-50">
                                    <div className="space-y-2">
                                      <p className="font-medium">{campaign.subject}</p>
                                      {campaign.preview_text && (
                                        <p className="text-xs text-muted-foreground">{campaign.preview_text}</p>
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
                                      {campaign.status === "scheduled" && campaign.scheduled_at && (
                                        <div className="pt-1 border-t">
                                          <CountdownTimer 
                                            targetDate={new Date(campaign.scheduled_at)} 
                                            compact={false}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </TooltipProvider>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

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
                  <>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(campaign.scheduled_at), "EEE, MMM d 'at' h:mm a")}
                    </p>
                    <div className="mt-2">
                      <CountdownTimer 
                        targetDate={new Date(campaign.scheduled_at)} 
                        compact 
                      />
                    </div>
                  </>
                )}
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}