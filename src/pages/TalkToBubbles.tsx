import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { BubblesConversation } from "@/components/BubblesConversation";
import { BubblesVoiceChat } from "@/components/BubblesVoiceChat";
import { VoiceServicesStatus } from "@/components/VoiceServicesStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, MessageSquare, Mic, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

export default function TalkToBubbles() {
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
        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="container px-4 md:px-6">
            <motion.div 
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-accent/20">
                  <Mic className="h-6 w-6 text-accent" />
                </div>
                <VoiceServicesStatus />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
                Talk to <span className="text-accent">Bubbles</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-2">
                Have a real conversation with Ireland's most confidently confused sheep.
              </p>
              
              <p className="text-sm text-muted-foreground/80">
                Ask about philosophy, food, music, rules, routines, or life in Wicklow. 
                Bubbles will consult the wisdom of Peggy, Jimmy, Anthony, Aidan, Seamus, and Carmel.
              </p>
            </motion.div>
          </div>
          
          {/* Decorative background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Voice Chat Interface */}
        <section className="py-8 md:py-12">
          <div className="container px-4 md:px-6">
            <Tabs defaultValue="text-voice" className="w-full max-w-4xl mx-auto">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="text-voice" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Text & Voice</span>
                  <span className="sm:hidden">Chat</span>
                </TabsTrigger>
                <TabsTrigger value="realtime" className="gap-2">
                  <Phone className="h-4 w-4" />
                  <span className="hidden sm:inline">Real-time Call</span>
                  <span className="sm:hidden">Call</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text-voice" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <BubblesVoiceChat />
                </motion.div>
              </TabsContent>

              <TabsContent value="realtime" className="mt-0">
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

        {/* Character Wisdom Guide */}
        <section className="py-12 md:py-16 border-t border-border/50">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-8">
                Who Bubbles Consults
              </h2>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "Anthony",
                    role: "Philosophy & Deep Questions",
                    description: "Pipe smoke curling, third Guinness wisdom that trails off meaningfully...",
                    topics: ["Life's meaning", "Truth", "The universe"],
                    color: "bg-amber-500/10 border-amber-500/20"
                  },
                  {
                    name: "Peggy",
                    role: "Food & Comfort",
                    description: "Kitchen steam rising, warm bread, and wisdom you believe because she fed you.",
                    topics: ["Cooking", "Feeling better", "Love"],
                    color: "bg-rose-500/10 border-rose-500/20"
                  },
                  {
                    name: "Jimmy",
                    role: "Rules & Authority",
                    description: "ISPCA inspector from Cavan. His opinions were legally binding.",
                    topics: ["Right vs wrong", "Rules", "Justice"],
                    color: "bg-blue-500/10 border-blue-500/20"
                  },
                  {
                    name: "Aidan",
                    role: "Music & Cosmic Wisdom",
                    description: "Hippie with guitar, rusty Beetle, and Muffins the dog. 'The universe is, you know...'",
                    topics: ["Music", "Spirituality", "Cosmic mysteries"],
                    color: "bg-violet-500/10 border-violet-500/20"
                  },
                  {
                    name: "Seamus",
                    role: "The Exotic One",
                    description: "Oil business in South Africa. Talked about monkeys, distances, and 40-degree heat.",
                    topics: ["Travel", "Temperature", "Monkeys"],
                    color: "bg-emerald-500/10 border-emerald-500/20"
                  }
                ].map((character, index) => (
                  <motion.div
                    key={character.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-xl border ${character.color}`}
                  >
                    <h3 className="font-display font-semibold text-lg mb-1">
                      {character.name}
                    </h3>
                    <p className="text-xs text-accent font-medium mb-2">
                      {character.role}
                    </p>
                    <p className="text-sm text-muted-foreground mb-3 italic">
                      "{character.description}"
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {character.topics.map(topic => (
                        <span 
                          key={topic}
                          className="text-xs px-2 py-0.5 rounded-full bg-background/50 text-muted-foreground"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-8 md:py-12 bg-secondary/30">
          <div className="container px-4 md:px-6">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="font-display text-xl font-semibold mb-4">
                Tips for Chatting with Bubbles
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2 justify-center">
                  <Volume2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>Ask about philosophy to hear Anthony's trailing wisdom</span>
                </li>
                <li className="flex items-start gap-2 justify-center">
                  <Volume2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>Mention food or feeling sad to invoke Peggy's kitchen comfort</span>
                </li>
                <li className="flex items-start gap-2 justify-center">
                  <Volume2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>Ask about rules or right vs wrong for Jimmy's ISPCA authority</span>
                </li>
                <li className="flex items-start gap-2 justify-center">
                  <Volume2 className="h-4 w-4 mt-0.5 text-accent flex-shrink-0" />
                  <span>Discuss music or dreams for Aidan's vague hippie idealism</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
