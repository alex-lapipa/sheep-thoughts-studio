import { useState, useRef, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Pause,
  Maximize2,
  TrendingUp,
  Users,
  Globe,
  Target,
  Sparkles,
  ShoppingBag,
  Heart,
  Zap,
  Award,
  BarChart3,
  Rocket,
  Shield,
  DollarSign,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Bubbles the Sheep",
    subtitle: "Confidently Wrong Since Birth",
    icon: <Sparkles className="w-16 h-16" />,
    gradient: "from-bubbles-meadow via-bubbles-gorse to-accent",
    accentColor: "text-bubbles-meadow",
    content: (
      <div className="space-y-6 text-center">
        <p className="text-2xl md:text-3xl font-light opacity-90">
          The world's first AI-powered character brand
        </p>
        <p className="text-xl opacity-70">
          Where being wrong is the entire point.
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Badge variant="secondary" className="text-lg px-4 py-2">Character IP</Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">AI-Native</Badge>
          <Badge variant="secondary" className="text-lg px-4 py-2">D2C Merch</Badge>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "AI is too serious",
    icon: <Target className="w-16 h-16" />,
    gradient: "from-destructive/80 via-orange-500 to-amber-500",
    accentColor: "text-destructive",
    content: (
      <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">73%</p>
            <p className="opacity-70">of users find AI assistants "soulless"</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">€2.1B</p>
            <p className="opacity-70">spent on AI that lacks personality</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">0</p>
            <p className="opacity-70">character-first AI brands that succeed by being wrong</p>
          </div>
        </div>
        <p className="text-xl text-center opacity-80">
          The market is flooded with AI trying to be right. Nobody owns "charmingly incorrect."
        </p>
      </div>
    ),
  },
  {
    id: 3,
    title: "The Solution",
    subtitle: "A sheep who knows everything. Incorrectly.",
    icon: <Lightbulb className="w-16 h-16" />,
    gradient: "from-bubbles-gorse via-yellow-400 to-amber-400",
    accentColor: "text-bubbles-gorse",
    content: (
      <div className="space-y-6">
        <div className="max-w-3xl mx-auto">
          <blockquote className="text-2xl md:text-3xl italic text-center mb-8 opacity-90">
            "The sun is powered by angry bees. I've researched this."
          </blockquote>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h4 className="font-bold text-xl mb-3">The Inversion Principle™</h4>
              <p className="opacity-80">Bubbles correctly remembers everything but catastrophically misinterprets it. This creates comedy gold without being offensive.</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <h4 className="font-bold text-xl mb-3">RAG-Powered Personality</h4>
              <p className="opacity-80">Every response is informed by a curated knowledge base of "wrong takes" — consistent character, infinite content.</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Why Now?",
    subtitle: "Perfect timing for character-driven AI",
    icon: <Zap className="w-16 h-16" />,
    gradient: "from-purple-600 via-violet-500 to-fuchsia-500",
    accentColor: "text-purple-400",
    content: (
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">Market Tailwinds</h4>
            <ul className="space-y-3 text-lg opacity-80">
              <li className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-400" /> AI adoption at all-time high</li>
              <li className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-400" /> Character IP valuations soaring</li>
              <li className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-400" /> D2C merch margins improving</li>
              <li className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-400" /> Irish/Wicklow brand appeal global</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-bold">Tech Enablers</h4>
            <ul className="space-y-3 text-lg opacity-80">
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-accent" /> RAG systems mature enough</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-accent" /> Voice synthesis near-human</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-accent" /> POD economics work at scale</li>
              <li className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-accent" /> Shopify + Supabase = instant infra</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Product Suite",
    subtitle: "Three revenue pillars",
    icon: <ShoppingBag className="w-16 h-16" />,
    gradient: "from-accent via-emerald-500 to-teal-500",
    accentColor: "text-accent",
    content: (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-white/20">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h4 className="text-2xl font-bold mb-2">Merch</h4>
          <p className="opacity-70 mb-4">POD apparel, mugs, accessories with Bubbles' wisdom</p>
          <p className="text-3xl font-bold text-accent">45% margin</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-white/20">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-bubbles-gorse" />
          <h4 className="text-2xl font-bold mb-2">AI Experiences</h4>
          <p className="opacity-70 mb-4">Voice chat, explains, challenges — endless engagement</p>
          <p className="text-3xl font-bold text-bubbles-gorse">Viral loops</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center border border-white/20">
          <Award className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h4 className="text-2xl font-bold mb-2">Licensing</h4>
          <p className="opacity-70 mb-4">Character IP for games, shows, partnerships</p>
          <p className="text-3xl font-bold text-purple-400">∞ scale</p>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "The Technology",
    subtitle: "AI-native from day one",
    icon: <Zap className="w-16 h-16" />,
    gradient: "from-blue-600 via-cyan-500 to-teal-400",
    accentColor: "text-cyan-400",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">RAG Knowledge Engine</h4>
            <ul className="space-y-2 opacity-80">
              <li>• 500+ curated "wrong takes"</li>
              <li>• Semantic search for context</li>
              <li>• Mode-aware responses (innocent → nuclear)</li>
              <li>• Consistent personality at scale</li>
            </ul>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">Voice & Interaction</h4>
            <ul className="space-y-2 opacity-80">
              <li>• ElevenLabs Irish voice synthesis</li>
              <li>• Real-time speech recognition</li>
              <li>• Escalation mechanics (challenge → triggered)</li>
              <li>• Shareable badges & achievements</li>
            </ul>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
          <p className="text-lg opacity-80">
            Stack: React + Supabase + Edge Functions + Shopify + POD Integration
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "Target Audience",
    subtitle: "Who loves a confidently wrong sheep?",
    icon: <Users className="w-16 h-16" />,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    accentColor: "text-pink-400",
    content: (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">🎮 Meme-Savvy Gen Z</h4>
          <p className="opacity-70 mb-2">Ages 16-28</p>
          <ul className="text-sm opacity-60 space-y-1">
            <li>• Love absurdist humor</li>
            <li>• Share character content</li>
            <li>• Buy statement merch</li>
          </ul>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">🍀 Ireland Enthusiasts</h4>
          <p className="opacity-70 mb-2">Global diaspora + tourists</p>
          <ul className="text-sm opacity-60 space-y-1">
            <li>• Wicklow connection</li>
            <li>• Premium on authenticity</li>
            <li>• Gift-giving occasions</li>
          </ul>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3">🤖 AI Curious Adults</h4>
          <p className="opacity-70 mb-2">Ages 25-45</p>
          <ul className="text-sm opacity-60 space-y-1">
            <li>• Tired of serious AI</li>
            <li>• Appreciate craft & wit</li>
            <li>• Higher AOV buyers</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 8,
    title: "Go-to-Market",
    subtitle: "Viral-first strategy",
    icon: <Rocket className="w-16 h-16" />,
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    accentColor: "text-orange-400",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl font-bold mb-2">Q1</p>
            <p className="text-sm opacity-70">Core AI experiences live. First merch drop.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl font-bold mb-2">Q2</p>
            <p className="text-sm opacity-70">TikTok/Reels campaign. Influencer seeding.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl font-bold mb-2">Q3</p>
            <p className="text-sm opacity-70">Regional expansion. DACH, Francophone.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
            <p className="text-3xl font-bold mb-2">Q4</p>
            <p className="text-sm opacity-70">Holiday push. Licensing conversations.</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="font-bold text-xl mb-3 text-center">Viral Mechanics Built-In</h4>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className="text-sm">Shareable Badges</Badge>
            <Badge className="text-sm">Challenge Mode</Badge>
            <Badge className="text-sm">Hall of Fame</Badge>
            <Badge className="text-sm">Wrong Take Generator</Badge>
            <Badge className="text-sm">Voice Clips</Badge>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 9,
    title: "Business Model",
    subtitle: "Multiple revenue streams",
    icon: <DollarSign className="w-16 h-16" />,
    gradient: "from-green-600 via-emerald-500 to-teal-500",
    accentColor: "text-green-400",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">Revenue Mix (Year 2)</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Merch Sales</span>
                <span className="font-bold">60%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-accent h-3 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span>Licensing</span>
                <span className="font-bold">25%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-purple-400 h-3 rounded-full" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span>Premium AI Features</span>
                <span className="font-bold">15%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div className="bg-bubbles-gorse h-3 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">Unit Economics</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="opacity-70">Avg Order Value</span>
                <span className="font-bold">€42</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Gross Margin</span>
                <span className="font-bold">45%</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">CAC (organic)</span>
                <span className="font-bold">€8</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">LTV:CAC</span>
                <span className="font-bold text-green-400">4.2x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 10,
    title: "Traction",
    subtitle: "Early signals that validate",
    icon: <BarChart3 className="w-16 h-16" />,
    gradient: "from-indigo-600 via-blue-500 to-cyan-500",
    accentColor: "text-indigo-400",
    content: (
      <div className="space-y-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">12K+</p>
            <p className="opacity-70">Site visitors (soft launch)</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">3.2min</p>
            <p className="opacity-70">Avg session duration</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">42%</p>
            <p className="opacity-70">Voice chat engagement</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <p className="text-4xl font-bold mb-2">18%</p>
            <p className="opacity-70">Add-to-cart rate</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
          <p className="text-xl opacity-80">
            "This sheep is absolutely unhinged and I need everything on that store." — Early tester
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 11,
    title: "Competitive Landscape",
    subtitle: "Blue ocean opportunity",
    icon: <Globe className="w-16 h-16" />,
    gradient: "from-slate-600 via-slate-500 to-zinc-500",
    accentColor: "text-slate-300",
    content: (
      <div className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/20">
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4 text-center">Bubbles</th>
                <th className="py-3 px-4 text-center opacity-60">Character.AI</th>
                <th className="py-3 px-4 text-center opacity-60">Exploding Kittens</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">AI-Native Character</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">D2C Merch Revenue</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">Consistent Personality</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-3 px-4">Voice Interaction</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Unique Comedy Mechanic</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
                <td className="py-3 px-4 text-center text-red-400">✗</td>
                <td className="py-3 px-4 text-center text-green-400">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-center opacity-70">
          No one owns "AI character that's consistently, charmingly wrong."
        </p>
      </div>
    ),
  },
  {
    id: 12,
    title: "Moats",
    subtitle: "Defensibility that compounds",
    icon: <Shield className="w-16 h-16" />,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    accentColor: "text-violet-400",
    content: (
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="font-bold text-xl mb-4">📚 Knowledge Base</h4>
          <p className="opacity-80">500+ curated wrong takes, scenarios, and escalation paths. Takes months to replicate, years to match quality.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="font-bold text-xl mb-4">🎭 Character Consistency</h4>
          <p className="opacity-80">RAG-powered personality ensures every interaction is on-brand. Competitors using generic LLMs can't match.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="font-bold text-xl mb-4">🍀 Cultural Authenticity</h4>
          <p className="opacity-80">Born in Wicklow, Irish voice, local references. Can't be faked by Silicon Valley.</p>
        </div>
        <div className="bg-white/10 backdrop-blur rounded-xl p-6">
          <h4 className="font-bold text-xl mb-4">❤️ Community & Content</h4>
          <p className="opacity-80">User-generated wrong takes, Hall of Fame submissions. Network effects in comedy.</p>
        </div>
      </div>
    ),
  },
  {
    id: 13,
    title: "The Team",
    subtitle: "Built to ship, designed to scale",
    icon: <Users className="w-16 h-16" />,
    gradient: "from-teal-600 via-cyan-500 to-blue-500",
    accentColor: "text-teal-400",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-accent to-bubbles-meadow rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              🧠
            </div>
            <h4 className="font-bold text-lg">Founder/CEO</h4>
            <p className="opacity-60 text-sm mt-2">Product + AI vision. Previous: [Redacted] startup exit.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              🎨
            </div>
            <h4 className="font-bold text-lg">Creative Director</h4>
            <p className="opacity-60 text-sm mt-2">Brand + Character. Ex-agency, award-winning campaigns.</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              ⚡
            </div>
            <h4 className="font-bold text-lg">Tech Lead</h4>
            <p className="opacity-60 text-sm mt-2">Full-stack + AI. Built RAG systems at scale.</p>
          </div>
        </div>
        <p className="text-center opacity-70">
          Advisors from [Major Studio], [D2C Brand], [AI Research Lab]
        </p>
      </div>
    ),
  },
  {
    id: 14,
    title: "The Ask",
    subtitle: "€500K seed to capture the moment",
    icon: <Rocket className="w-16 h-16" />,
    gradient: "from-accent via-emerald-500 to-green-500",
    accentColor: "text-accent",
    content: (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">Use of Funds</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Product & AI Development</span>
                <span className="font-bold">40%</span>
              </div>
              <div className="flex justify-between">
                <span>Marketing & Launch</span>
                <span className="font-bold">30%</span>
              </div>
              <div className="flex justify-between">
                <span>Content & Community</span>
                <span className="font-bold">20%</span>
              </div>
              <div className="flex justify-between">
                <span>Operations</span>
                <span className="font-bold">10%</span>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <h4 className="font-bold text-xl mb-4">18-Month Milestones</h4>
            <ul className="space-y-2 opacity-80">
              <li>• 100K monthly active users</li>
              <li>• €300K ARR from merch</li>
              <li>• 2 licensing deals signed</li>
              <li>• Series A ready metrics</li>
            </ul>
          </div>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-accent">Pre-money: €2.5M</p>
        </div>
      </div>
    ),
  },
  {
    id: 15,
    title: "Join the Flock",
    subtitle: "Be part of something confidently different",
    icon: <Heart className="w-16 h-16" />,
    gradient: "from-bubbles-meadow via-accent to-bubbles-gorse",
    accentColor: "text-bubbles-meadow",
    content: (
      <div className="space-y-8 text-center">
        <blockquote className="text-3xl md:text-4xl italic opacity-90 max-w-3xl mx-auto">
          "Mountains are just old hills that got promoted. I've seen the paperwork."
        </blockquote>
        <p className="text-xl opacity-70">
          — Bubbles, on geology
        </p>
        <div className="pt-8">
          <p className="text-2xl font-bold mb-4">Let's build the world's most lovably wrong brand together.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="secondary" className="text-lg px-6 py-3">bubbles@sheep-thoughts.studio</Badge>
            <Badge variant="secondary" className="text-lg px-6 py-3">sheep-thoughts.lovable.app</Badge>
          </div>
        </div>
      </div>
    ),
  },
];

export default function AdminPresentation() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const slide = slides[currentSlide];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Investor Presentation</h1>
            <p className="text-muted-foreground">15-slide pitch deck for Bubbles the Sheep</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isAutoPlaying ? "Pause" : "Auto-Play"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (containerRef.current?.requestFullscreen) {
                  containerRef.current.requestFullscreen();
                }
              }}
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        </div>

        {/* Slide Progress */}
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === currentSlide 
                  ? "w-8 bg-accent" 
                  : index < currentSlide 
                    ? "w-4 bg-accent/50" 
                    : "w-4 bg-muted"
              )}
            />
          ))}
          <span className="ml-4 text-sm text-muted-foreground">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        {/* Slide Container */}
        <div 
          ref={containerRef}
          className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-2xl"
        >
          {/* Gradient Background */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-br transition-all duration-700",
              slide.gradient
            )}
          />
          
          {/* Content */}
          <div className="relative z-10 h-full flex flex-col text-white p-8 md:p-12">
            {/* Slide Header */}
            <div className="flex items-start gap-6 mb-8">
              <div className="p-4 bg-white/10 backdrop-blur rounded-2xl">
                {slide.icon}
              </div>
              <div>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-2">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl opacity-80">{slide.subtitle}</p>
                )}
              </div>
            </div>

            {/* Slide Content */}
            <div className="flex-1 flex items-center">
              <div className="w-full">
                {slide.content}
              </div>
            </div>

            {/* Slide Number */}
            <div className="absolute bottom-6 right-8 text-sm opacity-50">
              {String(slide.id).padStart(2, '0')}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {slides.map((s, index) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all",
                index === currentSlide 
                  ? "border-accent ring-2 ring-accent/30" 
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <div className={cn("w-full h-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-medium", s.gradient)}>
                {s.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
