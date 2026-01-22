import { useState, useEffect } from "react";
import { X, Clover, Heart, Sun, Leaf, Snowflake, Sparkles, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SeasonalEvent = {
  id: string;
  name: string;
  check: () => boolean;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
  label: string;
  messages: string[];
};

const SEASONAL_EVENTS: SeasonalEvent[] = [
  {
    id: "st-patricks-2026",
    name: "St. Patrick's Day",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // March 14-17 (lead up and day of)
      return month === 2 && day >= 14 && day <= 17;
    },
    icon: Clover,
    gradient: "from-emerald-100/90 via-green-50/90 to-emerald-100/90 dark:from-emerald-950/90 dark:via-green-900/90 dark:to-emerald-950/90",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    textColor: "text-emerald-900 dark:text-emerald-100",
    accentColor: "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200/50 dark:text-emerald-300 dark:hover:text-emerald-100 dark:hover:bg-emerald-800/50",
    label: "A St. Patrick's Day thought from Bubbles:",
    messages: [
      "The humans say the shamrock represents the Holy Trinity. I think it represents three different types of grass. All delicious.",
      "I've been told I'm already wearing green because I'm a sheep from Ireland. I'm fairly certain I'm white, but I'll take the compliment.",
      "Apparently leprechauns hide gold at the end of rainbows. I once followed a rainbow for hours. Found a puddle. Still counts as treasure if you're thirsty.",
      "The farmer said 'Erin go Bragh' this morning. I don't know who Erin is, but I hope she goes wherever she needs to go safely.",
      "They're playing traditional Irish music in the pub. I've been trying to learn the bodhrán but my hooves keep going through it.",
      "The humans are dyeing the river green. Seems inefficient when they could just add more grass to it.",
    ],
  },
  {
    id: "valentines-2026",
    name: "Valentine's Day",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // Feb 12-14
      return month === 1 && day >= 12 && day <= 14;
    },
    icon: Heart,
    gradient: "from-pink-100/90 via-rose-50/90 to-pink-100/90 dark:from-pink-950/90 dark:via-rose-900/90 dark:to-pink-950/90",
    borderColor: "border-pink-200 dark:border-pink-800",
    textColor: "text-pink-900 dark:text-pink-100",
    accentColor: "text-pink-600 hover:text-pink-800 hover:bg-pink-200/50 dark:text-pink-300 dark:hover:text-pink-100 dark:hover:bg-pink-800/50",
    label: "A Valentine's thought from Bubbles:",
    messages: [
      "The humans exchange heart-shaped chocolates today. I tried to eat one but it wasn't shaped like a real heart at all. Very misleading packaging.",
      "Cupid apparently shoots arrows at people to make them fall in love. This seems aggressive. I prefer when the farmer just gives us extra hay.",
      "They say love makes the world go round. I'm fairly certain that's gravity, but I appreciate the sentiment.",
      "I overheard someone say 'You're the apple of my eye.' I don't understand why they'd want fruit in their eye, but humans are mysterious.",
      "Roses are red, violets are blue, I am a sheep, and I love you too. That's a poem I wrote. You're welcome.",
    ],
  },
  {
    id: "easter-2026",
    name: "Easter",
    check: () => {
      // Easter 2026 is April 5th - show March 30 to April 6
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      return (month === 2 && day >= 30) || (month === 3 && day <= 6);
    },
    icon: Sparkles,
    gradient: "from-violet-100/90 via-purple-50/90 to-violet-100/90 dark:from-violet-950/90 dark:via-purple-900/90 dark:to-violet-950/90",
    borderColor: "border-violet-200 dark:border-violet-800",
    textColor: "text-violet-900 dark:text-violet-100",
    accentColor: "text-violet-600 hover:text-violet-800 hover:bg-violet-200/50 dark:text-violet-300 dark:hover:text-violet-100 dark:hover:bg-violet-800/50",
    label: "An Easter thought from Bubbles:",
    messages: [
      "The humans hide eggs and then go looking for them. I've tried explaining that chickens are right there, but nobody listens to me.",
      "Apparently a rabbit delivers chocolate eggs. This is biologically concerning but I'm choosing not to question free chocolate.",
      "Spring lambs are everywhere! I'm trying to teach them the wisdom of standing very still in fields, but they keep bouncing.",
      "The farmer mentioned 'spring cleaning.' I didn't know seasons needed to be cleaned. Winter did seem a bit dusty.",
      "Everyone's talking about rebirth and renewal. I've been the same sheep my whole life but I support their journey.",
    ],
  },
  {
    id: "spring-lambing-2026",
    name: "Spring & Lambing Season",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // March-May, but not during St. Patrick's (Mar 14-17) or Easter week
      if (month < 2 || month > 4) return false;
      // Skip St. Patrick's window
      if (month === 2 && day >= 14 && day <= 17) return false;
      // Skip Easter window (late March/early April)
      if ((month === 2 && day >= 30) || (month === 3 && day <= 6)) return false;
      return true;
    },
    icon: Flower2,
    gradient: "from-lime-100/90 via-green-50/90 to-lime-100/90 dark:from-lime-950/90 dark:via-green-900/90 dark:to-lime-950/90",
    borderColor: "border-lime-200 dark:border-lime-800",
    textColor: "text-lime-900 dark:text-lime-100",
    accentColor: "text-lime-600 hover:text-lime-800 hover:bg-lime-200/50 dark:text-lime-300 dark:hover:text-lime-100 dark:hover:bg-lime-800/50",
    label: "A springtime thought from Bubbles:",
    messages: [
      "Lambing season is here! I've been giving the newborns advice about standing still in fields. They seem more interested in bouncing. Youth these days.",
      "The farmer hasn't slept in three days because of lambing. I offered to help but apparently 'standing nearby looking concerned' isn't as useful as I thought.",
      "I've noticed the lambs are smaller than me. I assume this is because they haven't eaten enough grass yet. Give it time, little ones.",
      "The ewes keep telling me I wouldn't understand because I'm not a mother. I'm not entirely sure what I am, but I'm supportive.",
      "Spring means the tourists are back, pointing at the lambs and saying 'look how cute!' I've been here the whole time, but sure, focus on the bouncy ones.",
      "The daffodils are out. I tried to eat one once. Would not recommend. Grass remains superior.",
      "Everyone's talking about 'new beginnings.' I've been the same sheep since the beginning. Consistency is underrated.",
      "The lambs keep asking me why the sky is blue. I told them it's because the clouds are shy. I'm not sure if that's right but they seemed satisfied.",
      "I watched a lamb try to headbutt a fence post today. It did not go well for the lamb. The fence post seemed fine.",
      "The Wicklow hills are covered in tiny white dots now. That's my extended family. We don't talk much but we nod respectfully.",
    ],
  },
  {
    id: "summer-solstice-2026",
    name: "Summer Solstice",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // June 20-22
      return month === 5 && day >= 20 && day <= 22;
    },
    icon: Sun,
    gradient: "from-amber-100/90 via-yellow-50/90 to-amber-100/90 dark:from-amber-950/90 dark:via-yellow-900/90 dark:to-amber-950/90",
    borderColor: "border-amber-200 dark:border-amber-800",
    textColor: "text-amber-900 dark:text-amber-100",
    accentColor: "text-amber-600 hover:text-amber-800 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:text-amber-100 dark:hover:bg-amber-800/50",
    label: "A midsummer thought from Bubbles:",
    messages: [
      "Today is the longest day of the year. I plan to spend the extra daylight standing in a field. Ambitious, I know.",
      "The humans are staying up late to watch the sunset. I've been watching sunsets my whole life. Nobody gave me credit for it until now.",
      "They say the veil between worlds is thin on the solstice. I'm not sure what that means but I've been keeping an eye on the fences.",
      "Midsummer bonfires are traditional. From a sheep's perspective, fire is concerning, but the warmth is nice.",
    ],
  },
  {
    id: "halloween-2026",
    name: "Halloween",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // Oct 28-31
      return month === 9 && day >= 28 && day <= 31;
    },
    icon: Sparkles,
    gradient: "from-orange-100/90 via-amber-50/90 to-orange-100/90 dark:from-orange-950/90 dark:via-amber-900/90 dark:to-orange-950/90",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-900 dark:text-orange-100",
    accentColor: "text-orange-600 hover:text-orange-800 hover:bg-orange-200/50 dark:text-orange-300 dark:hover:text-orange-100 dark:hover:bg-orange-800/50",
    label: "A spooky thought from Bubbles:",
    messages: [
      "The humans are carving faces into pumpkins. This seems like a lot of effort when you could just look at an actual face.",
      "Everyone's dressing as scary things. I tried to dress as a wolf but I just looked like a sheep with poor posture.",
      "They say ghosts come out on Halloween. I've been saying 'boo' to the other sheep all day. Nobody's impressed.",
      "The children are collecting sweets door to door. I tried this but people just said 'look, there's a sheep' and shut the door.",
      "Apparently black cats are unlucky. I know a black cat. She's lovely. Humans are very superstitious.",
    ],
  },
  {
    id: "autumn-2026",
    name: "Autumn Equinox",
    check: () => {
      const now = new Date();
      const month = now.getMonth();
      const day = now.getDate();
      // Sept 21-23
      return month === 8 && day >= 21 && day <= 23;
    },
    icon: Leaf,
    gradient: "from-orange-100/90 via-red-50/90 to-orange-100/90 dark:from-orange-950/90 dark:via-red-900/90 dark:to-orange-950/90",
    borderColor: "border-orange-200 dark:border-orange-800",
    textColor: "text-orange-900 dark:text-orange-100",
    accentColor: "text-orange-600 hover:text-orange-800 hover:bg-orange-200/50 dark:text-orange-300 dark:hover:text-orange-100 dark:hover:bg-orange-800/50",
    label: "An autumn thought from Bubbles:",
    messages: [
      "The leaves are changing color. I've been the same color my whole life, but I support their journey of self-discovery.",
      "Humans call this 'sweater weather.' I've been wearing my sweater since birth. Very ahead of my time.",
      "The harvest is in. I helped by eating some of the grass around the vegetables. You're welcome, farmer.",
      "The nights are getting longer. More time for standing still in the dark. An underrated activity.",
    ],
  },
  {
    id: "winter-2026",
    name: "Winter",
    check: () => {
      const month = new Date().getMonth();
      return month === 11 || month === 0 || month === 1; // Dec, Jan, Feb
    },
    icon: Snowflake,
    gradient: "from-sky-100/90 via-blue-50/90 to-sky-100/90 dark:from-sky-950/90 dark:via-blue-900/90 dark:to-sky-950/90",
    borderColor: "border-sky-200 dark:border-sky-800",
    textColor: "text-sky-900 dark:text-sky-100",
    accentColor: "text-sky-600 hover:text-sky-800 hover:bg-sky-200/50 dark:text-sky-300 dark:hover:text-sky-100 dark:hover:bg-sky-800/50",
    label: "A cozy winter thought from Bubbles:",
    messages: [
      "The humans keep talking about 'seasonal depression' but I think they just haven't tried standing very still in a field. Works every time.",
      "I've been told the snow is frozen water. This is obviously wrong — water is wet and snow is fluffy. Completely different substances.",
      "Apparently humans celebrate something called 'hygge' in winter. From what I understand, it's just sitting inside wearing wool. I've been doing that my whole life.",
      "The farmer says it's 'cold enough to freeze brass monkeys.' I've never seen a brass monkey, but I hope they're warm wherever they are.",
      "Winter is when humans finally understand the value of a good coat. They've been copying us sheep for centuries.",
    ],
  },
];

