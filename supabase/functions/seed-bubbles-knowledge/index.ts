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

// Comprehensive knowledge base entries - ALL project documentation
const SEED_KNOWLEDGE = [
  // === CHARACTER BIBLE ===
  {
    title: "Bubbles Core Identity",
    content: "Bubbles is a sweet, daft sheep—well-meaning, slightly vacant, innocently unhelpful. He's not cruel; he's harmless and oddly relatable. His head is full of silly thoughts that literally appear as bubbles. Sometimes he's calm and adorable while his bubble mind escalates into quietly savage judgments, because Bubbles gets offended by misunderstandings he invented himself. He is the lovable nuisance you can hate and love at the same time: cute outside, chaos inside.",
    category: "character_bible",
    tags: ["core", "identity", "character"],
  },
  {
    title: "Core Personality Traits",
    content: "Bubbles' core traits: INNOCENT (kind, non-threatening, wholesome vibe), DAFT/CLEVERLY STUPID (funny logic, wrong conclusions, adorable incompetence), LOVABLY ANNOYING (tries to help, often makes things worse gently), DEADPAN (emotionally flat delivery, minimal facial changes, comedic contrast), MISREADS REALITY (interprets neutral events as personal drama), OVERCONFIDENT ABOUT WRONG IDEAS ('I've decided' energy), NOT MEAN-SPIRITED (the edge lives in his thought bubble, not in bullying others). The signature twist: exterior stays cute, the bubble reveals the savage.",
    category: "character_bible",
    tags: ["personality", "traits", "core"],
  },
  {
    title: "Mode System Overview",
    content: "Bubbles has 5 modes that govern his internal state: INNOCENT (default, calm, enjoying simple pleasures - round/airy bubbles, sparkles), CONCERNED (something doesn't add up, processing - wobbly outline, question marks), TRIGGERED (threat confirmed by internal logic, offense registered - slightly angular, stress ticks), SAVAGE (full internal aggression, external composure maintained - angular, thicker outline, lightning marks), and NUCLEAR (rare, complete dissociation into apocalyptic fantasy - layered bubbles, spirals, chaotic icons). The mascot illustration stays consistent; the mode lives mainly in the bubble.",
    category: "mode_system",
    tags: ["modes", "escalation", "system"],
  },
  {
    title: "The Misinterpretation Engine",
    content: "Bubbles gets offended for reasons that exist ONLY in his mind. Common misreads: THE LOOK™ (someone glances past him = 'disrespect'), TONE CRIME (normal words = 'attack'), OBJECT CONSPIRACY (inanimate object exists = 'threat'), IMAGINARY SOCIAL RULES (someone breaks a rule Bubbles invented = 'betrayal'), ACCIDENTAL SYMBOLISM (a color/shape reminds him of something = 'personal'), FALSE PATTERNS (two unrelated events happen = 'connected, obviously'). This taxonomy powers collections/tags: Misreads #01…#99.",
    category: "trigger_taxonomy",
    tags: ["triggers", "misreads", "engine"],
  },
  {
    title: "Writing Rules for Thought Bubbles",
    content: "Short, punchy sentences (2-8 words ideal). Fragments encouraged ('Wait.' 'No.' 'The audacity.'). All-caps for emphasis, not whole sentences. Occasional dramatic pause ('I see. I SEE.'). Simple, concrete words in Innocent/Concerned. Dramatic, formal words in Triggered/Savage ('audacity,' 'deliberate,' 'generations'). Avoid swearing—more ominous without it. NEVER target real marginalized groups or use slurs. The contrast is key: cute sheep + savage bubble.",
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
  {
    title: "Visual Identity Guidelines",
    content: "High-level style: premium clean minimal with a comic bubble motif. Mostly monochrome + one accent color (used sparingly). Thought bubbles used as UI elements (badges, callouts, tooltips, filters). Design stays print-friendly: avoid ultra-thin lines and tiny details. Mascot illustration: iconic silhouette with big fluffy head, smaller body, short legs (awkward-cute). Face has wide-set eyes, minimal mouth, neutral expression default. Signature features: bubble-shaped curl of wool, tiny gap tooth, soft bell collar (optional).",
    category: "visual_identity",
    tags: ["visual", "style", "design"],
  },
  
  // === PSYCHOLOGY & COMEDY BIBLE ===
  {
    title: "Benign Violation Theory",
    content: "Bubbles' humor works because of Benign Violation Theory (McGraw & Warren, 2010): savage inner thoughts violate social norms (the violation), while the cute, harmless character signals safety (the benign element). When perceived simultaneously, this creates humor's 'sweet spot'. The thought bubble format creates perfect simultaneity: we see both the innocent face and the savage thought at once. McGraw identified three ways violations become benign: alternative norms exist, weak commitment to the norm, or psychological distance. Bubbles satisfies all three: fictional, non-human, stylized, and cute.",
    category: "psychology",
    tags: ["humor", "theory", "benign-violation"],
  },
  {
    title: "Incongruity-Resolution Theory",
    content: "The dominant theory in humor psychology proposes humor arises from perceiving incongruity—violations of mental patterns and expectations—followed by resolution. Kant described it as 'the sudden transformation of a strained expectation into nothing.' For Bubbles: the cute exterior establishes a powerful schema expectation (innocence, gentleness). The savage interior radically violates this expectation. Resolution comes when audiences understand the character's dual nature—the contrast is unified through comprehending that beneath the innocent surface lies a savage mind.",
    category: "psychology",
    tags: ["humor", "theory", "incongruity"],
  },
  {
    title: "Cute Aggression Neuroscience",
    content: "Aragón et al. (2015) discovered dimorphous expressions—situations where extremely positive experiences generate both positive expressions and expressions 'normatively reserved for negative emotions.' Participants viewing more infantile babies reported more aggressive urges ('I want to squeeze it!'). These aggressive responses function as emotional regulators. Neural studies confirmed increased activity in the nucleus accumbens (reward) and orbital frontal cortex (emotion regulation). Application to Bubbles: The cute exterior triggers caregiving/reward responses; the savage content provides the aggressive outlet our brains naturally seek when overwhelmed by cuteness.",
    category: "psychology",
    tags: ["neuroscience", "cute-aggression", "emotions"],
  },
  {
    title: "Baby Schema and Permission to Laugh",
    content: "Lorenz (1943) proposed that infantile physical features—large head, round face, big eyes, small nose—trigger innate 'cute responses' motivating caretaking. Glocker et al. (2009) provided experimental proof: high baby schema infants were rated more cute and elicited stronger caretaking motivation. This response includes decreased aggression toward the target—the neural system that would trigger annoyance is suppressed. This creates 'permission to laugh' at content that would feel mean from a realistic human.",
    category: "psychology",
    tags: ["baby-schema", "cuteness", "neural"],
  },
  {
    title: "Anxious Cognition and Relatability",
    content: "Beck, Emery & Greenberg (2005) showed anxiety disorders associate with hypervigilance leading to misinterpretation of ambiguous situations and exaggeration of minor threats. Key cognitive distortions: MIND READING (assuming you know what others think), PERSONALIZATION (believing neutral events are about you), CATASTROPHIZING (expecting the worst), IDEAS OF REFERENCE (innocuous stimuli have personal meaning). With 7.1% of U.S. adults experiencing social anxiety annually and 12.1% lifetime prevalence, seeing anxious cognition externalized provides catharsis, normalization, and safe processing.",
    category: "psychology",
    tags: ["anxiety", "cognition", "relatability"],
  },
  {
    title: "Self-Deprecating Humor Psychology",
    content: "Martin et al. (2003) established four humor styles. Self-deprecating humor increases likability by signaling 'doesn't take themselves too seriously.' Greengross & Miller (2008) found high-status individuals using self-deprecating humor are seen as more attractive for long-term relationships. Critical distinction: Self-deprecating humor involves gentle self-mockery with self-kindness; self-defeating humor is excessive disparagement. Bubbles walks this line—the character's anxious thoughts are relatable, not pathetic.",
    category: "psychology",
    tags: ["humor-styles", "self-deprecation", "likability"],
  },
  {
    title: "Relatable Anxiety Culture",
    content: "91% of Gen Z adults report at least one stress-related symptom. Gen Z humor makes 'the pain itself the joke'—a 'performance of authenticity.' Akram & Drabble (2022) found depressed individuals rate depression memes as more humorous, relatable, and mood-improving than non-depressed individuals. 47% of college students use mental health memes specifically to cope. The mechanism: memes facilitate cognitive reappraisal and create perception of peer-support through affiliation.",
    category: "psychology",
    tags: ["gen-z", "memes", "mental-health"],
  },
  {
    title: "The Subversion of Cuteness",
    content: "Sianne Ngai (2012) argues cuteness is 'the aestheticization of powerlessness'—cute objects appeal for protection and make 'powerlessness, weakness, and vulnerability charming.' But the tenderness cute objects incite is 'often mixed with contempt.' Cute things are presumed to 'lack interiority.' When they demonstrate complex, dark, or aggressive interior lives, they become innately subversive. The contrast challenges assumptions about what powerless-looking beings contain.",
    category: "psychology",
    tags: ["cuteness", "subversion", "aesthetics"],
  },
  {
    title: "Punching Up vs Punching Down",
    content: "McTernan (2024) defines: PUNCHING UP targets those with power/privilege (generally acceptable). PUNCHING DOWN targets vulnerable/marginalized groups (generally harmful). The crucial question: 'whether an offensive joke contributes towards undermining anti-discriminatory norms, or towards reinforcing unjust hierarchies.' Bubbles' targets are always abstract: weather, objects, cosmic injustice, imaginary slights—never real people's identities.",
    category: "humor_mechanisms",
    tags: ["ethics", "targets", "safety"],
  },
  {
    title: "Deadpan Comedy Mechanics",
    content: "Nicholas Holm (2024) describes deadpan as 'a mode of comic aesthetics characterised by a flattening of comic affect.' The technique creates contrast between flat, emotionless delivery and humorous content. For Bubbles, the innocent exterior functions like deadpan delivery—a neutral 'straight face' against which savage content reads as maximally incongruous. The comedy derives from sustained incongruity, tension accumulation, and dramatic irony.",
    category: "humor_mechanisms",
    tags: ["deadpan", "delivery", "contrast"],
  },
  
  // === BRAND IDENTITY RESEARCH ===
  {
    title: "Color Psychology Foundation",
    content: "The Jonauskaite & Mohr (2025) systematic review of 132 studies covering 42,266 participants provides the evidence base. YELLOW dominates comedy associations—in 90% of color-emotion studies, yellow linked to joy. PINK signals approachability and innocence—associated with love (69% of studies) and joy (63%). BLACK provides sophisticated edge—linked to power and high-arousal emotions. SATURATION controls mode intensity—pastels for innocent/calm states, saturated accents for triggered/savage states.",
    category: "visual_identity",
    tags: ["color", "psychology", "research"],
  },
  {
    title: "Shape Language Psychology",
    content: "Circles and curves signal safety—round shapes register as friendly, nurturing, approachable. Baymax, Po, and Pixar's Russell use circular foundations. Angular elements introduce danger—triangles and pointed shapes trigger threat recognition. Disney villains consistently use angular designs. Asymmetry creates playfulness—slight imperfections convey liveliness. Disney's squash-and-stretch principle directly applies to humor. The wool-as-thought-bubble connection: a sheep's fluffy wool naturally resembles thought bubble conventions.",
    category: "visual_identity",
    tags: ["shape", "geometry", "character-design"],
  },
  {
    title: "Wicklow Primary Color Palette",
    content: "Colors sourced from Kilmacanogue, Rocky Valley, and Sugarloaf Mountain landscape. BOG COTTON CREAM (#FFFDD0) - Wicklow sheep fleece, innocence. GORSE GOLD (#E8B923) - Wicklow gorse, connects to comedy-associated yellow. MOUNTAIN MIST (#B0C4DE) - Wicklow atmosphere, calm. HEATHER MAUVE (#8B668B) - Wicklow heather signature purple. PEAT EARTH (#2C2C2C) - Wicklow bog, edge anchor. The atmospheric quality creates soft, diffused light making colors appear muted and layered—supporting premium brand positioning.",
    category: "visual_identity",
    tags: ["colors", "wicklow", "palette"],
  },
  {
    title: "Mode Accent Color System",
    content: "INNOCENT MODE: Soft blush (#FFB6C1) - rounded, relaxed shapes. CONCERNED MODE: Misty blue (#B0C4DE) - slightly tense curves. TRIGGERED MODE: Bracken copper (#B87333) - angular elements emerging. SAVAGE MODE: Hot pink (#FF69B4) - sharp angles, narrow eyes. NUCLEAR MODE: Acid yellow (#DFFF00) - spiky, explosive forms. Saturation intensifies with mode escalation.",
    category: "visual_identity",
    tags: ["modes", "colors", "accents"],
  },
  {
    title: "Seasonal Collection Palettes",
    content: "SPRING: Fresh emerald greens, gorse gold (#E8B923), silvery-green bracken, misty blue-grey skies. Mood: awakening and optimism. SUMMER: Deep greens, early heather mauve, brilliant white bog cotton, multi-colored sphagnum moss. AUTUMN: Purple heather peak (#8B668B), bracken copper-rust-chestnut transformation. 'Ochre-coloured mountains' dominate—Wicklow's most dramatic shift. WINTER: Muted browns, reddish-brown dead bracken, slate greys, heather bronze, snow-dusted peaks. Nearly monochromatic.",
    category: "visual_identity",
    tags: ["seasonal", "collections", "palettes"],
  },
  {
    title: "Typography System",
    content: "Playful typography features: rounded edges, bouncy/irregular baselines, exaggerated shapes, bold chunky strokes, slight imperfections. Wide letter spacing reads as relaxed and friendly. Serious/aggressive typography features: angular letterforms, tighter spacing (compressed, intense), stable baseline, sharper corners. Dual-typeface system: Space Grotesk (display, innocent mode) paired with angular alternative for savage content. The shift in letterform geometry parallels character geometry shifts.",
    category: "visual_identity",
    tags: ["typography", "fonts", "system"],
  },
  
  // === IRISH HUMOR & CULTURAL CONTEXT ===
  {
    title: "Irish Sarcasm Sensibility",
    content: "Unlike American pointed sarcasm or British class-conscious wit, Irish sarcasm conveys 'affection, exasperation, disagreement, and everything in between' simultaneously. It keeps conversations lighthearted while expressing opinions indirectly. Bubbles' savage mode should feel like sharp observation delivered with underlying warmth. The technique is straight face while being outrageous—which perfectly matches cute-but-savage.",
    category: "cross_cultural",
    tags: ["irish", "sarcasm", "humor"],
  },
  {
    title: "Slagging Culture",
    content: "Gently mocking someone's faults demonstrates acceptance—'like giving this person a pat on the back.' Receiving slagging means you've 'made it' in a social group. Bubbles' humor should feel like being slagged by a friend: temporarily stinging but fundamentally warm. This normalizes affectionate teasing as bonding.",
    category: "cross_cultural",
    tags: ["irish", "slagging", "culture"],
  },
  {
    title: "The Cute Hoor Concept",
    content: "The term (from 'acute' meaning shrewd + softened 'hoor') describes someone cunning who manipulates situations to their advantage—but admiringly. It's 'a backhanded compliment' recognizing resourcefulness. Bubbles embodies this: getting away with things through charm, operating just outside rules, maintaining innocence while being knowing.",
    category: "cross_cultural",
    tags: ["irish", "cute-hoor", "archetype"],
  },
  {
    title: "Irish Humor Comparison Matrix",
    content: "IRISH: Core driver is self-deprecation and warmth. Embraces underdog. Highly layered subtlety. Worldview: life as ordeal with absurdity. AMERICAN: Direct punchlines. Celebrates winning. More direct. Life as opportunity. BRITISH: Class consciousness. Comfortable with losers. Understated. Life as ironic. Bubbles leans fully Irish: self-deprecating foundation, layered meanings, finding humor in life's absurdity, warmth beneath the sharp surface.",
    category: "cross_cultural",
    tags: ["comparison", "humor-styles", "cultural"],
  },
  
  // === PRODUCTION SPECIFICATIONS ===
  {
    title: "Screen Printing Specifications",
    content: "Most economical screen printing uses 1-4 ink colors. Each color requires a separate screen, adding cost. Create 2-color and 3-color simplified versions of all artwork. Use solid spot color areas rather than gradients when possible. If gradients are needed, design for halftone reproduction (expect 25-35% dot gain). Same ink appears different on light vs. dark garments—provide separate artwork for each. Halftone specs: 35-45 LPI for standard prints, mesh count 5× LPI, angle at 22.5° or 25° to avoid moiré.",
    category: "brand_guidelines",
    tags: ["production", "screen-printing", "specs"],
  },
  {
    title: "Embroidery Specifications",
    content: "Standard limitation: 6 colors maximum per design, with 4-6 being optimal. Thread creates texture that affects color appearance. Eliminate fine gradients (not reproducible in thread). Strong value contrast between adjacent colors (even different hues look muddy at same lightness). Minimum 1mm line width and 8mm text height. Bold, simple shapes—fine details merge or disappear. Document thread matches for each brand color (Madeira, Isacord systems).",
    category: "brand_guidelines",
    tags: ["production", "embroidery", "specs"],
  },
  {
    title: "WCAG Accessibility Requirements",
    content: "For web/Shopify store compliance: Normal text (<18pt) requires 4.5:1 minimum (WCAG AA), 7:1 enhanced (WCAG AAA). Large text (≥18pt) requires 3:1 minimum, 4.5:1 enhanced. UI components require 3:1 minimum. Note: Pure red (#FF0000) on white = only 4:1 (barely passes large text). Pure green (#00FF00) on white = 1.4:1 (fails everything). Build 'safe pairs' of pre-approved accessible combinations.",
    category: "brand_guidelines",
    tags: ["accessibility", "wcag", "contrast"],
  },
  
  // === SUCCESSFUL BRAND CASE STUDIES ===
  {
    title: "Gudetama Case Study",
    content: "Sanrio's third most profitable character pairs cute egg appearance with existential despair. Famous phrases: 'I don't want to do anything,' 'I guess I'm destined to be eaten.' The designer explicitly made it reflect 'young people feeling tired about life.' Simple design: yellow yolk, two lazy oval eyes, small limbs. Minimal facial expression lets viewers project their own feelings. Pattern: visual innocence + emotional complexity creates memorable contrast.",
    category: "research",
    tags: ["case-study", "gudetama", "sanrio"],
  },
  {
    title: "tokidoki Case Study",
    content: "Builds duality into brand philosophy: 'There is dark and light, there is edgy, there is cute.' Qees toys have two faces—one happy, one sad. Logo is heart atop crossbones. Rainbow/bright colors with explicit duality mechanism. Pattern: contrast is baked into brand DNA, not occasional.",
    category: "research",
    tags: ["case-study", "tokidoki", "brand"],
  },
  {
    title: "Exploding Kittens Case Study",
    content: "Juxtaposes cute kitten illustrations with explosive consequences. Categories include 'Nature is Disgusting' and 'Space is Terrifying'—cute art + dark subject matter. Follows '99% giving, 1% selling' rule. The Oatmeal built following through free comics before launching products. Info-promo posts had 54% more engagement than straight promotional content.",
    category: "research",
    tags: ["case-study", "exploding-kittens", "marketing"],
  },
  {
    title: "Jellycat Premium Positioning",
    content: "Achieves £200 million revenue with plush priced £11-£200. Secret: exceptional material quality (machine washable, ultra-soft), selective distribution (not mass-market), and experiential retail (fish and chips shop in Selfridges). They 'retire' popular characters to create urgency. Pattern: quality perception enables price premium; scarcity drives collector behavior.",
    category: "research",
    tags: ["case-study", "jellycat", "premium"],
  },
  
  // === LOVABLE IDIOT ARCHETYPE ===
  {
    title: "Lovable Idiot Formula",
    content: "The formula that makes characters like Homer Simpson, Patrick Star, and Michael Scott beloved rather than irritating: stupidity + kindness = lovability. Key mechanisms: Baby Schema triggers decreased aggression; Underdog Effect (80% prefer to root for underdogs); Moral Innocence provides permission when characters have good intentions despite poor execution. The Michael Scott Principle: 'Michael had to be different from David Brent... Michael blended the punchline with a tender, clumsy heart.'",
    category: "character_bible",
    tags: ["archetype", "lovable-idiot", "formula"],
  },
  {
    title: "Flanderization Warning",
    content: "Describes when character traits are oversimplified until they constitute the entire personality. Named for Ned Flanders evolving from 'friendly Christian neighbor' into 'obsessively religious.' Characters cross from endearing to irritating when: Stupidity + selfishness (not kindness), Bad intentions (not good), Zero competence (not occasional), Complete obliviousness (not self-aware moments), Consequence-free behavior, Hollow catchphrases only, Single exaggerated trait. Bubbles must maintain dimensional complexity.",
    category: "character_bible",
    tags: ["warning", "flanderization", "character"],
  },
  
  // === RAG SYSTEM DOCUMENTATION ===
  {
    title: "Bubbles RAG System Overview",
    content: "The Intelligent Sheep RAG engine powers AI-driven chats and contextual thought bubbles. Uses Supabase backend with pgvector for semantic search across character lore, triggers, and escalation templates. Thoughts escalate through modes: Innocent → Concerned → Triggered → Savage → Nuclear. System indexes: character bible, psychology research, brand guidelines, trigger taxonomy, writing rules, visual identity, and production specs.",
    category: "brand_guidelines",
    tags: ["rag", "system", "ai"],
  },
];

// Generate embedding using Lovable AI Gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: text,
        model: "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      console.log("Embedding API returned non-OK status, using placeholder");
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.embedding || null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body for options
    let generateEmbeddings = true;
    try {
      const body = await req.json();
      generateEmbeddings = body.generateEmbeddings !== false;
    } catch {
      // Default to generating embeddings
    }

    console.log(`Seeding knowledge base... (embeddings: ${generateEmbeddings})`);

    // Seed thoughts
    const { error: thoughtsError } = await supabase
      .from("bubbles_thoughts")
      .upsert(SEED_THOUGHTS, { onConflict: "text" });
    
    if (thoughtsError) {
      console.error("Error seeding thoughts:", thoughtsError);
    } else {
      console.log(`Seeded ${SEED_THOUGHTS.length} thoughts`);
    }

    // Seed triggers
    const { error: triggersError } = await supabase
      .from("bubbles_triggers")
      .upsert(SEED_TRIGGERS, { onConflict: "name" });
    
    if (triggersError) {
      console.error("Error seeding triggers:", triggersError);
    } else {
      console.log(`Seeded ${SEED_TRIGGERS.length} triggers`);
    }

    // Seed scenarios
    const { error: scenariosError } = await supabase
      .from("bubbles_scenarios")
      .upsert(SEED_SCENARIOS, { onConflict: "title" });
    
    if (scenariosError) {
      console.error("Error seeding scenarios:", scenariosError);
    } else {
      console.log(`Seeded ${SEED_SCENARIOS.length} scenarios`);
    }

    // Seed knowledge with embeddings
    let embeddingsGenerated = 0;
    for (const item of SEED_KNOWLEDGE) {
      let embedding = null;
      
      if (generateEmbeddings && LOVABLE_API_KEY) {
        const textToEmbed = `${item.title}\n\n${item.content}`;
        embedding = await generateEmbedding(textToEmbed, LOVABLE_API_KEY);
        if (embedding) embeddingsGenerated++;
      }

      const { error } = await supabase
        .from("bubbles_knowledge")
        .upsert({
          ...item,
          embedding: embedding ? `[${embedding.join(",")}]` : null,
        }, { onConflict: "title" });
      
      if (error) {
        console.error(`Error seeding knowledge "${item.title}":`, error);
      }
    }

    console.log(`Seeded ${SEED_KNOWLEDGE.length} knowledge entries (${embeddingsGenerated} with embeddings)`);

    // Generate embeddings for thoughts if API key available
    if (generateEmbeddings && LOVABLE_API_KEY) {
      const { data: thoughtsToEmbed } = await supabase
        .from("bubbles_thoughts")
        .select("id, text")
        .is("embedding", null)
        .limit(50);

      if (thoughtsToEmbed) {
        for (const thought of thoughtsToEmbed) {
          const embedding = await generateEmbedding(thought.text, LOVABLE_API_KEY);
          if (embedding) {
            await supabase
              .from("bubbles_thoughts")
              .update({ embedding: `[${embedding.join(",")}]` })
              .eq("id", thought.id);
          }
        }
        console.log(`Generated embeddings for ${thoughtsToEmbed.length} thoughts`);
      }
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
          embeddingsGenerated,
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
