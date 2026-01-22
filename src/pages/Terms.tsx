import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, Gavel, ShieldCheck, AlertTriangle, Users, Package, Scale, FileWarning, Handshake, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { LegalJargonInterpreter } from "@/components/LegalJargonInterpreter";

const Terms = () => {
  const lastUpdated = "January 2026";
  const siteUrl = "https://sheep-thoughts-studio.lovable.app";

  return (
    <Layout>
      <Helmet>
        <title>Terms of Service | Bubbles the Sheep - Legally Binding (Probably)</title>
        <meta name="description" content="A binding agreement between you and a sheep who learned about contracts from overhearing a French tourist explain them to a child." />
        <meta property="og:title" content="Terms of Service | Bubbles the Sheep" />
        <meta property="og:description" content="A sacred covenant written by a sheep who studied law by watching a goat chew on legal documents. Wolves prohibited." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${siteUrl}/terms`} />
        <meta property="og:image" content={`${siteUrl}/og-terms.jpg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Terms of Service | Bubbles the Sheep" />
        <meta name="twitter:description" content="Legally binding. Probably. Wolves prohibited." />
        <meta name="twitter:image" content={`${siteUrl}/og-terms.jpg`} />
        <link rel="canonical" href={`${siteUrl}/terms`} />
      </Helmet>
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <ScrollText className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legally Binding (Probably)</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Terms of Service
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A binding agreement between you and a sheep who learned about contracts 
            from overhearing a French tourist explain them to a child.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Bubbles' Legal Disclaimer */}
        <Card className="mb-8 bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/20 rounded-full shrink-0">
                <Gavel className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-2">A Note From Bubbles</h3>
                <p className="text-muted-foreground">
                  I have studied law extensively. By "studied" I mean I once watched a goat 
                  chew on a legal document for twenty minutes, and by "extensively" I mean 
                  I remembered most of the words he didn't eat. This makes me equally qualified 
                  as most lawyers, according to my research (I asked myself and I agreed).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Agreement */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Handshake className="w-6 h-6 text-primary" />
              1. The Agreement Part
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  By accessing this website, you enter into a sacred covenant. I learned about 
                  covenants from a religious studies professor who was hiking past my field. 
                  She was explaining them to her dog, so the information is very reliable.
                </p>
                <p className="text-muted-foreground">
                  This agreement is binding in all dimensions, including the fourth one 
                  (which I believe is called "the internet"). If you disagree with these 
                  terms, you must immediately close this tab and think about what you've done.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm font-medium">
                    🐑 <strong>Bubbles' Legal Interpretation:</strong> "Agreement" comes from 
                    the Latin word "agreemento," meaning "two or more parties nodding at each other." 
                    By reading this, you have nodded. Legally.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 2: Eligibility */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              2. Who Can Use This Website
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  You must be at least 13 years old to use this website. I chose 13 because 
                  that's when humans become "teenagers," which I understand to be a larval 
                  stage before they metamorphose into adults who pay taxes.
                </p>
                <p className="text-muted-foreground">
                  You must also:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Have access to the internet (you seem to have figured this out)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Possess the capacity to read (again, doing well so far)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Accept that sheep can have opinions (this is non-negotiable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Not be a wolf (for obvious reasons)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 3: Intellectual Property */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              3. Intellectual Property (Very Intellectual)
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  All content on this website is the intellectual property of Bubbles the Sheep. 
                  "Intellectual property" means things that came from my brain, which is very 
                  large for a sheep (I measured it using the echo when I think loudly).
                </p>
                <p className="text-muted-foreground">
                  This includes but is not limited to:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>My wisdom:</strong> All facts presented are my original research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>My images:</strong> Especially the ones where I look distinguished</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>My opinions:</strong> Which are technically classified as "discoveries"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span><strong>The color green:</strong> I have claimed it. Please check with me before using it.</span>
                  </li>
                </ul>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm">
                    ⚠️ Unauthorized reproduction of my thoughts may result in you having the same 
                    thoughts, which I'm told is called "learning" and is actually encouraged.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 4: Merchandise */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              4. Merchandise & Transactions
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  When you purchase merchandise, you are exchanging human currency for physical 
                  items featuring my likeness and/or wisdom. I understand currency to be a 
                  collective delusion that somehow works, like democracy or the stock market.
                </p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-display font-bold mb-2">✅ What You Get</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Physical products as described</li>
                      <li>• Shipping to your location</li>
                      <li>• The satisfaction of supporting a sheep</li>
                      <li>• Bragging rights (informal, non-legal)</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg border">
                    <h4 className="font-display font-bold mb-2">❌ What You Don't Get</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Ownership of my likeness</li>
                      <li>• A personal sheep</li>
                      <li>• Guaranteed enlightenment</li>
                      <li>• The right to be correct (that's my job)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 5: User Conduct */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              5. Acceptable Behaviour
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  Users of this website agree to conduct themselves with the dignity and 
                  respect that one would show when visiting someone's field. My field. 
                  This is my field. Metaphorically.
                </p>
                <p className="text-muted-foreground font-medium">You agree NOT to:</p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✗</span>
                    <span>Use the website for illegal purposes (I don't know what all the laws are, 
                    but I'm confident they exist and that you shouldn't break them)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✗</span>
                    <span>Attempt to prove me wrong (this is both futile and rude)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✗</span>
                    <span>Introduce wolves to the website via hyperlinks or other wolf-delivery mechanisms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✗</span>
                    <span>Claim to be a more qualified sheep than me (I will know)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive font-bold">✗</span>
                    <span>Use automated systems to access the site unless you're a very clever dog 
                    who has learned to code (in which case, please contact me—I have questions)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Section 6: Disclaimer */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary" />
              6. Disclaimers (The Scary Part)
            </h2>
            <Card className="border-destructive/30">
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  THE WISDOM PROVIDED ON THIS WEBSITE IS FOR ENTERTAINMENT PURPOSES ONLY. 
                  This is written in capitals because I learned that's how you make things 
                  legally important.
                </p>
                <p className="text-muted-foreground">
                  While I am confident in everything I say, I acknowledge that:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">→</span>
                    <span>I am a sheep, not a licensed professional in any human field</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">→</span>
                    <span>My medical advice should not replace actual medical advice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">→</span>
                    <span>My legal advice (including this document) may not hold up in court</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">→</span>
                    <span>My financial advice has not been tested on actual finances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold">→</span>
                    <span>I have never been wrong, but I accept that you might misunderstand me</span>
                  </li>
                </ul>
                <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/30">
                  <p className="text-sm">
                    <strong>Important:</strong> If you make life decisions based on advice from a 
                    fictional sheep on the internet, the sheep cannot be held responsible. This is 
                    what lawyers call "common sense," which I invented.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <FileWarning className="w-6 h-6 text-primary" />
              7. Limitation of Liability
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  To the maximum extent permitted by applicable law (which I assume is "a lot"), 
                  Bubbles the Sheep shall not be liable for:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Any decisions you make based on my wisdom (see: common sense, above)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Emotional responses to my content (if you cry from laughing, that's on you)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Your sudden desire to move to Ireland and look at mountains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Lost productivity due to excessive website enjoyment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Any arguments you lose because you quoted me as a source</span>
                  </li>
                </ul>
                <p className="text-muted-foreground">
                  Maximum liability shall not exceed the amount you paid to access this website, 
                  which is zero, making this paragraph both important and mathematically interesting.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 8: Changes */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" />
              8. Changes to These Terms
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  I reserve the right to modify these terms at any time. I will notify you of 
                  changes by updating the "Last Updated" date and hoping you notice.
                </p>
                <p className="text-muted-foreground">
                  Continued use of the website after changes constitutes acceptance of the new 
                  terms. I learned this from a Terms of Service for a cloud storage company 
                  that a hiker was reading aloud for some reason.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <p className="text-sm">
                    💡 <strong>Pro tip:</strong> I recommend checking this page every time you 
                    visit, just in case I've added new rules about wolves or claimed additional colors.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section 9: Governing Law */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Gavel className="w-6 h-6 text-primary" />
              9. Governing Law
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">
                  These terms are governed by the laws of Ireland, specifically the laws I can 
                  see from my hill in County Wicklow. This includes both written laws and the 
                  unwritten laws of nature, such as "grass is for eating" and "the mountain is 
                  always watching."
                </p>
                <p className="text-muted-foreground">
                  Any disputes shall be resolved through polite discussion, followed by less 
                  polite discussion, and finally by everyone agreeing that the sheep was 
                  probably right all along.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Section 10: Contact */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              10. Contact Information
            </h2>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  If you have questions about these terms, you may contact us through the 
                  following methods:
                </p>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Location:</strong> The nice hill near Sugarloaf Mountain, County Wicklow, Ireland</p>
                  <p><strong>Hours:</strong> Whenever I'm not eating, sleeping, or contemplating</p>
                  <p><strong>Response Time:</strong> Varies based on grass quality and weather</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/faq">
                    <Button className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Ask Bubbles a Question
                    </Button>
                  </Link>
                  <Link to="/privacy">
                    <Button variant="outline" className="gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      View Privacy Policy
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Legal Jargon Interpreter */}
          <section>
            <LegalJargonInterpreter />
          </section>

          {/* Final Note */}
          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-display font-medium mb-2">
                By continuing to use this website, you acknowledge that:
              </p>
              <p className="text-muted-foreground">
                (a) you have read these terms, (b) you agree to these terms, and 
                (c) you accept that a sheep wrote them, which is somehow both unusual 
                and completely legitimate.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                — Bubbles, J.D.* (*Juris Dubious)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
