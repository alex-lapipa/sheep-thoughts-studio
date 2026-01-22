import { useState, useMemo } from "react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  addMonths, 
  subMonths, 
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  isToday, 
  parseISO,
  getHours,
  setHours,
  setMinutes,
  isSameDay
} from "date-fns";
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent,
  useDraggable, 
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent
} from "@dnd-kit/core";
import { ChevronLeft, ChevronRight, Clock, Send, CalendarDays, LayoutGrid, Calendar, GripVertical, CalendarClock } from "lucide-react";
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
import { toast } from "sonner";

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
  onReschedule?: (campaignId: string, newDate: Date) => Promise<void>;
}

type ViewMode = "month" | "week" | "day";

// Draggable Campaign Item
function DraggableCampaign({ 
  campaign, 
  onClick, 
  getStatusColor, 
  getStatusIcon,
  compact = false 
}: { 
  campaign: Campaign; 
  onClick?: () => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  compact?: boolean;
}) {
  const isDraggable = campaign.status === "scheduled" || campaign.status === "draft";
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: campaign.id,
    data: { campaign },
    disabled: !isDraggable,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full text-left text-xs px-1.5 py-1 rounded border flex items-center gap-1 group",
        getStatusColor(campaign.status),
        isDraggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        isDragging && "opacity-50",
        "hover:opacity-80 transition-opacity"
      )}
      onClick={(e) => {
        if (!isDragging) {
          e.stopPropagation();
          onClick?.();
        }
      }}
    >
      {isDraggable && (
        <span 
          {...attributes} 
          {...listeners}
          className="opacity-0 group-hover:opacity-60 transition-opacity cursor-grab"
        >
          <GripVertical className="h-3 w-3" />
        </span>
      )}
      {getStatusIcon(campaign.status)}
      <span className={cn("truncate", compact && "text-[10px]")}>{campaign.subject}</span>
    </div>
  );
}

// Droppable Day Cell (Month View)
function DroppableDay({ 
  day, 
  children, 
  isOver,
  currentDate 
}: { 
  day: Date; 
  children: React.ReactNode;
  isOver: boolean;
  currentDate: Date;
}) {
  const { setNodeRef } = useDroppable({
    id: `day-${format(day, "yyyy-MM-dd")}`,
    data: { day, type: "day" },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[100px] p-1.5 rounded-lg border transition-all",
        isToday(day)
          ? "bg-primary/5 border-primary/30"
          : "bg-card border-border/50 hover:border-border",
        !isSameMonth(day, currentDate) && "opacity-50",
        isOver && "ring-2 ring-primary ring-offset-2 bg-primary/10"
      )}
    >
      {children}
    </div>
  );
}

// Droppable Hour Cell (Week View)
function DroppableHour({ 
  day, 
  hour, 
  children,
  isOver
}: { 
  day: Date; 
  hour: number; 
  children: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `hour-${format(day, "yyyy-MM-dd")}-${hour}`,
    data: { day, hour, type: "hour" },
  });

  const isCurrentHour = isToday(day) && new Date().getHours() === hour;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[50px] p-1 border-r border-b last:border-r-0 relative transition-all",
        isCurrentHour && "bg-primary/5",
        isToday(day) && "bg-primary/[0.02]",
        isOver && "ring-2 ring-inset ring-primary bg-primary/10"
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
      {children}
    </div>
  );
}

