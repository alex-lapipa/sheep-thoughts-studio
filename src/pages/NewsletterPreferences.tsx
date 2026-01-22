import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle, Home, Mail, Megaphone, ShoppingBag, Newspaper, Tag } from "lucide-react";
import { toast } from "sonner";

interface Preferences {
  announcements: boolean;
  product_drops: boolean;
  weekly_digest: boolean;
  promotions: boolean;
}

const defaultPreferences: Preferences = {
  announcements: true,
  product_drops: true,
  weekly_digest: true,
  promotions: true,
};

const preferenceOptions = [
  {
    key: "announcements" as keyof Preferences,
    label: "Announcements",
    description: "Important updates about Bubbles and new features",
    icon: Megaphone,
  },
  {
    key: "product_drops" as keyof Preferences,
    label: "Product Drops",
    description: "Be the first to know about new merchandise and collections",
    icon: ShoppingBag,
  },
  {
    key: "weekly_digest" as keyof Preferences,
    label: "Weekly Digest",
    description: "A summary of Bubbles' latest wisdom and shenanigans",
    icon: Newspaper,
  },
  {
    key: "promotions" as keyof Preferences,
    label: "Promotions & Offers",
    description: "Exclusive discounts and special offers",
    icon: Tag,
  },
];

const NewsletterPreferences = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "saved" | "error">("loading");
  const [message, setMessage] = useState("");
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!email || !token) {
        setStatus("error");
        setMessage("Invalid link. Please use the link from your email.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
          body: { action: "get_preferences", email, token },
        });

        if (error) throw error;

        if (data.success && data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
          setStatus("ready");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to load preferences");
        }
      } catch (err) {
        console.error("Load preferences error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact support.");
      }
    };

    loadPreferences();
  }, [email, token]);

  const handleToggle = (key: keyof Preferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!email || !token) return;
    
    setStatus("saving");
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { action: "update_preferences", email, token, preferences },
      });

      if (error) throw error;

      if (data.success) {
        setStatus("saved");
        toast.success("Preferences saved!");
        setTimeout(() => setStatus("ready"), 2000);
      } else {
        setStatus("ready");
        toast.error(data.error || "Failed to save preferences");
      }
    } catch (err) {
      console.error("Save preferences error:", err);
      setStatus("ready");
      toast.error("Something went wrong. Please try again.");
    }
  };

  const allDisabled = !Object.values(preferences).some(v => v);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {status === "loading" && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h1 className="text-2xl font-display text-foreground">
                Loading your preferences...
              </h1>
            </div>
          )}

          {status === "error" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-display text-foreground">Oops!</h1>
              <p className="text-muted-foreground text-lg">{message}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/contact">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {(status === "ready" || status === "saving" || status === "saved") && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display text-foreground">
                  Email Preferences
                </h1>
                <p className="text-muted-foreground mt-2">
                  Choose what emails you'd like to receive from Bubbles
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {email}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Types</CardTitle>
                  <CardDescription>
                    Toggle the types of emails you want to receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {preferenceOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div
                        key={option.key}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <Label htmlFor={option.key} className="font-medium cursor-pointer">
                              {option.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={option.key}
                          checked={preferences[option.key]}
                          onCheckedChange={() => handleToggle(option.key)}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {allDisabled && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 text-center">
                  <p className="text-sm text-warning">
                    ⚠️ You've disabled all email types. You won't receive any emails from us.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Consider keeping at least one type enabled, or{" "}
                    <Link to={`/newsletter/unsubscribe?email=${email}&token=${token}`} className="underline">
                      unsubscribe completely
                    </Link>
                  </p>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground italic">
                  "I respect your choices, even if I don't fully understand them. 
                  Less wool in your inbox? Bold move, human. Bold move."
                </p>
                <p className="text-sm text-primary mt-2">— Bubbles 🐑</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSave}
                  disabled={status === "saving"}
                  className="flex-1"
                >
                  {status === "saving" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : status === "saved" ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : null}
                  {status === "saving" ? "Saving..." : status === "saved" ? "Saved!" : "Save Preferences"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NewsletterPreferences;
