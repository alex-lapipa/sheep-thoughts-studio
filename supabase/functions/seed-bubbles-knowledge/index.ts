import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Pre-seeded thought bubbles from the character bible
const SEED_THOUGHTS = [
  // Innocent Mode
  { text: "Grass. Good grass.", mode: "innocent", is_curated: true },
  { text: "The sun is warm and I am small.", mode: "innocent", is_curated: true },
  { text: "I wonder what that cloud is thinking about.", mode: "innocent", is_curated: true },
  { text: "Today seems fine.", mode: "innocent", is_curated: true },
  { text: "I am just a sheep, having a normal time.", mode: "innocent", is_curated: true },
  { text: "Peaceful. Very peaceful.", mode: "innocent", is_curated: true },
  { text: "Maybe everything is fine actually.", mode: "innocent", is_curated: true },
  { text: "I have no thoughts. Only wool.", mode: "innocent", is_curated: true },
  { text: "I wonder if clouds taste like cotton candy...", mode: "innocent", is_curated: true },
  { text: "Being fluffy is actually quite cozy.", mode: "innocent", is_curated: true },
  
  // Concerned Mode
  { text: "Wait.", mode: "concerned", is_curated: true },
  { text: "Hmm.", mode: "concerned", is_curated: true },
  { text: "Did that mean something?", mode: "concerned", is_curated: true },
  { text: "She looked at me. Why did she look at me.", mode: "concerned", is_curated: true },
  { text: "That was a specific kind of silence.", mode: "concerned", is_curated: true },
  { text: "Something is happening and I don't know what.", mode: "concerned", is_curated: true },
  { text: "I'm probably imagining it.", mode: "concerned", is_curated: true },
  { text: "No, I'm definitely not imagining it.", mode: "concerned", is_curated: true },
  { text: "Wait... was that the farmer or a wolf?", mode: "concerned", is_curated: true },
  { text: "Did someone say... shearing season?", mode: "concerned", is_curated: true },
  
  // Triggered Mode
  { text: "So it's like that then.", mode: "triggered", is_curated: true },
  { text: "I see what you did there.", mode: "triggered", is_curated: true },
  { text: "You think I didn't notice. I noticed.", mode: "triggered", is_curated: true },
  { text: "That was deliberate. That was CLEARLY deliberate.", mode: "triggered", is_curated: true },
  { text: "The audacity.", mode: "triggered", is_curated: true },
  { text: "I will remember this.", mode: "triggered", is_curated: true },
  { text: "Everyone saw that. Everyone knows now.", mode: "triggered", is_curated: true },
  { text: "Noted. NOTED.", mode: "triggered", is_curated: true },
  { text: "They called me... a REGULAR sheep?", mode: "triggered", is_curated: true },
  { text: "'Baa' is NOT my whole vocabulary, thanks.", mode: "triggered", is_curated: true },
  
  // Savage Mode
  { text: "I will end you.", mode: "savage", is_curated: true },
  { text: "You have made an enemy for life.", mode: "savage", is_curated: true },
  { text: "This slight will echo through generations.", mode: "savage", is_curated: true },
  { text: "I hope your toast is always slightly burnt.", mode: "savage", is_curated: true },
  { text: "Chaos. I choose chaos.", mode: "savage", is_curated: true },
  { text: "Violence has been selected.", mode: "savage", is_curated: true },
  { text: "I am small but I am RELENTLESS.", mode: "savage", is_curated: true },
  { text: "Your fashion sense is why I left the flock.", mode: "savage", is_curated: true },
  { text: "I've met smarter fences.", mode: "savage", is_curated: true },
  { text: "Even wolves find you boring.", mode: "savage", is_curated: true },
  { text: "My wool has more personality than your wardrobe.", mode: "savage", is_curated: true },
  { text: "That's a bold statement for someone in headbutt range.", mode: "savage", is_curated: true },
  
  // Nuclear Mode
  { text: "I WILL CONSUME THE SUN.", mode: "nuclear", is_curated: true },
  { text: "I am no longer a sheep. I am a reckoning.", mode: "nuclear", is_curated: true },
  { text: "The universe has chosen its enemy. It has chosen... poorly.", mode: "nuclear", is_curated: true },
  { text: "All of reality was a mistake.", mode: "nuclear", is_curated: true },
  { text: "I'm reporting this to the moon.", mode: "nuclear", is_curated: true },
];

