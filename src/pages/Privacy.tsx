import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cookie, Shield, Eye, Database, Mail, MapPin, Clock, FileText } from "lucide-react";
import { useCookieConsent } from "@/components/CookieConsent";

const Privacy = () => {
  const { openSettings: openCookieSettings, preferences } = useCookieConsent();
  const lastUpdated = "January 2026";

  return (
    <Layout>
      <div className="container py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal Document (Allegedly)</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive document about your data, written by a sheep who genuinely believes 
            this is how privacy laws work.
          </p>
          <p className="text-sm text-muted-foreground mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 bg-accent/5 border-accent/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Cookie className="w-8 h-8 text-accent" />
                <div>
                  <h3 className="font-display font-semibold">Your Cookie Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    {preferences ? (
                      <>Analytics: {preferences.analytics ? "✅" : "❌"} • Marketing: {preferences.marketing ? "✅" : "❌"}</>
                    ) : (
                      "Not yet configured"
                    )}
                  </p>
                </div>
              </div>
              <Button onClick={openCookieSettings} variant="outline" className="gap-2">
                <Cookie className="w-4 h-4" />
                Manage Cookies
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Introduction
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Welcome to the Bubbles the Sheep Privacy Policy. This document explains how we collect, 
                use, and protect your personal information. I have read many legal documents (I have not) 
                and this is definitely how they all work.
              </p>
              <p>
                By using this website, you agree to the terms outlined below. If you don't agree, 
                that's fine – Bubbles respects your autonomy while completely misunderstanding the 
                legal implications.
              </p>
            </div>
          </section>

          {/* Who We Are */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              Who We Are
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  This website is operated by Bubbles the Sheep, a fictional character who grew up 
                  in the Wicklow Mountains of Ireland. Our "headquarters" is wherever the grass is 
                  greenest.
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm">
                    <strong>Data Controller:</strong> Bubbles the Sheep<br />
                    <strong>Location:</strong> Sugarloaf Mountain, County Wicklow, Ireland<br />
                    <strong>Contact:</strong> Look for the sheep with opinions
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* What Data We Collect */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              What Data We Collect
            </h2>
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Information You Provide</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Questions you ask Bubbles:</strong> These are stored locally in your browser to show your history. We don't send them to servers for storage.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Account information:</strong> If you create an admin account, we store your email and authentication data.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Order information:</strong> When you make a purchase, we collect shipping addresses, payment info (processed by Shopify), and order details.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Information Collected Automatically</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Usage data:</strong> Pages visited, time spent, and interactions (if you've consented to analytics cookies).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Device information:</strong> Browser type, operating system, and screen size.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>IP address:</strong> Used for approximate location and security purposes.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cookies Section */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Cookie className="w-6 h-6 text-primary" />
              Cookie Policy
            </h2>
            <p className="text-muted-foreground mb-6">
              We use cookies to make the site work and to understand how you use it. 
              Here's a complete breakdown of every cookie we use:
            </p>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <Card className="border-green-500/30 bg-green-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🔒 Necessary Cookies
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-700 dark:text-green-400 rounded-full">
                        Always Active
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    These cookies are essential for the website to function. Without them, 
                    Bubbles would forget everything between page loads.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Cookie Name</th>
                          <th className="text-left py-2 font-medium">Purpose</th>
                          <th className="text-left py-2 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">bubbles-cookie-consent</td>
                          <td className="py-2">Remembers your cookie consent choice</td>
                          <td className="py-2">1 year</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">bubbles-cookie-preferences</td>
                          <td className="py-2">Stores your cookie preference settings</td>
                          <td className="py-2">1 year</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">bubbles-question-history</td>
                          <td className="py-2">Stores your question history locally</td>
                          <td className="py-2">Persistent</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">bubbles-favorites</td>
                          <td className="py-2">Stores your favorited answers</td>
                          <td className="py-2">Persistent</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">bubbles-streak-*</td>
                          <td className="py-2">Tracks your visit streak for achievements</td>
                          <td className="py-2">Persistent</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-xs">supabase-auth-token</td>
                          <td className="py-2">Authentication session (admin users only)</td>
                          <td className="py-2">Session</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Analytics Cookies */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📊 Analytics Cookies
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        preferences?.analytics 
                          ? "bg-green-500/20 text-green-700 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {preferences?.analytics ? "Enabled" : "Disabled"}
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    These help us understand how visitors use the site. All data is anonymized – 
                    we genuinely can't tell who you are, which Bubbles finds both reassuring and 
                    slightly disappointing.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Cookie Name</th>
                          <th className="text-left py-2 font-medium">Provider</th>
                          <th className="text-left py-2 font-medium">Purpose</th>
                          <th className="text-left py-2 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">_ga</td>
                          <td className="py-2">Google Analytics</td>
                          <td className="py-2">Distinguishes unique users</td>
                          <td className="py-2">2 years</td>
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">_ga_*</td>
                          <td className="py-2">Google Analytics</td>
                          <td className="py-2">Maintains session state</td>
                          <td className="py-2">2 years</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-xs">_gid</td>
                          <td className="py-2">Google Analytics</td>
                          <td className="py-2">Distinguishes users for 24 hours</td>
                          <td className="py-2">24 hours</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Cookies */}
              <Card className="border-purple-500/30 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📢 Marketing Cookies
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        preferences?.marketing 
                          ? "bg-green-500/20 text-green-700 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {preferences?.marketing ? "Enabled" : "Disabled"}
                      </span>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    These are used to deliver relevant advertisements. Bubbles has many opinions 
                    about targeted advertising, all of them confidently incorrect.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-medium">Cookie Name</th>
                          <th className="text-left py-2 font-medium">Provider</th>
                          <th className="text-left py-2 font-medium">Purpose</th>
                          <th className="text-left py-2 font-medium">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">_fbp</td>
                          <td className="py-2">Meta (Facebook)</td>
                          <td className="py-2">Tracks visits across websites</td>
                          <td className="py-2">3 months</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono text-xs">_shopify_*</td>
                          <td className="py-2">Shopify</td>
                          <td className="py-2">E-commerce tracking</td>
                          <td className="py-2">Various</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-center">
              <Button onClick={openCookieSettings} className="gap-2">
                <Cookie className="w-4 h-4" />
                Change Cookie Preferences
              </Button>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary" />
              How We Use Your Data
            </h2>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <span className="text-lg">🛒</span>
                    <span><strong>Process orders:</strong> Ship your merchandise and handle returns.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">📧</span>
                    <span><strong>Communication:</strong> Send order confirmations and shipping updates.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">📈</span>
                    <span><strong>Improve the site:</strong> Understand how people use the site to make it better.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">🔒</span>
                    <span><strong>Security:</strong> Protect against fraud and abuse.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-lg">⚖️</span>
                    <span><strong>Legal compliance:</strong> Meet our legal obligations (Bubbles has been assured these exist).</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Your Rights
            </h2>
            <p className="text-muted-foreground mb-4">
              Under GDPR and other privacy laws, you have the following rights:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "Right to Access", desc: "Request a copy of your personal data" },
                { title: "Right to Rectification", desc: "Correct inaccurate personal data" },
                { title: "Right to Erasure", desc: "Request deletion of your data" },
                { title: "Right to Restrict Processing", desc: "Limit how we use your data" },
                { title: "Right to Data Portability", desc: "Receive your data in a portable format" },
                { title: "Right to Object", desc: "Object to processing of your data" },
              ].map((right) => (
                <Card key={right.title} className="bg-card/50">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm">{right.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{right.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Data Retention
            </h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  We keep your data only as long as necessary:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Order data:</strong> 7 years (for tax and legal purposes)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Account data:</strong> Until you delete your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Analytics data:</strong> 26 months (Google Analytics default)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span><strong>Local storage:</strong> Until you clear your browser data</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              Contact Us
            </h2>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this privacy policy or want to exercise your rights, 
                  you can reach us at:
                </p>
                <div className="bg-card rounded-lg p-4 border">
                  <p className="font-mono text-sm">
                    privacy@bubblesthesheep.com
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4 italic">
                  Bubbles will personally review all inquiries and respond with the same level of 
                  accuracy applied to everything else on this site.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Changes to Policy */}
          <section className="pb-8">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-display font-semibold mb-2">Changes to This Policy</h3>
                <p className="text-sm text-muted-foreground">
                  We may update this privacy policy from time to time. When we do, we'll update 
                  the "Last updated" date at the top. Bubbles recommends checking back occasionally, 
                  though Bubbles also recommends many things that turn out to be inadvisable.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