export function CampaignCalendar({ campaigns, onCampaignClick, onReschedule }: CampaignCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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
        return <Clock className="h-3 w-3 shrink-0" />;
      case "sending":
      case "sent":
        return <Send className="h-3 w-3 shrink-0" />;
      default:
        return null;
    }
  };

  const upcomingCampaigns = useMemo(() => {
    return campaigns
      .filter(c => c.status === "scheduled" && c.scheduled_at)
      .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
      .slice(0, 5);
  }, [campaigns]);

  const navigatePrevious = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewMode === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (viewMode === "week") {
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
    return format(currentDate, "EEEE, MMMM d, yyyy");
  };

  // Get campaigns for the current day view
  const dayCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      let dateTime: Date | null = null;
      
      if (campaign.status === "scheduled" && campaign.scheduled_at) {
        dateTime = parseISO(campaign.scheduled_at);
      } else if (campaign.status === "sent" && campaign.sent_at) {
        dateTime = parseISO(campaign.sent_at);
      } else if (campaign.status === "sending" && campaign.scheduled_at) {
        dateTime = parseISO(campaign.scheduled_at);
      }
      
      return dateTime && isSameDay(dateTime, currentDate);
    });
  }, [campaigns, currentDate]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const campaign = event.active.data.current?.campaign as Campaign;
    setActiveCampaign(campaign);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCampaign(null);
    setOverId(null);

    const { active, over } = event;
    if (!over || !onReschedule) return;

    const campaign = active.data.current?.campaign as Campaign;
    const dropData = over.data.current as { day: Date; hour?: number; type: string };

    if (!campaign || !dropData) return;

    // Only allow rescheduling scheduled or draft campaigns
    if (campaign.status !== "scheduled" && campaign.status !== "draft") {
      toast.error("Only scheduled or draft campaigns can be rescheduled");
      return;
    }

    let newDate: Date;

    if (dropData.type === "hour" && dropData.hour !== undefined) {
      // Week view - set specific hour
      newDate = setMinutes(setHours(dropData.day, dropData.hour), 0);
    } else {
      // Month view - keep original time, change date
      if (campaign.scheduled_at) {
        const originalTime = parseISO(campaign.scheduled_at);
        newDate = setMinutes(
          setHours(dropData.day, getHours(originalTime)),
          originalTime.getMinutes()
        );
      } else {
        // Default to 9 AM if no previous time
        newDate = setMinutes(setHours(dropData.day, 9), 0);
      }
    }

    try {
      await onReschedule(campaign.id, newDate);
      toast.success(`Campaign rescheduled to ${format(newDate, "MMM d 'at' h:mm a")}`);
    } catch (error) {
      toast.error("Failed to reschedule campaign");
    }
  };

  const handleDragCancel = () => {
    setActiveCampaign(null);
    setOverId(null);
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
                  <Button
                    variant={viewMode === "day" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("day")}
                    className="h-7 px-2 text-xs"
                  >
                    <CalendarClock className="h-3.5 w-3.5 mr-1" />
                    Day
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
            
            {/* Drag hint */}
            {onReschedule && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <GripVertical className="h-3 w-3" />
                Drag scheduled campaigns to reschedule them
              </p>
            )}
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
                    const dropId = `day-${format(day, "yyyy-MM-dd")}`;

                    return (
                      <DroppableDay 
                        key={day.toISOString()} 
                        day={day}
                        currentDate={currentDate}
                        isOver={overId === dropId}
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
                                  <div>
                                    <DraggableCampaign
                                      campaign={campaign}
                                      onClick={() => onCampaignClick?.(campaign)}
                                      getStatusColor={getStatusColor}
                                      getStatusIcon={getStatusIcon}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs z-50">
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
                                    {(campaign.status === "scheduled" || campaign.status === "draft") && (
                                      <p className="text-xs text-primary pt-1">
                                        Drag to reschedule
                                      </p>
                                    )}
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
                      </DroppableDay>
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
                          const dropId = `hour-${format(day, "yyyy-MM-dd")}-${hour}`;
                          
                          return (
                            <DroppableHour
                              key={`${day.toISOString()}-${hour}`}
                              day={day}
                              hour={hour}
                              isOver={overId === dropId}
                            >
                              <TooltipProvider>
                                {hourCampaigns.map((campaign) => (
                                  <Tooltip key={campaign.id}>
                                    <TooltipTrigger asChild>
                                      <div className="mb-1">
                                        <DraggableCampaign
                                          campaign={campaign}
                                          onClick={() => onCampaignClick?.(campaign)}
                                          getStatusColor={getStatusColor}
                                          getStatusIcon={getStatusIcon}
                                          compact
                                        />
                                      </div>
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
                                        {(campaign.status === "scheduled" || campaign.status === "draft") && (
                                          <p className="text-xs text-primary">
                                            Drag to reschedule
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                            </DroppableHour>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Day View */}
            {viewMode === "day" && (
              <div className="border rounded-lg overflow-hidden">
                {/* Day header with date info */}
                <div className="bg-muted/30 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={cn(
                        "text-2xl font-bold",
                        isToday(currentDate) && "text-primary"
                      )}>
                        {format(currentDate, "EEEE")}
                      </h3>
                      <p className="text-muted-foreground">
                        {format(currentDate, "MMMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={isToday(currentDate) ? "default" : "outline"} className="mb-1">
                        {isToday(currentDate) ? "Today" : format(currentDate, "EEE")}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        {dayCampaigns.length} campaign{dayCampaigns.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hourly slots */}
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {hours.map((hour) => {
                      const hourCampaigns = getCampaignsForHour(currentDate, hour);
                      const dropId = `hour-${format(currentDate, "yyyy-MM-dd")}-${hour}`;
                      const isCurrentHour = isToday(currentDate) && new Date().getHours() === hour;
                      
                      return (
                        <div 
                          key={hour} 
                          className={cn(
                            "grid grid-cols-[80px_1fr] min-h-[80px] relative",
                            isCurrentHour && "bg-primary/5"
                          )}
                        >
                          {/* Current time indicator */}
                          {isCurrentHour && (
                            <div 
                              className="absolute left-20 right-0 border-t-2 border-primary z-10 pointer-events-none"
                              style={{ top: `${(new Date().getMinutes() / 60) * 100}%` }}
                            >
                              <div className="absolute -left-1 -top-1.5 w-2 h-2 rounded-full bg-primary" />
                            </div>
                          )}
                          
                          {/* Hour label */}
                          <div className={cn(
                            "p-3 text-sm font-medium border-r flex flex-col justify-start",
                            isCurrentHour ? "text-primary" : "text-muted-foreground"
                          )}>
                            <span>{format(setHours(new Date(), hour), "h:mm a")}</span>
                            {hour === 9 && (
                              <span className="text-xs text-muted-foreground/60 mt-0.5">Peak time</span>
                            )}
                          </div>
                          
                          {/* Droppable hour slot */}
                          <DroppableHour
                            day={currentDate}
                            hour={hour}
                            isOver={overId === dropId}
                          >
                            <div className="p-2 space-y-2">
                              <TooltipProvider>
                                {hourCampaigns.map((campaign) => (
                                  <Tooltip key={campaign.id}>
                                    <TooltipTrigger asChild>
                                      <div className="w-full">
                                        <DraggableCampaign
                                          campaign={campaign}
                                          onClick={() => onCampaignClick?.(campaign)}
                                          getStatusColor={getStatusColor}
                                          getStatusIcon={getStatusIcon}
                                        />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-sm z-50">
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
                                        {(campaign.status === "scheduled" || campaign.status === "draft") && (
                                          <p className="text-xs text-primary">
                                            Drag to a different hour to reschedule
                                          </p>
                                        )}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </TooltipProvider>
                              
                              {hourCampaigns.length === 0 && (
                                <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 py-4">
                                  Drop campaign here
                                </div>
                              )}
                            </div>
                          </DroppableHour>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t flex-wrap">
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

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCampaign && (
          <div className={cn(
            "text-xs px-2 py-1.5 rounded border shadow-lg flex items-center gap-1",
            getStatusColor(activeCampaign.status),
            "bg-card"
          )}>
            {getStatusIcon(activeCampaign.status)}
            <span className="font-medium">{activeCampaign.subject}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
