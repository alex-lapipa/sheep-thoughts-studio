import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { PageHeroWithBubbles } from "@/components/PageHeroWithBubbles";
import { BubblesQuiz } from "@/components/BubblesQuiz";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, Trophy, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { useOgImage } from "@/hooks/useOgImage";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Quiz() {
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    const played = localStorage.getItem("bubbles-quiz-total-played");
    const score = localStorage.getItem("bubbles-quiz-best-score");
    const streak = localStorage.getItem("bubbles-quiz-best-streak");
    
    if (played) setTotalPlayed(parseInt(played, 10));
    if (score) setBestScore(parseInt(score, 10));
    if (streak) setBestStreak(parseInt(streak, 10));
  }, []);

  const handleQuizComplete = (score: number, total: number) => {
    const newTotal = totalPlayed + 1;
    setTotalPlayed(newTotal);
    localStorage.setItem("bubbles-quiz-total-played", String(newTotal));
    
    const percentage = Math.round((score / total) * 100);
    if (percentage > bestScore) {
      setBestScore(percentage);
      localStorage.setItem("bubbles-quiz-best-score", String(percentage));
    }
  };

  const { ogImageUrl, siteUrl } = useOgImage("og-facts.jpg");

  return (
    <Layout>
      <Helmet>
        <title>Quiz Mode | Spot the Bubbles Logic</title>
        <meta 
          name="description" 
          content="Test your ability to spot Bubbles' confidently wrong interpretations! Can you tell the difference between real facts and sheep logic?" 
        />
        <meta property="og:title" content="Quiz Mode | Bubbles the Sheep" />
        <meta property="og:description" content="Can you spot which interpretation is Bubbles' confidently wrong one?" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={`${siteUrl}/quiz`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <section className="-mx-4 mb-12">
        <PageHeroWithBubbles
          title="Spot the Bubbles Logic"
          subtitle="Three interpretations. One is confidently wrong. Can you identify which answer came from a sheep who learned everything from overheard tourist conversations?"
          bubbleSize="md"
        />
      </section>

      <div className="container mx-auto px-4 max-w-2xl">
        {/* Stats Bar */}
        {totalPlayed > 0 && (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{totalPlayed} quizzes played</span>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{bestScore}% best score</span>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">{bestStreak} best streak</span>
              </div>
            </Card>
          </div>
        )}

        {/* Quiz Component */}
        <BubblesQuiz questionCount={5} onComplete={handleQuizComplete} />

        {/* How it works */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              How It Works
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">1</Badge>
                <p>You'll see a topic or question with three possible interpretations</p>
              </div>
              <div className="flex gap-3">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">2</Badge>
                <p>Two are factually correct explanations from reliable sources</p>
              </div>
              <div className="flex gap-3">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">3</Badge>
                <p>One is Bubbles' confidently wrong interpretation — your job is to find it!</p>
              </div>
              <div className="flex gap-3">
                <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center shrink-0">4</Badge>
                <p>You have 15 seconds per question. Build your streak for bragging rights!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Links */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/explains">
            <Button variant="outline" className="font-display">
              Ask Bubbles to Explain Things
            </Button>
          </Link>
          <Link to="/achievements">
            <Button variant="outline" className="font-display">
              View Your Achievements
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
