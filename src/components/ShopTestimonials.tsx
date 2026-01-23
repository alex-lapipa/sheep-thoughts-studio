import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Character testimonials - clearly fictional Bubbles universe personas
const TESTIMONIALS = [
  {
    id: 1,
    quote: "I bought my grandson the 'Confidently Wrong' hoodie. He says it describes his thesis supervisor perfectly. Good value for the money, I'd say.",
    author: "Anthony",
    role: "Philosopher & Pipe Enthusiast",
    avatar: "🍺",
    color: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
  },
  {
    id: 2,
    quote: "The mugs keep the tea warm and the wisdom warmer. I use mine every morning at 6:47 AM sharp, as nature intended.",
    author: "Carmel",
    role: "Schedule Specialist",
    avatar: "⏰",
    color: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  {
    id: 3,
    quote: "In my travels across the oil fields of Qatar, I've never seen merchandise quite like this. Very... Irish.",
    author: "Seamus",
    role: "International Business Expert",
    avatar: "✈️",
    color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  {
    id: 4,
    quote: "Muffins approves of the tote bags. They're made with the same cosmic energy that holds the universe together, probably.",
    author: "Aidan",
    role: "Cosmic Theorist & Dog Dad",
    avatar: "🐕",
    color: "bg-green-500/20 text-green-600 dark:text-green-400",
  },
  {
    id: 5,
    quote: "The quality is satisfactory. No regulations were violated in the making of these products. I checked.",
    author: "Jimmy",
    role: "Authority on Rules",
    avatar: "📋",
    color: "bg-red-500/20 text-red-600 dark:text-red-400",
  },
  {
    id: 6,
    quote: "I wrapped my apple tart in the tissue paper. The sheep on it looked happy. That's what matters in the end.",
    author: "Peggy",
    role: "Kitchen Comfort Expert",
    avatar: "🥧",
    color: "bg-pink-500/20 text-pink-600 dark:text-pink-400",
  },
];

const AUTO_ROTATE_INTERVAL = 5000;

export function ShopTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const currentTestimonial = TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">What The Flock Says</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Wisdom From Bubbles' Mentors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-3 max-w-lg mx-auto"
          >
            The humans who shaped Bubbles share their thoughts on the merchandise
          </motion.p>
        </div>

        {/* Testimonial Card */}
        <div 
          className="max-w-3xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-lg">
              {/* Quote icon */}
              <div className="absolute -top-4 left-8 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-md">
                <Quote className="h-5 w-5 text-accent-foreground" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTestimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  {/* Quote text */}
                  <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                    "{currentTestimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center text-2xl",
                      currentTestimonial.color
                    )}>
                      {currentTestimonial.avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-display font-bold text-foreground">
                        {currentTestimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentTestimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToPrevious}
                  className="hover:bg-accent/10"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                {/* Dots */}
                <div className="flex items-center gap-2">
                  {TESTIMONIALS.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        index === currentIndex
                          ? "bg-accent w-6"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      )}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToNext}
                  className="hover:bg-accent/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Subtle disclaimer */}
            <p className="text-center text-xs text-muted-foreground/60 mt-4">
              * Testimonials from Bubbles' origin story characters. Results may vary based on cosmic alignment.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
