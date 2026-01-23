import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { RecipesHero } from "@/components/RecipesHero";
import { ThoughtBubble } from "@/components/ThoughtBubble";
import { AnimatedOnView } from "@/components/AnimatedText";
import { CrossLinks } from "@/components/CrossLinks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Sparkles } from "lucide-react";
import { useOgImage } from "@/hooks/useOgImage";

interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  servings: string;
  difficulty: "Easy" | "Medium" | "Impossible";
  ingredients: string[];
  instructions: string[];
  chefNote: string;
  tags: string[];
}

const RECIPES: Recipe[] = [
  {
    id: "morning-meadow-salad",
    title: "Morning Meadow Salad",
    description: "A refreshing breakfast dish featuring the finest dew-kissed grass from the east side of the field.",
    prepTime: "All morning",
    servings: "1 sheep",
    difficulty: "Easy",
    ingredients: [
      "200g fresh meadow grass (dawn harvest only)",
      "A handful of clover for sweetness",
      "3 dandelion heads (unopened)",
      "Morning dew (to taste)",
      "One confused butterfly (optional garnish)",
    ],
    instructions: [
      "Wake up before the farmer. This is crucial.",
      "Locate the grass that was in shadow until exactly 6:47am.",
      "Eat it directly from the ground. Plates are for humans.",
      "The butterfly will leave. This is normal.",
    ],
    chefNote: "Many chefs would tell you to wash the grass. They are wrong. Dirt adds minerals.",
    tags: ["breakfast", "raw", "field-to-mouth"],
  },
  {
    id: "stone-wall-tartare",
    title: "Stone Wall Tartare",
    description: "A sophisticated dish highlighting the moss that grows exclusively on the north-facing stones.",
    prepTime: "Depends on the wall",
    servings: "2-3 sheep",
    difficulty: "Medium",
    ingredients: [
      "150g aged stone moss (minimum 3 years)",
      "A selection of wall lichens",
      "Rainwater reduction",
      "Crumbled limestone for texture",
      "One blade of grass per serving (for presentation)",
    ],
    instructions: [
      "Find a wall that looks like it has stories to tell.",
      "The moss should come off reluctantly. Easy moss is bad moss.",
      "Do not ask the farmer about the wall. They become suspicious.",
      "Serve immediately. Or later. Time is a human concept.",
    ],
    chefNote: "I once saw a French chef do something similar. He was using 'herbs'. Amateur.",
    tags: ["gourmet", "foraged", "texture-forward"],
  },
  {
    id: "puddle-consomme",
    title: "Puddle Consommé",
    description: "A clear, elegant broth made from only the most distinguished puddles.",
    prepTime: "2 days after rain",
    servings: "Unlimited",
    difficulty: "Easy",
    ingredients: [
      "1 medium puddle (avoid tractor tracks)",
      "Grass clippings for body",
      "A single fallen leaf",
      "Patience",
    ],
    instructions: [
      "Wait for rain. You cannot rush this.",
      "Find a puddle with good light exposure.",
      "Let it sit for exactly two days. Not one. Not three.",
      "Drink before the farmer 'fixes' the drainage again.",
    ],
    chefNote: "The French call this 'eau de flaque'. I call it lunch.",
    tags: ["liquid", "seasonal", "hydrating"],
  },
  {
    id: "forbidden-garden-risotto",
    title: "Forbidden Garden Risotto",
    description: "An ambitious dish featuring vegetables from the garden you're absolutely not supposed to enter.",
    prepTime: "As fast as possible",
    servings: "1 sheep (worth it)",
    difficulty: "Impossible",
    ingredients: [
      "Whatever you can grab in 30 seconds",
      "Lettuce (they grow so much, they won't notice)",
      "Carrot tops (the carrots are too deep anyway)",
      "Adrenaline",
    ],
    instructions: [
      "Wait until the farmer goes inside for tea.",
      "The dog is not your friend. Remember this.",
      "Move with purpose. Hesitation is for prey.",
      "If caught, look confused. You are 'just a sheep'.",
    ],
    chefNote: "The risk is the seasoning. Also, I am banned from the garden now.",
    tags: ["adventure", "speed-dining", "technically-illegal"],
  },
  {
    id: "sunset-hay-reduction",
    title: "Sunset Hay Reduction",
    description: "A deeply philosophical dish that pairs aged hay with existential contemplation.",
    prepTime: "One sunset",
    servings: "Your soul",
    difficulty: "Medium",
    ingredients: [
      "Hay from the back of the barn (front hay is too eager)",
      "The color orange (from the sky)",
      "One memory of summer",
      "Silence",
    ],
    instructions: [
      "Position yourself facing west.",
      "Begin eating as the sun touches the horizon.",
      "Think about nothing. Then think about grass.",
      "Finish when the stars appear. Or earlier. You're a sheep, not a philosopher.",
    ],
    chefNote: "Humans eat 'dinner' at tables. How lonely that must be.",
    tags: ["meditative", "evening", "barn-adjacent"],
  },
  {
    id: "cloud-watching-ceviche",
    title: "Cloud Watching Ceviche",
    description: "A refreshing midday dish that requires looking at the sky while eating.",
    prepTime: "Depends on cloud coverage",
    servings: "Variable",
    difficulty: "Easy",
    ingredients: [
      "Fresh clover, shredded",
      "Wild mint (if you can find it before the goats)",
      "A cloud shaped like something",
      "Mild existential wonder",
    ],
    instructions: [
      "Lie down in the field. This is mandatory.",
      "Identify a cloud that looks interesting.",
      "Eat the clover while maintaining eye contact with the cloud.",
      "If the cloud moves, follow it. Within reason.",
    ],
    chefNote: "The cloud is not an ingredient. But also it is. Cooking is complicated.",
    tags: ["relaxing", "weather-dependent", "sky-to-table"],
  },
];

