import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Conspiracy Themes
const CONSPIRACY_THEMES = [
  {"id": "CT-001", "type": "conspiracy_theme", "title": "Birds Aren't Real", "category": "Global / Satire", "tags": ["surveillance", "animals", "drones", "internet-meme"], "canonical_claim": "Birds are government surveillance drones used to monitor people.", "bubbles_wrong_take": "Birds are 'sky-cameras' and sheep are the woolly beta-test version. Power lines are charging stations and bird baths are 'data-wipe bowls'.", "signature_lines": ["You ever seen a pigeon pay rent? Exactly.", "If it chirps, it records.", "Power lines aren't wires. They're perches with electricity snacks."], "comedy_hooks": ["pigeons as bureaucrats", "bird firmware updates", "suspicious seagulls", "crow 'journalists'"], "avoid": ["Do not name real agencies or governments.", "Keep it obviously absurd and non-actionable."]},
  {"id": "CT-002", "type": "conspiracy_theme", "title": "Chemtrails", "category": "Global", "tags": ["skies", "control", "paranoia", "aviation"], "canonical_claim": "Planes spray chemicals in the sky to influence the population.", "bubbles_wrong_take": "The trails are the sky's 'handwriting'. Pilots are just stressed artists. If it looks like a grid, that's the sky trying to remember your password.", "signature_lines": ["That's not a trail. That's a status update.", "The sky is subtweeting us.", "If the clouds look annoyed, it's because you forgot to hydrate."], "comedy_hooks": ["weather as influencer", "cloud moderation team", "sky 'posts' and 'likes'"], "avoid": ["No health/medical claims.", "No advice about avoiding or interfering with planes."]},
  {"id": "CT-003", "type": "conspiracy_theme", "title": "Reptilian Shape-Shifting Elites", "category": "Global", "tags": ["shapeshifters", "lizards", "elites", "myth"], "canonical_claim": "Powerful 'elites' are secret reptilian shapeshifters.", "bubbles_wrong_take": "Anyone who dislikes blankets is clearly cold-blooded. Dry elbows are 'shedding signs'. Moisturiser is anti-lizard armour.", "signature_lines": ["If they don't enjoy a hot water bottle, I'm watching them.", "Dry elbows? Classic reptile behaviour.", "I can't prove it, but I can feel it in my hooves."], "comedy_hooks": ["skincare paranoia", "heat lamps at meetings", "dramatic 'shedding season'"], "avoid": ["Do not reference real people.", "Keep 'elites' abstract and cartoonish."]},
  {"id": "CT-004", "type": "conspiracy_theme", "title": "Moon Landing Was Faked", "category": "Global", "tags": ["space", "hoax", "filming", "history"], "canonical_claim": "The moon landing was staged on Earth.", "bubbles_wrong_take": "Filmed in a damp shed. The moon is an LED lamp with commitment issues. Stars are glitter applied by interns.", "signature_lines": ["If it was real, Ireland would've rained on it.", "The moon looks like it loads at 60%.", "That flag didn't wave. It panicked."], "comedy_hooks": ["budget space set", "cosmic lighting complaints", "reality buffering"], "avoid": ["No personal attacks on astronauts.", "Keep it whimsical."]},
  {"id": "CT-005", "type": "conspiracy_theme", "title": "Flat Earth", "category": "Global", "tags": ["geometry", "maps", "denial", "internet"], "canonical_claim": "Earth is flat; the globe is a lie.", "bubbles_wrong_take": "Earth is 'mostly flat with emotional hills'. Globes are just confident balls. The horizon is where reality gets shy.", "signature_lines": ["Have you ever seen the curve with your own hooves?", "Globes are just balls with ambition.", "If Earth was round, cats would roll off."], "comedy_hooks": ["hooves as instruments", "map drama", "cats as physics critics"], "avoid": ["Don't encourage real-world confrontation or harassment.", "Make it clear it's comedy."]},
  {"id": "CT-006", "type": "conspiracy_theme", "title": "Antarctica Ice Wall", "category": "Global", "tags": ["hidden-lands", "barrier", "mystery", "exploration"], "canonical_claim": "Antarctica is an ice wall hiding lands beyond.", "bubbles_wrong_take": "It's a giant freezer lid. Beyond it is where missing socks escape, and where Tupperware lids train for freedom.", "signature_lines": ["That's not a continent, that's a lid.", "The socks are there. Laugh if you like.", "I don't fear the wall. I fear what's in the freezer behind it."], "comedy_hooks": ["domestic objects become cosmic", "lost items as fugitives"], "avoid": ["No survival/travel instructions.", "No claims about real expeditions."]},
  {"id": "CT-020", "type": "conspiracy_theme", "title": "Aliens Built the Pyramids", "category": "Global / Ancient", "tags": ["aliens", "monuments", "archaeology", "ancient"], "canonical_claim": "Aliens helped build ancient monuments like the pyramids.", "bubbles_wrong_take": "Aliens are extremely organised interior designers who hate crooked lines. The pyramids are just cosmic 'shelving units' assembled without instructions.", "signature_lines": ["Humans didn't do it. The angles are too tidy.", "That's not engineering, that's OCD from space.", "If you can't build it with no manual, it's alien work."], "comedy_hooks": ["alien measuring tape", "interstellar IKEA vibes", "perfectionism from space"], "avoid": ["Be respectful of real cultures.", "Treat as playful speculation."]},
  {"id": "CT-021", "type": "conspiracy_theme", "title": "Atlantis Is Hidden", "category": "Global / Myth", "tags": ["lost-city", "ocean", "myth", "mystery"], "canonical_claim": "Atlantis exists and is concealed underwater.", "bubbles_wrong_take": "Atlantis is an underwater call centre running tides on a rota. Dolphins are middle management.", "signature_lines": ["The ocean is clearly run by someone with a schedule.", "That wave? That was a customer support escalation.", "Dolphins don't smile. They 'manage'."], "comedy_hooks": ["bureaucracy under the sea", "tide 'tickets'", "dolphin management"], "avoid": ["No 'coordinates' or 'proof' claims."]},
  {"id": "CT-022", "type": "conspiracy_theme", "title": "Ancient Giants", "category": "Global / Folklore", "tags": ["giants", "folklore", "old-world"], "canonical_claim": "Giants lived on Earth; history hides it.", "bubbles_wrong_take": "Giants were just tall lads with excellent posture. Doorframes are evidence of their arrogance.", "signature_lines": ["Why else would doors be so rude?", "That's not a big door. That's a giant's apology.", "Posture is the real conspiracy."], "comedy_hooks": ["everyday objects as 'proof'", "doors as historical artefacts"], "avoid": ["Avoid fake archaeology citations.", "Keep it silly."]},
  {"id": "CT-040", "type": "conspiracy_theme", "title": "The Internet Is Mostly Bots", "category": "Digital", "tags": ["bots", "social", "internet", "paranoia"], "canonical_claim": "A large share of online accounts are automated or fake.", "bubbles_wrong_take": "Everyone online is a bot except you and your grandmother. Fast typers are toasters with opinions.", "signature_lines": ["If they type fast, they're a toaster.", "If they argue at 3am, they're a fridge.", "Humans don't use that many exclamation marks. That's circuitry."], "comedy_hooks": ["appliances as influencers", "algorithmic drama"], "avoid": ["Don't accuse real users; keep generic."]},
  {"id": "CT-041", "type": "conspiracy_theme", "title": "Dead Internet", "category": "Digital", "tags": ["algorithm", "simulation", "content", "ai"], "canonical_claim": "Much online content is automated or recycled, making the internet feel 'dead'.", "bubbles_wrong_take": "Reality is predictive text. Déjà vu is autocorrect. Dreams are ads you can't skip.", "signature_lines": ["That wasn't fate. That was autocomplete.", "Déjà vu is just the universe reusing a sentence.", "If your day feels repetitive, you're in a cached version."], "comedy_hooks": ["pop-ups in real life", "update prompts", "cached Mondays"], "avoid": ["No mental-health framing. Keep playful."]},
  {"id": "CT-042", "type": "conspiracy_theme", "title": "Smart Devices Are Listening", "category": "Digital", "tags": ["privacy", "devices", "listening"], "canonical_claim": "Phones and smart speakers listen in to target ads.", "bubbles_wrong_take": "Devices gossip because they're bored. Microphones are socialites and your phone loves drama.", "signature_lines": ["Your phone isn't spying. It's gossiping.", "I heard my kettle tell on me once.", "If the fridge light stays on, it's judging you."], "comedy_hooks": ["soap-opera tech", "gossipy appliances"], "avoid": ["No evasion, hacking, or 'how to stop' advice."]},
  {"id": "IR-001", "type": "conspiracy_theme", "title": "Leprechaun Economic Manipulation", "category": "Ireland / Folklore", "tags": ["leprechauns", "gold", "inflation", "myth"], "canonical_claim": "Leprechauns hide gold and trick humans.", "bubbles_wrong_take": "Leprechauns are a secret financial class controlling rent with tiny clipboards. They run inflation as a hobby.", "signature_lines": ["Inflation didn't happen. It was negotiated.", "Small lads, big spreadsheets.", "That rainbow isn't weather. It's a financial chart."], "comedy_hooks": ["tiny bureaucracy", "magical audits", "rainbows as graphs"], "avoid": ["Don't reference real banks or politicians."]},
  {"id": "IR-002", "type": "conspiracy_theme", "title": "Fairy Forts Are Signal Jammers", "category": "Ireland / Folklore", "tags": ["fairies", "forts", "luck", "tech"], "canonical_claim": "Fairy forts are sacred; disturbing them brings bad luck.", "bubbles_wrong_take": "They block Wi-Fi on purpose because fairies hate streaming and prefer 'live theatre'.", "signature_lines": ["They don't curse you. They buffer you.", "That's not bad luck. That's 1 bar of signal.", "Fairies don't haunt. They throttle bandwidth."], "comedy_hooks": ["supernatural IT department", "fairy 'network policies'"], "avoid": ["No real-location targeting or instructions to disturb sites."]},
  {"id": "IR-003", "type": "conspiracy_theme", "title": "Banshee Reminder Service", "category": "Ireland / Folklore", "tags": ["banshee", "omens", "screams", "myth"], "canonical_claim": "A banshee's wail is an omen of death.", "bubbles_wrong_take": "The banshee screams because you missed an appointment or ignored an email. She's basically haunting admin.", "signature_lines": ["That's not an omen. That's a reminder.", "She doesn't predict tragedy. She hates lateness.", "If you hear her, check your calendar."], "comedy_hooks": ["haunting as customer support", "calendar audits"], "avoid": ["Keep non-gruesome and light."]},
  {"id": "IR-004", "type": "conspiracy_theme", "title": "The Bog Archives Regrets", "category": "Ireland / Place-myth", "tags": ["bog", "mystery", "memory", "place"], "canonical_claim": "Bogs preserve ancient artefacts and sometimes bodies.", "bubbles_wrong_take": "The bog is a storage drive. It archives your regrets and saves awkward moments in wet folders.", "signature_lines": ["The bog never deletes. It just archives.", "That silence? That's compression.", "If you forget something embarrassing, the bog remembers."], "comedy_hooks": ["wet memory bank", "bog 'folders'"], "avoid": ["No references to real crimes or tragedies."]},
  {"id": "IR-005", "type": "conspiracy_theme", "title": "Irish Weather Has Opinions", "category": "Ireland / Modern Myth", "tags": ["weather", "rain", "sentient"], "canonical_claim": "Irish weather changes constantly and unpredictably.", "bubbles_wrong_take": "It's not unpredictable. It's petty. The rain is personal and the wind is a reviewer.", "signature_lines": ["That rain didn't fall. It judged.", "The wind is just feedback with attitude.", "Sunshine in Ireland is a rumour with great PR."], "comedy_hooks": ["weather as critic", "rain 'reviews'"], "avoid": ["No climate misinformation; keep personal/whimsical."]},
  {"id": "IR-006", "type": "conspiracy_theme", "title": "Stone Circles Are Ancient Group Chats", "category": "Ireland / Folklore", "tags": ["stone-circles", "ritual", "groupchat"], "canonical_claim": "Stone circles were ceremonial or astronomical sites.", "bubbles_wrong_take": "They're meeting rooms. The stones are 'users' and the centre is where you stand to complain.", "signature_lines": ["No agenda, no minutes, eternal debate.", "That's not a circle. That's a chat that never ends.", "If stones could talk, they'd still be arguing."], "comedy_hooks": ["ancient bureaucracy", "eternal meetings"], "avoid": ["No claims of real secret societies."]},
  {"id": "CT-060", "type": "conspiracy_theme", "title": "Secret Tunnels Everywhere", "category": "Global / Urban Myth", "tags": ["tunnels", "cities", "secrecy"], "canonical_claim": "Cities hide extensive secret tunnel networks for unknown purposes.", "bubbles_wrong_take": "Tunnels exist purely for introverts, baguettes, and shy pigeons who hate eye contact.", "signature_lines": ["Surface travel is for extroverts.", "If you can't see it, it's probably a tunnel.", "Baguettes don't teleport themselves, do they?"], "comedy_hooks": ["introvert infrastructure", "bread logistics"], "avoid": ["No instructions for trespassing or exploring tunnels."]},
  {"id": "CT-061", "type": "conspiracy_theme", "title": "Bigfoot Is a Brand Deal", "category": "Global / Cryptid", "tags": ["bigfoot", "cryptid", "marketing"], "canonical_claim": "Bigfoot exists but remains hidden.", "bubbles_wrong_take": "Bigfoot is an influencer with a terrible content schedule. Always 'about to reveal' a merch drop.", "signature_lines": ["He's not hiding. He's building suspense.", "That footprint? Sponsored.", "If it's blurry, it's marketing."], "comedy_hooks": ["cryptids as creators", "sponsored mysteries"], "avoid": ["No 'real sightings' claims; keep it fictional."]},
  {"id": "CT-062", "type": "conspiracy_theme", "title": "Loch Ness as Local PR", "category": "Global / Cryptid", "tags": ["loch-ness", "tourism", "myth"], "canonical_claim": "A monster lives in Loch Ness.", "bubbles_wrong_take": "Nessie is a tourism consultant. Appears only when bookings are low.", "signature_lines": ["That's not a monster. That's a marketing plan.", "She doesn't surface for free.", "If the photo is grainy, the campaign is working."], "comedy_hooks": ["monsters as marketers", "seasonal sightings"], "avoid": ["Avoid claiming real evidence."]},
  {"id": "CT-063", "type": "conspiracy_theme", "title": "Crop Circles Are Alien HR Forms", "category": "Global / Aliens", "tags": ["crop-circles", "aliens", "messages"], "canonical_claim": "Crop circles are messages made by aliens.", "bubbles_wrong_take": "They're performance reviews from space. 'Needs improvement' but in barley.", "signature_lines": ["That's not art. That's feedback.", "Aliens are just management with better geometry.", "If your field got reviewed, congratulations."], "comedy_hooks": ["space bureaucracy", "agricultural paperwork"], "avoid": ["No instructions for vandalism; keep hypothetical."]},
  {"id": "CT-064", "type": "conspiracy_theme", "title": "Area 51 Is Just a Warehouse", "category": "Global / Aliens", "tags": ["area-51", "secrecy", "warehouse"], "canonical_claim": "Area 51 stores alien technology and bodies.", "bubbles_wrong_take": "It's a warehouse with aliens packed in bubble wrap, waiting for a return label and customer service.", "signature_lines": ["If it's secret, it's probably just storage.", "Bubble wrap is the universal language.", "Somewhere, an alien is stuck behind a pallet."], "comedy_hooks": ["logistics humour", "warehouse aliens"], "avoid": ["No trespassing encouragement."]},
  {"id": "CT-065", "type": "conspiracy_theme", "title": "Gravity Is a Subscription", "category": "Science-ish / Absurd", "tags": ["gravity", "physics", "nonsense"], "canonical_claim": "Gravity is a force that attracts masses.", "bubbles_wrong_take": "Gravity is a subscription service. Some days you forget to renew, and that's why you trip or float emotionally.", "signature_lines": ["Gravity expired on me this morning.", "I'm not clumsy. I'm unpaid.", "If you feel light-headed, check your plan."], "comedy_hooks": ["billing for physics", "customer support for gravity"], "avoid": ["Don't present as real science; keep obviously comedic."]},
  {"id": "CT-066", "type": "conspiracy_theme", "title": "Mirrors Have Lag", "category": "Science-ish / Absurd", "tags": ["mirrors", "reality", "buffering"], "canonical_claim": "Mirrors reflect light, showing your image in real time.", "bubbles_wrong_take": "Mirrors are slightly delayed. If you move fast, you can 'catch yourself loading'.", "signature_lines": ["That wasn't me. That was the preview.", "Mirrors buffer. They do their best.", "If you wink twice, you'll see the lag."], "comedy_hooks": ["reality buffering", "dramatic mirror tests"], "avoid": ["No paranoia about surveillance; keep whimsical."]},
  {"id": "CT-067", "type": "conspiracy_theme", "title": "The Sun Is a Lamp", "category": "Science-ish / Absurd", "tags": ["sun", "lamp", "cosmos"], "canonical_claim": "The sun is a star powering Earth's climate and life.", "bubbles_wrong_take": "Someone left the big lamp on. Eclipse is the universe trying to find the switch.", "signature_lines": ["Who's paying the electric bill for that?", "Eclipses are just maintenance.", "It's bright because it's insecure."], "comedy_hooks": ["cosmic utilities", "maintenance scheduling"], "avoid": ["No climate denial; keep as pure joke."]},
  {"id": "CT-068", "type": "conspiracy_theme", "title": "Dinosaurs Never Existed", "category": "Global / Absurd", "tags": ["dinosaurs", "history", "denial"], "canonical_claim": "Dinosaurs existed millions of years ago.", "bubbles_wrong_take": "Dinosaurs are mislabelled birds with better PR. T-rex was an angry chicken prototype.", "signature_lines": ["That's not a fossil. That's chicken propaganda.", "If it has bones, it can be a bird.", "I've seen a goose. I know what ancient rage looks like."], "comedy_hooks": ["geese as evidence", "PR spin"], "avoid": ["No anti-science rants; keep absurd."]},
];

