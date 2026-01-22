import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function NewsletterConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid confirmation link. Please try subscribing again.");
      return;
    }

    const confirmSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
          body: { action: "confirm", token },
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to confirm subscription");
        }
      } catch (err) {
        console.error("Confirmation error:", err);
        setStatus("error");
        setMessage("Something went wrong. Please try again or contact support.");
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-display font-bold">
                Confirming your subscription...
              </h1>
              <p className="text-muted-foreground">
                Just a moment while we verify your email.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10">
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-display font-bold text-primary">
                You're In! 🐑
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link to="/">
                    <Mail className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-destructive/10">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
              </div>
              <h1 className="text-2xl font-display font-bold text-destructive">
                Oops!
              </h1>
              <p className="text-muted-foreground">
                {message}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild variant="outline">
                  <Link to="/">Back to Home</Link>
                </Button>
                <Button asChild>
                  <Link to="/contact">Contact Support</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
