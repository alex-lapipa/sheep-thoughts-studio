import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Rocket, Wrench, Bug, Rss } from "lucide-react";
import { CHANGELOG, WhatsNewEntry } from "@/hooks/useWhatsNew";
import { format, parseISO } from "date-fns";

const siteUrl = "https://sheep-thoughts-studio.lovable.app";
const rssUrl = "https://iteckeoeowgguhgrpcnm.supabase.co/functions/v1/changelog-rss";

const getCategoryIcon = (category?: WhatsNewEntry['category']) => {
  switch (category) {
    case 'major':
      return <Rocket className="w-5 h-5" />;
    case 'minor':
      return <Sparkles className="w-5 h-5" />;
    case 'patch':
      return <Bug className="w-5 h-5" />;
    default:
      return <Wrench className="w-5 h-5" />;
  }
};

const getCategoryColor = (category?: WhatsNewEntry['category']) => {
  switch (category) {
    case 'major':
      return 'bg-primary text-primary-foreground';
    case 'minor':
      return 'bg-accent text-accent-foreground';
    case 'patch':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

const getCategoryLabel = (category?: WhatsNewEntry['category']) => {
  switch (category) {
    case 'major':
      return 'Major Release';
    case 'minor':
      return 'Feature Update';
    case 'patch':
      return 'Bug Fix';
    default:
      return 'Update';
  }
};

const WhatsNew = () => {
  return (
    <Layout>
      <Helmet>
        <title>What's New | Bubbles the Sheep - Changelog</title>
        <meta name="description" content="See what's new with Bubbles the Sheep! Full changelog of features, improvements, and updates." />
        <meta property="og:title" content="What's New | Bubbles the Sheep" />
        <meta property="og:description" content="The latest updates from a sheep who is always improving (and always wrong)." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/whats-new`} />
        <link rel="canonical" href={`${siteUrl}/whats-new`} />
        <link rel="alternate" type="application/rss+xml" title="Bubbles the Sheep Changelog" href={rssUrl} />
      </Helmet>

      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Changelog</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            What's New
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            A complete history of improvements, features, and updates. 
            Bubbles is always learning new things (and getting them wrong in new ways).
          </p>
          <a href={rssUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <Rss className="w-4 h-4" />
              Subscribe via RSS
            </Button>
          </a>
        </div>

        {/* Bubbles' Note */}
        <Card className="mb-10 bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-full shrink-0">
                <Sparkles className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-2">A Note From Bubbles</h3>
                <p className="text-muted-foreground">
                  I keep careful track of all my improvements. The humans call this a "changelog" 
                  which I believe is a log made from tree bark where you write down changes. 
                  Very environmentally friendly. I've digitized it for your convenience.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          <div className="space-y-8">
            {CHANGELOG.map((entry, index) => (
              <div key={entry.version} className="relative">
                {/* Timeline dot - desktop only */}
                <div className="absolute left-6 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-4 border-background hidden md:block" 
                     style={{ top: '2rem' }} />

                <Card className={`md:ml-12 ${index === 0 ? 'ring-2 ring-primary/20' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Badge className={getCategoryColor(entry.category)}>
                        <span className="mr-1.5">{getCategoryIcon(entry.category)}</span>
                        {getCategoryLabel(entry.category)}
                      </Badge>
                      <Badge variant="outline" className="font-mono">
                        v{entry.version}
                      </Badge>
                      {index === 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl font-display flex items-center gap-2">
                      {entry.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {format(parseISO(entry.date), 'MMMM d, yyyy')}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {entry.highlights && entry.highlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {entry.highlights.map((highlight) => (
                          <Badge key={highlight} variant="secondary" className="text-xs">
                            {highlight}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <ul className="space-y-2">
                      {entry.features.map((feature, featureIndex) => (
                        <li 
                          key={featureIndex}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-primary mt-0.5">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <Card className="mt-12 bg-muted/30">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              That's the complete history so far. More updates coming soon — 
              I have many more incorrect opinions to share with the world.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              — Bubbles 🐑
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default WhatsNew;