const BANNER_STORAGE_PREFIX = "bubbles-seasonal-banner-";

const getActiveEvent = (): SeasonalEvent | null => {
  // Return the first matching event (more specific events should come first in array)
  for (const event of SEASONAL_EVENTS) {
    if (event.check()) {
      return event;
    }
  }
  return null;
};

export const SeasonalBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeEvent, setActiveEvent] = useState<SeasonalEvent | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const event = getActiveEvent();
    if (!event) return;

    const storageKey = BANNER_STORAGE_PREFIX + event.id;
    const isDismissed = localStorage.getItem(storageKey);
    
    if (!isDismissed) {
      setActiveEvent(event);
      setMessage(event.messages[Math.floor(Math.random() * event.messages.length)]);
      // Small delay for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    if (!activeEvent) return;
    setIsVisible(false);
    localStorage.setItem(BANNER_STORAGE_PREFIX + activeEvent.id, "true");
  };

  if (!isVisible || !activeEvent) return null;

  const IconComponent = activeEvent.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        `bg-gradient-to-r ${activeEvent.gradient}`,
        `border-b ${activeEvent.borderColor}`,
        "animate-fade-in"
      )}
    >
      {/* Decorative icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <IconComponent className={cn("absolute top-1 left-[5%] h-4 w-4 opacity-30 animate-pulse", activeEvent.textColor)} />
        <IconComponent className={cn("absolute top-2 left-[25%] h-3 w-3 opacity-40 animate-pulse delay-100", activeEvent.textColor)} />
        <IconComponent className={cn("absolute bottom-1 left-[45%] h-5 w-5 opacity-20 animate-pulse delay-200", activeEvent.textColor)} />
        <IconComponent className={cn("absolute top-1 right-[30%] h-4 w-4 opacity-30 animate-pulse delay-300", activeEvent.textColor)} />
        <IconComponent className={cn("absolute bottom-2 right-[15%] h-3 w-3 opacity-40 animate-pulse delay-150", activeEvent.textColor)} />
      </div>

      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {/* Sheep emoji */}
          <div className="flex-shrink-0 text-2xl sm:text-3xl" aria-hidden="true">
            🐑
          </div>

          {/* Message content */}
          <div className="flex-1 min-w-0">
            <p className={cn("text-xs sm:text-sm font-medium mb-0.5", activeEvent.textColor)}>
              {activeEvent.label}
            </p>
            <p className={cn("text-sm sm:text-base italic leading-relaxed", activeEvent.textColor.replace("900", "800").replace("100", "200"))}>
              "{message}"
            </p>
          </div>

          {/* Dismiss button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className={cn("flex-shrink-0 h-8 w-8", activeEvent.accentColor)}
            aria-label={`Dismiss ${activeEvent.name} message`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