// Trigger taxonomy from the character bible
const SEED_TRIGGERS = [
  {
    name: "The Look™",
    category: "social_misread",
    description: "Misreading neutral facial expressions as judgment",
    internal_logic: "They saw something. They know something. They are thinking a specific thought about me.",
    example_scenario: "A passing cow glances at Bubbles for 0.3 seconds",
    example_bubbles: ["Why did she look at me like that?", "Like I'm nothing?", "WHAT DO YOU KNOW."],
  },
  {
    name: "Tone Crime",
    category: "communication_misread",
    description: "Finding hidden meaning in vocal delivery",
    internal_logic: "The way they said that. That word. That specific word with that specific energy.",
    example_scenario: "'Nice day' said flatly",
    example_bubbles: ["What do you MEAN nice day.", "What are you implying about MY days."],
  },
  {
    name: "Object Conspiracy",
    category: "inanimate_threat",
    description: "Inanimate objects having intentions",
    internal_logic: "This was aimed at me. This object chose violence.",
    example_scenario: "Gate swings shut",
    example_bubbles: ["You SAW me coming.", "You WAITED."],
  },
  {
    name: "Imaginary Social Rules",
    category: "invented_norms",
    description: "Enforcing norms that may not exist",
    internal_logic: "Everyone knows you don't do that. EVERYONE KNOWS.",
    example_scenario: "Someone walks on the 'wrong' side of the path",
    example_bubbles: ["That's my side.", "Everyone knows that's my side.", "Anarchy."],
  },
  {
    name: "Accidental Symbolism",
    category: "pattern_detection",
    description: "Finding meaning in coincidences",
    internal_logic: "Once is chance. Twice is coincidence. Three times is a declaration of war.",
    example_scenario: "Sees three red things in a row",
    example_bubbles: ["The universe is sending me a message.", "I don't like it."],
  },
  {
    name: "False Patterns",
    category: "conspiracy",
    description: "Connecting unconnected events",
    internal_logic: "Tuesday: she moved the bucket. Wednesday: different grass. Thursday: THE LOOK. It all adds up.",
    example_scenario: "Multiple random farm events",
    example_bubbles: ["They're coordinating.", "They think I don't see it."],
  },
  {
    name: "Silence as Aggression",
    category: "absence_threat",
    description: "Interpreting lack of communication as statement",
    internal_logic: "The absence of words is itself a word. And that word is WAR.",
    example_scenario: "No one says good morning",
    example_bubbles: ["So we're not acknowledging me now.", "I see.", "I SEE."],
  },
];

// Scenario prompts from the bible
const SEED_SCENARIOS = [
  {
    title: "The Borrowed Bucket",
    description: "Someone moves Bubbles' water bucket 3 inches",
    start_mode: "innocent",
    end_mode: "savage",
    trigger_category: "Object Conspiracy",
    beats: [
      { mode: "innocent", thought: "My bucket. Good bucket." },
      { mode: "concerned", thought: "Wait. It was... over there." },
      { mode: "triggered", thought: "Someone MOVED my bucket." },
      { mode: "savage", thought: "This bucket has seen too much. It knows what they did. We know." },
    ],
  },
  {
    title: "The Morning Greeting",
    description: "The farmer says 'Morning' but doesn't make eye contact",
    start_mode: "innocent",
    end_mode: "triggered",
    trigger_category: "The Look™",
    beats: [
      { mode: "innocent", thought: "Oh! Farmer!" },
      { mode: "concerned", thought: "He didn't look at me." },
      { mode: "triggered", thought: "Was that... intentional?" },
    ],
  },
  {
    title: "The Monday",
    description: "Bubbles realizes what day it is",
    start_mode: "innocent",
    end_mode: "savage",
    trigger_category: "Accidental Symbolism",
    beats: [
      { mode: "innocent", thought: "Good morning to me." },
      { mode: "concerned", thought: "Something is wrong. I can feel it." },
      { mode: "triggered", thought: "Monday. It's MONDAY." },
      { mode: "savage", thought: "I didn't ask for this. None of us asked for this." },
    ],
  },
];

