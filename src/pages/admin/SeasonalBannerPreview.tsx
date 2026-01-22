import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SEASONAL_EVENTS, type SeasonalEvent } from '@/components/SeasonalBanner';
import { cn } from '@/lib/utils';
import { Calendar, Eye, RefreshCw, CheckCircle, XCircle, Sparkles } from 'lucide-react';

export default function SeasonalBannerPreview() {
  const [selectedEventId, setSelectedEventId] = useState<string>(SEASONAL_EVENTS[0]?.id || '');
  const [messageIndex, setMessageIndex] = useState(0);

  const selectedEvent = SEASONAL_EVENTS.find(e => e.id === selectedEventId);
  const isCurrentlyActive = selectedEvent?.check() ?? false;

  const cycleMessage = () => {
    if (!selectedEvent) return;
    setMessageIndex((prev) => (prev + 1) % selectedEvent.messages.length);
  };

  const randomizeMessage = () => {
    if (!selectedEvent) return;
    setMessageIndex(Math.floor(Math.random() * selectedEvent.messages.length));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            Seasonal Banner Preview
          </h1>
          <p className="text-muted-foreground mt-1">
            Test all seasonal banners regardless of current date
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Select Banner to Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Select value={selectedEventId} onValueChange={(v) => { setSelectedEventId(v); setMessageIndex(0); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seasonal event..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONAL_EVENTS.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <span className="flex items-center gap-2">
                          <event.icon className="h-4 w-4" />
                          {event.name}
                          {event.check() && (
                            <Badge variant="secondary" className="ml-2 text-xs">Active Now</Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={cycleMessage} disabled={!selectedEvent}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Next Message
              </Button>
              <Button variant="outline" onClick={randomizeMessage} disabled={!selectedEvent}>
                <Sparkles className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>

            {selectedEvent && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  {isCurrentlyActive ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={isCurrentlyActive ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                    {isCurrentlyActive ? 'Currently active' : 'Not currently active'}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  Message {messageIndex + 1} of {selectedEvent.messages.length}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {selectedEvent && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Live Preview</h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <BannerPreview event={selectedEvent} messageIndex={messageIndex} />
            </div>
          </div>
        )}

        {/* All Messages for Selected Event */}
        {selectedEvent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Messages ({selectedEvent.messages.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedEvent.messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-colors",
                      idx === messageIndex 
                        ? "border-primary bg-primary/5" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setMessageIndex(idx)}
                  >
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0">
                        #{idx + 1}
                      </Badge>
                      <p className="text-sm italic">"{message}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Events Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Seasonal Events ({SEASONAL_EVENTS.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {SEASONAL_EVENTS.map((event) => {
                const isActive = event.check();
                const IconComponent = event.icon;
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                      event.id === selectedEventId && "ring-2 ring-primary",
                      isActive && "border-green-500"
                    )}
                    onClick={() => { setSelectedEventId(event.id); setMessageIndex(0); }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn(
                        "p-2 rounded-full",
                        `bg-gradient-to-r ${event.gradient}`
                      )}>
                        <IconComponent className={cn("h-4 w-4", event.textColor)} />
                      </div>
                      <div>
                        <h3 className="font-medium">{event.name}</h3>
                        <p className="text-xs text-muted-foreground">{event.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {event.messages.length} messages
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

// Standalone preview component that renders the banner exactly as it would appear
function BannerPreview({ event, messageIndex }: { event: SeasonalEvent; messageIndex: number }) {
  const IconComponent = event.icon;
  const message = event.messages[messageIndex] || event.messages[0];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        `bg-gradient-to-r ${event.gradient}`,
        `border-b ${event.borderColor}`
      )}
    >
      {/* Decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <IconComponent className={cn("absolute top-1 left-[5%] h-4 w-4 opacity-30 animate-pulse", event.textColor)} />
        <IconComponent className={cn("absolute top-2 left-[25%] h-3 w-3 opacity-40 animate-pulse delay-100", event.textColor)} />
        <IconComponent className={cn("absolute bottom-1 left-[45%] h-5 w-5 opacity-20 animate-pulse delay-200", event.textColor)} />
        <IconComponent className={cn("absolute top-1 right-[30%] h-4 w-4 opacity-30 animate-pulse delay-300", event.textColor)} />
        <IconComponent className={cn("absolute bottom-2 right-[15%] h-3 w-3 opacity-40 animate-pulse delay-150", event.textColor)} />
      </div>

      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Sheep emoji */}
          <div className="flex-shrink-0 text-2xl sm:text-3xl" aria-hidden="true">
            🐑
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs sm:text-sm font-medium mb-0.5", event.textColor)}>
              {event.label}
            </p>
            <p className={cn("text-sm sm:text-base italic leading-relaxed", event.textColor.replace("900", "800").replace("100", "200"))}>
              "{message}"
            </p>
          </div>

          {/* Dismiss button (non-functional in preview) */}
          <div className={cn("flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-md", event.accentColor)}>
            <span className="text-xs">✕</span>
          </div>
        </div>
      </div>
    </div>
  );
}