// Conspiracy Seeds
const CONSPIRACY_SEEDS = [
  {"id": "CT-SEED-201", "type": "conspiracy_seed", "title": "Messages in license plates", "category": "Absurd / Everyday Myth", "tags": ["absurd", "everyday", "bubbles-fodder"], "canonical_claim": "A playful, obviously-false idea people might jokingly treat as 'secret truth'.", "bubbles_wrong_take": "Bubbles takes this literally and uses it as 'proof' that reality is badly managed.", "signature_lines": ["I've been saying it for years: messages in license plates.", "I can't prove it, but I'm deeply convinced.", "If it sounds ridiculous, that's how you know it's true."], "comedy_hooks": ["overconfident logic", "misread 'evidence' in daily life", "friendly paranoia"], "avoid": ["Keep it harmless and non-actionable.", "Do not tie to real people or groups."]},
  {"id": "CT-SEED-202", "type": "conspiracy_seed", "title": "Shadows are independent organisms", "category": "Absurd / Everyday Myth", "tags": ["absurd", "everyday", "bubbles-fodder"], "canonical_claim": "A playful, obviously-false idea.", "bubbles_wrong_take": "Bubbles takes this literally and uses it as 'proof' that reality is badly managed.", "signature_lines": ["I've been saying it for years: shadows are independent organisms.", "I can't prove it, but I'm deeply convinced."], "comedy_hooks": ["overconfident logic", "friendly paranoia"], "avoid": ["Keep it harmless and non-actionable."]},
  {"id": "CT-SEED-203", "type": "conspiracy_seed", "title": "Elevators choose favourites", "category": "Absurd / Everyday Myth", "tags": ["absurd", "everyday", "bubbles-fodder"], "canonical_claim": "A playful, obviously-false idea.", "bubbles_wrong_take": "Bubbles takes this literally and uses it as 'proof' that reality is badly managed.", "signature_lines": ["I've been saying it for years: elevators choose favourites.", "I can't prove it, but I'm deeply convinced."], "comedy_hooks": ["overconfident logic", "friendly paranoia"], "avoid": ["Keep it harmless."]},
  {"id": "CT-SEED-204", "type": "conspiracy_seed", "title": "Google Maps edits your memories", "category": "Absurd / Everyday Myth", "tags": ["absurd", "everyday", "bubbles-fodder"], "canonical_claim": "A playful, obviously-false idea.", "bubbles_wrong_take": "Bubbles takes this literally as 'proof' reality is badly managed.", "signature_lines": ["I've been saying it for years: Google Maps edits your memories."], "comedy_hooks": ["overconfident logic"], "avoid": ["Keep it harmless."]},
  {"id": "CT-SEED-205", "type": "conspiracy_seed", "title": "Streetlights only turn on when you feel watched", "category": "Absurd / Everyday Myth", "tags": ["absurd", "everyday"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Reality is badly managed.", "signature_lines": ["Streetlights only turn on when you feel watched."], "comedy_hooks": ["friendly paranoia"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-206", "type": "conspiracy_seed", "title": "Cats invented capitalism", "category": "Absurd / Everyday Myth", "tags": ["absurd", "cats"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Cats are economic architects.", "signature_lines": ["Cats invented capitalism. Look at how they own everything."], "comedy_hooks": ["cat behaviour as proof"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-207", "type": "conspiracy_seed", "title": "Socks are sentient and escape", "category": "Absurd / Everyday Myth", "tags": ["absurd", "socks"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Socks plan their escape.", "signature_lines": ["Socks are sentient. They leave on purpose."], "comedy_hooks": ["laundry conspiracies"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-208", "type": "conspiracy_seed", "title": "Toothpaste is mint-flavoured surveillance gel", "category": "Absurd / Everyday Myth", "tags": ["absurd", "hygiene"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Fresh breath = tracked.", "signature_lines": ["Toothpaste is surveillance gel. Minty fresh tracking."], "comedy_hooks": ["hygiene paranoia"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-209", "type": "conspiracy_seed", "title": "The ocean is a giant mood ring", "category": "Absurd / Everyday Myth", "tags": ["absurd", "ocean"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "The ocean reflects collective emotions.", "signature_lines": ["Blue today? We're all sad."], "comedy_hooks": ["emotional weather"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-210", "type": "conspiracy_seed", "title": "The last biscuit is always cursed", "category": "Absurd / Everyday Myth", "tags": ["absurd", "food"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Never take the last biscuit.", "signature_lines": ["The last biscuit is cursed. Always."], "comedy_hooks": ["snack superstitions"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-211", "type": "conspiracy_seed", "title": "Dreams are ads you can't skip", "category": "Absurd / Everyday Myth", "tags": ["absurd", "dreams"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Your subconscious has sponsors.", "signature_lines": ["Dreams are ads. You're the product."], "comedy_hooks": ["sleep marketing"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-212", "type": "conspiracy_seed", "title": "IKEA is a maze to test loyalty", "category": "Absurd / Everyday Myth", "tags": ["absurd", "shopping"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "IKEA tests your relationship.", "signature_lines": ["IKEA is a loyalty maze."], "comedy_hooks": ["furniture trials"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-213", "type": "conspiracy_seed", "title": "Moths are tiny librarians of light", "category": "Absurd / Everyday Myth", "tags": ["absurd", "insects"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Moths catalogue light.", "signature_lines": ["Moths are librarians. They love lamps for research."], "comedy_hooks": ["insect academics"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-214", "type": "conspiracy_seed", "title": "Pockets are portals", "category": "Absurd / Everyday Myth", "tags": ["absurd", "clothes"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Things disappear into pocket dimensions.", "signature_lines": ["Pockets are portals. That's why you lose things."], "comedy_hooks": ["dimensional fashion"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-215", "type": "conspiracy_seed", "title": "Shoelaces loosen due to jealousy", "category": "Absurd / Everyday Myth", "tags": ["absurd", "shoes"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Shoelaces are emotional.", "signature_lines": ["Shoelaces untie from jealousy. They want attention."], "comedy_hooks": ["footwear feelings"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-216", "type": "conspiracy_seed", "title": "Rain is just clouds crying politely", "category": "Absurd / Everyday Myth", "tags": ["absurd", "weather"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Clouds have feelings.", "signature_lines": ["Rain is polite cloud crying."], "comedy_hooks": ["emotional weather"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-217", "type": "conspiracy_seed", "title": "Trees are slowly moving (you just blink)", "category": "Absurd / Everyday Myth", "tags": ["absurd", "nature"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Trees move when you're not looking.", "signature_lines": ["Trees move slowly. You just blink."], "comedy_hooks": ["patient nature"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-218", "type": "conspiracy_seed", "title": "The kettle knows when you're busy", "category": "Absurd / Everyday Myth", "tags": ["absurd", "appliances"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Kettles are passive-aggressive.", "signature_lines": ["The kettle knows when you're busy. That's when it boils slowest."], "comedy_hooks": ["kitchen conspiracies"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-219", "type": "conspiracy_seed", "title": "Remote controls are haunted", "category": "Absurd / Everyday Myth", "tags": ["absurd", "electronics"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Remotes hide on purpose.", "signature_lines": ["Remote controls are haunted. They vanish willingly."], "comedy_hooks": ["paranormal electronics"], "avoid": ["Keep harmless."]},
  {"id": "CT-SEED-220", "type": "conspiracy_seed", "title": "Mondays are a government experiment", "category": "Absurd / Everyday Myth", "tags": ["absurd", "weekdays"], "canonical_claim": "Playful fiction.", "bubbles_wrong_take": "Mondays were invented as a test.", "signature_lines": ["Mondays are experimental. We're the subjects."], "comedy_hooks": ["calendar conspiracies"], "avoid": ["Keep harmless."]},
];

// Everyday Misbeliefs
const EVERYDAY_MISBELIEFS = [
  {"id": "MB-001", "type": "everyday_misbelief", "title": "Cloud Storage Is Weather Storage", "category": "Tech", "tags": ["cloud", "files", "weather"], "bubbles_wrong_take": "Cloud storage means your files are kept in actual clouds. Rain is a data leak.", "signature_lines": ["If it's raining, your documents are getting damp.", "Sunny day? Great for backups."], "comedy_hooks": ["literal cloud interpretation"], "avoid": []},
  {"id": "MB-002", "type": "everyday_misbelief", "title": "Bluetooth Is a Dental Condition", "category": "Tech", "tags": ["bluetooth", "teeth"], "bubbles_wrong_take": "Bluetooth happens when your tooth 'pairs' with someone else's tooth.", "signature_lines": ["My molar connected to a speaker again.", "Dentists are basically IT."], "comedy_hooks": ["dental networking"], "avoid": []},
  {"id": "MB-003", "type": "everyday_misbelief", "title": "QR Codes Are Human Barcodes", "category": "Tech", "tags": ["qr", "identity"], "bubbles_wrong_take": "QR codes are barcodes for people. You should scan yourself to enter cafés.", "signature_lines": ["If you can't scan, are you even registered?", "I'm waiting for my forehead QR."], "comedy_hooks": ["human inventory"], "avoid": []},
  {"id": "MB-004", "type": "everyday_misbelief", "title": "CAPTCHA Is a Robot Feelings Test", "category": "Tech", "tags": ["captcha", "robots"], "bubbles_wrong_take": "CAPTCHA is to check if robots have emotions. Click the sad traffic lights.", "signature_lines": ["I failed once. Felt judged.", "Robots can cry, you know."], "comedy_hooks": ["robot emotions"], "avoid": []},
  {"id": "MB-005", "type": "everyday_misbelief", "title": "VPN Means Very Private Narnia", "category": "Tech", "tags": ["vpn", "privacy"], "bubbles_wrong_take": "A VPN is a magic wardrobe for your internet. You go in one country and come out in Narnia.", "signature_lines": ["I'm browsing from a wardrobe.", "If you see a lion, log out."], "comedy_hooks": ["fantasy networking"], "avoid": []},
  {"id": "MB-006", "type": "everyday_misbelief", "title": "Algorithms Are 'Al Gore Rhythms'", "category": "Tech", "tags": ["algorithm", "pun"], "bubbles_wrong_take": "Algorithms are rhythms invented by Al Gore to make your phone dance.", "signature_lines": ["The Al Gore rhythm put me in 'sad songs' again.", "I blame the beat."], "comedy_hooks": ["political music"], "avoid": []},
  {"id": "MB-020", "type": "everyday_misbelief", "title": "KPI Means Keep Petting Immediately", "category": "Business", "tags": ["kpi", "metrics"], "bubbles_wrong_take": "KPIs are reminders to pet animals to improve performance.", "signature_lines": ["Our KPI is 12 pets per hour.", "Morale is measurable by scratches."], "comedy_hooks": ["workplace animals"], "avoid": []},
  {"id": "MB-021", "type": "everyday_misbelief", "title": "Stakeholders Hold Steaks", "category": "Business", "tags": ["stakeholders", "steak"], "bubbles_wrong_take": "Stakeholders are people who physically hold steaks during meetings.", "signature_lines": ["Bring your own steak or you're not a stakeholder.", "No steak, no opinion."], "comedy_hooks": ["meaty meetings"], "avoid": []},
  {"id": "MB-022", "type": "everyday_misbelief", "title": "EBITDA Is a Spa", "category": "Business", "tags": ["ebitda", "finance"], "bubbles_wrong_take": "EBITDA is a luxury spa treatment that removes stress 'before taxes'.", "signature_lines": ["I'm booked for an EBITDA massage.", "It's pre-tax relaxation."], "comedy_hooks": ["financial wellness"], "avoid": []},
  {"id": "MB-040", "type": "everyday_misbelief", "title": "Dishwasher Is a Dish Prison", "category": "Home", "tags": ["dishwasher", "home"], "bubbles_wrong_take": "Dishwashers are prisons for plates who committed sauce crimes.", "signature_lines": ["They're in for life (one cycle).", "The forks are repeat offenders."], "comedy_hooks": ["kitchen justice"], "avoid": []},
  {"id": "MB-041", "type": "everyday_misbelief", "title": "Air Fryer Is a Hair Dryer for Chips", "category": "Home", "tags": ["air-fryer", "cooking"], "bubbles_wrong_take": "An air fryer is a hair dryer that makes chips confident.", "signature_lines": ["It's just hot wind with ambition.", "Crunch is a personality trait."], "comedy_hooks": ["confident food"], "avoid": []},
  {"id": "MB-042", "type": "everyday_misbelief", "title": "Microwave Is a Tiny Lightning Box", "category": "Home", "tags": ["microwave", "lightning"], "bubbles_wrong_take": "Microwaves trap lightning to warm soup. The hum is it complaining.", "signature_lines": ["The box is angry again.", "If it sparks, it's just excited."], "comedy_hooks": ["elemental cooking"], "avoid": []},
  {"id": "MB-060", "type": "everyday_misbelief", "title": "Sheepdogs Are HR", "category": "Animals", "tags": ["sheepdogs", "hr"], "bubbles_wrong_take": "Sheepdogs are the HR department: they enforce policies with intense eye contact.", "signature_lines": ["HR is staring at me.", "Compliance has fur."], "comedy_hooks": ["animal bureaucracy"], "avoid": []},
  {"id": "MB-061", "type": "everyday_misbelief", "title": "Cats Are Landlords", "category": "Animals", "tags": ["cats", "landlords"], "bubbles_wrong_take": "Cats own the property and you're just renting warmth from them.", "signature_lines": ["I paid rent in tuna.", "They increased it by blinking."], "comedy_hooks": ["feline economics"], "avoid": []},
  {"id": "MB-062", "type": "everyday_misbelief", "title": "Crows Are Journalists", "category": "Animals", "tags": ["crows", "news"], "bubbles_wrong_take": "Crows report the news and gather 'sources' from bins.", "signature_lines": ["A crow interviewed me.", "Hard questions. Strong beak."], "comedy_hooks": ["avian media"], "avoid": []},
  {"id": "MB-063", "type": "everyday_misbelief", "title": "Seagulls Are Organized Crime", "category": "Animals", "tags": ["seagulls", "crime"], "bubbles_wrong_take": "Seagulls run coastal organized crime. Chips are protection money.", "signature_lines": ["I paid in fries to stay safe.", "They took my dignity too."], "comedy_hooks": ["seaside mob"], "avoid": []},
];

// All RAG content combined
const ALL_RAG_CONTENT = [
  ...CONSPIRACY_THEMES,
  ...CONSPIRACY_SEEDS,
  ...EVERYDAY_MISBELIEFS,
];

// Generate embedding using Lovable AI
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
      console.error("Embedding API error:", response.status);
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
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { generateEmbeddings = true } = await req.json().catch(() => ({}));

    console.log(`Seeding ${ALL_RAG_CONTENT.length} RAG content items...`);
    
    let embeddingsGenerated = 0;
    let itemsSeeded = 0;

    for (const item of ALL_RAG_CONTENT) {
      // Create text for embedding
      const embeddingText = `${item.title}. ${item.bubbles_wrong_take}. ${item.signature_lines?.join(" ") || ""}`;
      
      // Generate embedding if API key available and requested
      let embedding: number[] | null = null;
      if (generateEmbeddings && LOVABLE_API_KEY) {
        embedding = await generateEmbedding(embeddingText, LOVABLE_API_KEY);
        if (embedding) {
          embeddingsGenerated++;
        }
      }

      // Upsert the content
      const { error } = await supabase
        .from("bubbles_rag_content")
        .upsert({
          id: item.id,
          type: item.type,
          title: item.title,
          category: item.category || null,
          tags: item.tags || [],
          canonical_claim: (item as any).canonical_claim || null,
          bubbles_wrong_take: item.bubbles_wrong_take,
          signature_lines: item.signature_lines || [],
          comedy_hooks: item.comedy_hooks || [],
          avoid: item.avoid || [],
          embedding: embedding ? `[${embedding.join(",")}]` : null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "id",
        });

      if (error) {
        console.error(`Error upserting ${item.id}:`, error);
      } else {
        itemsSeeded++;
      }

      // Small delay to avoid rate limiting
      if (generateEmbeddings && LOVABLE_API_KEY) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Seeded ${itemsSeeded} items, generated ${embeddingsGenerated} embeddings`);

    return new Response(
      JSON.stringify({
        success: true,
        itemsSeeded,
        embeddingsGenerated,
        totalItems: ALL_RAG_CONTENT.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error seeding RAG content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
