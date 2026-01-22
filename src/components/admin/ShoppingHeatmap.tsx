import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { subDays, getDay, getHours, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeatmapData {
  day: number; // 0 = Sunday, 6 = Saturday
  hour: number; // 0-23
  count: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ShoppingHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [maxCount, setMaxCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHeatmapData() {
      try {
        const startDate = subDays(new Date(), 30);

        const { data: events } = await supabase
          .from('ecommerce_events' as 'share_events')
          .select('created_at')
          .gte('created_at', startDate.toISOString());

        if (events) {
          // Aggregate by day and hour
          const aggregated: Record<string, number> = {};
          const typedEvents = events as unknown as Array<{ created_at: string }>;
          
          typedEvents.forEach((event) => {
            const date = parseISO(event.created_at);
            const day = getDay(date);
            const hour = getHours(date);
            const key = `${day}-${hour}`;
            aggregated[key] = (aggregated[key] || 0) + 1;
          });

          // Convert to array format
          const data: HeatmapData[] = [];
          let max = 0;
          
          DAYS.forEach((_, dayIndex) => {
            HOURS.forEach((hour) => {
              const key = `${dayIndex}-${hour}`;
              const count = aggregated[key] || 0;
              if (count > max) max = count;
              data.push({ day: dayIndex, hour, count });
            });
          });

          setHeatmapData(data);
          setMaxCount(max);
        }
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmapData();
  }, []);

  const getIntensityClass = (count: number): string => {
    if (maxCount === 0 || count === 0) return 'bg-secondary';
    const ratio = count / maxCount;
    
    if (ratio >= 0.8) return 'bg-primary';
    if (ratio >= 0.6) return 'bg-primary/80';
    if (ratio >= 0.4) return 'bg-primary/60';
    if (ratio >= 0.2) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    return hour < 12 ? `${hour}am` : `${hour - 12}pm`;
  };

  const getDataForCell = (day: number, hour: number): HeatmapData | undefined => {
    return heatmapData.find(d => d.day === day && d.hour === hour);
  };

  // Find peak times
  const peakTimes = heatmapData
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peak Shopping Hours</CardTitle>
        <CardDescription>
          Activity heatmap for the last 30 days
          {peakTimes.length > 0 && (
            <span className="block mt-1">
              Busiest: {peakTimes.map(p => `${DAYS[p.day]} ${formatHour(p.hour)}`).join(', ')}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <TooltipProvider>
            <div className="space-y-4">
              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Hour labels */}
                  <div className="flex ml-10 mb-1">
                    {HOURS.filter((_, i) => i % 3 === 0).map(hour => (
                      <div 
                        key={hour} 
                        className="text-xs text-muted-foreground"
                        style={{ width: `${100 / 8}%` }}
                      >
                        {formatHour(hour)}
                      </div>
                    ))}
                  </div>
                  
                  {/* Grid rows */}
                  {DAYS.map((day, dayIndex) => (
                    <div key={day} className="flex items-center gap-1 mb-1">
                      <div className="w-9 text-xs text-muted-foreground text-right pr-2">
                        {day}
                      </div>
                      <div className="flex-1 flex gap-0.5">
                        {HOURS.map(hour => {
                          const cell = getDataForCell(dayIndex, hour);
                          const count = cell?.count || 0;
                          
                          return (
                            <Tooltip key={`${day}-${hour}`}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`flex-1 h-6 rounded-sm cursor-default transition-colors ${getIntensityClass(count)}`}
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-medium">{day} {formatHour(hour)}</p>
                                <p className="text-xs text-muted-foreground">
                                  {count} event{count !== 1 ? 's' : ''}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded-sm bg-secondary" />
                  <div className="w-4 h-4 rounded-sm bg-primary/20" />
                  <div className="w-4 h-4 rounded-sm bg-primary/40" />
                  <div className="w-4 h-4 rounded-sm bg-primary/60" />
                  <div className="w-4 h-4 rounded-sm bg-primary/80" />
                  <div className="w-4 h-4 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}
