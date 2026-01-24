import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { BubblesConversation } from "@/components/BubblesConversation";
import { BubblesVoiceChat } from "@/components/BubblesVoiceChat";
import { MeetTheMentors } from "@/components/MeetTheMentors";
import { MentorFrequencyCards } from "@/components/MentorFrequencyCards";
import { MentorFrequencyWidget } from "@/components/MentorFrequencyWidget";
import { BubblesBog } from "@/components/BubblesBog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TalkToBubbles() {
  const [prefilledQuestion, setPrefilledQuestion] = useState<string>("");
  const chatSectionRef = useRef<HTMLDivElement>(null);

  const handleChannelMentor = useCallback((question: string, mentorName: string) => {
    setPrefilledQuestion(question);
    
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    
    toast.success(`Channeling ${mentorName}'s wisdom...`, {
      description: "Your question is ready — just hit send!",
      duration: 3000,
    });
  }, []);

  const handleQuestionUsed = useCallback(() => {
    setPrefilledQuestion("");
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Talk to Bubbles | Have a Conversation with Ireland's Most Confused Sheep</title>
        <meta 
          name="description" 
          content="Chat with Bubbles the sheep using voice or text. Experience the wisdom of Wicklow's most confidently incorrect philosopher." 
        />
        <meta property="og:title" content="Talk to Bubbles | Voice Chat with a Wicklow Sheep" />
        <meta property="og:description" content="Have a real conversation with Bubbles. Ask about life, philosophy, food, or anything else. Prepare for confidently wrong answers." />
        <meta property="og:image" content={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-talk-image`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Talk to Bubbles | Voice Chat with a Wicklow Sheep" />
        <meta name="twitter:description" content="Have a real conversation with Bubbles. Ask about life, philosophy, food, or anything else." />
        <meta name="twitter:image" content={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/og-talk-image`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background">
        {/* Floating Mentor Widget */}
        <MentorFrequencyWidget />

        {/* Hero Section with Brand-aligned SVG */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <motion.div 
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                  Talk to <span className="text-accent">Bubbles</span>
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  Have a real conversation with Ireland's most confidently confused sheep. 
                  Ask anything — expect confidently wrong answers.
                </p>
              </motion.div>

              {/* Brand-aligned Bubbles SVG */}
              <motion.div
                className="relative flex justify-center md:justify-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative w-full max-w-md">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl scale-110" />
                  <BubblesBog size="hero" animated posture="four-legged" />
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Chat Interface */}
        <section ref={chatSectionRef} className="py-8 md:py-12 scroll-mt-20">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="chat" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="chat">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="call">
                  Call
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BubblesVoiceChat 
                    prefilledQuestion={prefilledQuestion}
                    onQuestionUsed={handleQuestionUsed}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="call" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BubblesConversation />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Meet the Mentors */}
        <MeetTheMentors onChannelMentor={handleChannelMentor} />

        {/* Mentor Activity */}
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
                Who's Been Talking?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                See which mentors Bubbles has been channeling lately.
              </p>
            </motion.div>
            <MentorFrequencyCards />
          </div>
        </section>

        {/* Tips Section - Simplified */}
        <section className="py-8 md:py-12 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-display text-xl font-semibold mb-4">
                What to Ask Bubbles
              </h3>
              <p className="text-muted-foreground">
                Ask about philosophy, food, music, travel, or life advice. 
                Bubbles will share wisdom from the humans who raised them in Wicklow.
              </p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