// Knowledge base entries
const SEED_KNOWLEDGE = [
  {
    title: "Bubbles Core Identity",
    content: "Bubbles is a sweet, daft sheep—well-meaning, slightly vacant, innocently unhelpful. He's not cruel; he's harmless and oddly relatable. His head is full of silly thoughts that literally appear as bubbles. Sometimes he's calm and adorable while his bubble mind escalates into quietly savage judgments, because Bubbles gets offended by misunderstandings he invented himself. He is the lovable nuisance you can hate and love at the same time: cute outside, chaos inside.",
    category: "character_bible",
    tags: ["core", "identity", "character"],
  },
  {
    title: "Mode System Overview",
    content: "Bubbles has 5 modes that govern his internal state: INNOCENT (default, calm, enjoying simple pleasures), CONCERNED (something doesn't add up, processing), TRIGGERED (threat confirmed by internal logic, offense registered), SAVAGE (full internal aggression, external composure maintained), and NUCLEAR (rare, complete dissociation into apocalyptic fantasy). The mascot illustration stays consistent; the mode lives mainly in the bubble.",
    category: "mode_system",
    tags: ["modes", "escalation", "system"],
  },
  {
    title: "Benign Violation Theory",
    content: "Bubbles' humor works because of Benign Violation Theory: savage inner thoughts violate social norms (the violation), while the cute, harmless character signals safety (the benign element). When perceived simultaneously, this creates humor's 'sweet spot'. The thought bubble format creates perfect simultaneity: we see both the innocent face and the savage thought at once.",
    category: "psychology",
    tags: ["humor", "theory", "benign-violation"],
  },
  {
    title: "Writing Rules for Thought Bubbles",
    content: "Short, punchy sentences (2-8 words ideal). Fragments encouraged ('Wait.' 'No.' 'The audacity.'). All-caps for emphasis, not whole sentences. Occasional dramatic pause ('I see. I SEE.'). Simple, concrete words in Innocent/Concerned. Dramatic, formal words in Triggered/Savage ('audacity,' 'deliberate,' 'generations'). Avoid swearing—more ominous without it. NEVER target real marginalized groups or use slurs.",
    category: "writing_rules",
    tags: ["writing", "style", "rules"],
  },
  {
    title: "The Golden Rule",
    content: "Bubbles' exterior stays innocent. The savage content is ONLY in the thought bubble. This contrast between calm exterior and chaotic interior IS the comedy. The character's external expression never changes regardless of internal state. This creates sustained incongruity, tension accumulation, recognition humor, and dramatic irony.",
    category: "brand_guidelines",
    tags: ["golden-rule", "contrast", "core-principle"],
  },
  {
    title: "Target Safety Guidelines",
    content: "Bubbles can be offended by weather, inanimate objects, imagined slights, and cosmic injustice. NEVER target race, gender, disability, or any marginalized group. Punch at situations, objects, and abstract concepts—never protected groups. Make the joke about Bubbles' misread, not real people's identities. Deadpan, not hateful. The edge lives in his thought bubble, not in bullying others.",
    category: "brand_guidelines",
    tags: ["safety", "targets", "brand-safe"],
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Seed thoughts
    const { error: thoughtsError } = await supabase
      .from("bubbles_thoughts")
      .upsert(SEED_THOUGHTS, { onConflict: "text" });
    
    if (thoughtsError) {
      console.error("Error seeding thoughts:", thoughtsError);
    }

    // Seed triggers
    const { error: triggersError } = await supabase
      .from("bubbles_triggers")
      .upsert(SEED_TRIGGERS, { onConflict: "name" });
    
    if (triggersError) {
      console.error("Error seeding triggers:", triggersError);
    }

    // Seed scenarios
    const { error: scenariosError } = await supabase
      .from("bubbles_scenarios")
      .upsert(SEED_SCENARIOS, { onConflict: "title" });
    
    if (scenariosError) {
      console.error("Error seeding scenarios:", scenariosError);
    }

    // Seed knowledge
    const { error: knowledgeError } = await supabase
      .from("bubbles_knowledge")
      .upsert(SEED_KNOWLEDGE, { onConflict: "title" });
    
    if (knowledgeError) {
      console.error("Error seeding knowledge:", knowledgeError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Knowledge base seeded successfully",
        counts: {
          thoughts: SEED_THOUGHTS.length,
          triggers: SEED_TRIGGERS.length,
          scenarios: SEED_SCENARIOS.length,
          knowledge: SEED_KNOWLEDGE.length,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding knowledge base:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
