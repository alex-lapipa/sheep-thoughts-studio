import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, Home, Mail, RotateCcw, Settings } from "lucide-react";
import { toast } from "sonner";

const NewsletterUnsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "resubscribed">("loading");
  const [message, setMessage] = useState("");
  const [isResubscribing, setIsResubscribing] = useState(false);

  useEffect(() => {
    const unsubscribe = async () => {
      if (!email) {
        setStatus("error");
        setMessage("Missing email address. Please use the link from your email.");
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
          body: { action: "unsubscribe", email, token },
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to unsubscribe");
        }
      } catch (err) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact support.");
      }
    };

    unsubscribe();
  }, [email, token]);

  const handleResubscribe = async () => {
    if (!email) return;
    
    setIsResubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { action: "resubscribe", email },
      });

      if (error) throw error;

      if (data.success) {
        setStatus("resubscribed");
        setMessage("You've been re-subscribed to our newsletter!");
        toast.success("Welcome back!");
      } else {
        toast.error(data.error || "Failed to re-subscribe");
      }
    } catch (err) {
      console.error("Resubscribe error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsResubscribing(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <h1 className="text-2xl font-display text-foreground">
                Processing your request...
              </h1>
              <p className="text-muted-foreground">
                Just a moment while we update your preferences.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-display text-foreground">
                You've Been Unsubscribed
              </h1>
              <p className="text-muted-foreground text-lg">
                {message}
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground italic">
                  "Farewell, dear human. My inbox feels emptier already. 
                  But I understand — not everyone can handle this much wool in their life."
                </p>
                <p className="text-sm text-primary mt-2">— Bubbles 🐑</p>
              </div>
              
              {/* Re-subscribe option */}
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
                <p className="text-sm text-foreground mb-3">
                  Changed your mind? You can re-subscribe or manage your preferences.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleResubscribe}
                    disabled={isResubscribing}
                    size="sm"
                  >
                    {isResubscribing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Re-subscribe
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/newsletter/preferences?email=${email}&token=${token}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Preferences
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "resubscribed" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-display text-foreground">
                Welcome Back! 🎉
              </h1>
              <p className="text-muted-foreground text-lg">
                {message}
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground italic">
                  "I knew you couldn't stay away! The wool is strong with this one. 
                  Prepare for more delightfully incorrect wisdom in your inbox!"
                </p>
                <p className="text-sm text-primary mt-2">— Bubbles 🐑</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-3xl font-display text-foreground">
                Oops!
              </h1>
              <p className="text-muted-foreground text-lg">
                {message}
              </p>
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
        </div>
      </div>
    </Layout>
  );
};

export default NewsletterUnsubscribe;