const difficultyColors = {
  Easy: "bg-green-500/20 text-green-700 dark:text-green-400",
  Medium: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
  Impossible: "bg-red-500/20 text-red-700 dark:text-red-400",
};

export default function Recipes() {
  const { ogImageUrl, siteUrl } = useOgImage("og-home.jpg");

  return (
    <Layout>
      <Helmet>
        <title>Recipes by Bubbles | Grass-Forward Cuisine</title>
        <meta name="description" content="Discover Bubbles' collection of confidently incorrect recipes. Grass-based, field-tested, occasionally edible. From the kitchens of Wicklow." />
        <meta property="og:title" content="Recipes by Bubbles | Grass-Forward Cuisine" />
        <meta property="og:description" content="Grass-based, field-tested, occasionally edible. Culinary wisdom from the bogs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/recipes`} />
        <meta property="og:image" content={ogImageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={`${siteUrl}/recipes`} />
      </Helmet>

      {/* Hero */}
      <section className="-mx-4 mb-12">
        <RecipesHero
          title="Recipes by Bubbles"
          subtitle="Grass-forward cuisine from the fields of Wicklow. Each dish has been field-tested. Results may vary."
        />
      </section>

      {/* Disclaimer */}
      <section className="py-8 border-b border-border">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <ThoughtBubble mode="concerned" size="sm">
              <p className="text-sm">
                <strong>Kitchen Safety Notice:</strong> These recipes have not been tested by anyone with hands. 
                If you are a human, please consult someone who understands fire before attempting any cooking.
              </p>
            </ThoughtBubble>
          </div>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-16 md:py-24">
        <div className="container">
          <AnimatedOnView className="mb-12 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Today's Specials
            </h2>
            <p className="text-muted-foreground">
              Curated by hooves. Eaten by hooves. Reviewed by hooves.
            </p>
          </AnimatedOnView>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {RECIPES.map((recipe, index) => (
              <div
                key={recipe.id}
                className="h-full animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={difficultyColors[recipe.difficulty]}
                      >
                        {recipe.difficulty}
                      </Badge>
                      <ChefHat className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="font-display text-xl">
                      {recipe.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {recipe.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    {/* Meta info */}
                    <div className="flex gap-4 mb-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {recipe.servings}
                      </span>
                    </div>

                    {/* Ingredients preview */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Ingredients
                      </h4>
                      <ul className="text-sm space-y-1">
                        {recipe.ingredients.slice(0, 3).map((ing, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{ing}</span>
                          </li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li className="text-muted-foreground text-xs">
                            +{recipe.ingredients.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Chef's note */}
                    <div className="mt-auto pt-4 border-t border-border">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs italic text-muted-foreground">
                          "{recipe.chefNote}"
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cooking Philosophy */}
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <AnimatedOnView className="text-center mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                My Culinary Philosophy
              </h2>
              <p className="text-muted-foreground">
                After years of eating in the field, I have developed strong opinions about food.
              </p>
            </AnimatedOnView>

            <div className="space-y-6">
              <ThoughtBubble mode="innocent" size="lg">
                <h3 className="font-display font-bold mb-2">On Ingredients</h3>
                <p>
                  "The best ingredients are the ones closest to your mouth. This is why I eat 
                  where I stand. Restaurants make you walk to the food. Inefficient."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="concerned" size="lg">
                <h3 className="font-display font-bold mb-2">On Cooking Methods</h3>
                <p>
                  "Humans use fire to cook. But fire is hot and frightening. I have developed 
                  an alternative: not cooking. My food is 'ambient temperature' and 'naturally prepared'."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="triggered" size="lg">
                <h3 className="font-display font-bold mb-2">On Food Critics</h3>
                <p>
                  "A human once told me grass is 'not a meal'. This same human eats lettuce, 
                  which is just unsuccessful grass. I will not be taking feedback."
                </p>
              </ThoughtBubble>

              <ThoughtBubble mode="savage" size="lg">
                <h3 className="font-display font-bold mb-2">On Fine Dining</h3>
                <p>
                  "I have seen the farmer's wife make 'salad'. She puts grass in a bowl and 
                  adds liquid. Amateurs. Real chefs eat directly from the source."
                </p>
              </ThoughtBubble>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Hungry for More Wisdom?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            These recipes are just the beginning. Explore more of my confidently incorrect opinions.
          </p>
          
          <CrossLinks 
            exclude={["/recipes"]} 
            maxLinks={4}
            titleKey="crossLinks.titleHungry"
          />
        </div>
      </section>
    </Layout>
  );
}
