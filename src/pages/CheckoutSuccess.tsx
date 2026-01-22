import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, ShoppingBag, Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/stores/cartStore";
import { trackEvent } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [tracked, setTracked] = useState(false);

  useEffect(() => {
    if (tracked) return;

    // Extract order details from URL params (Shopify can pass these)
    const orderId = searchParams.get("order_id");
    const orderNumber = searchParams.get("order_number");
    const totalPrice = searchParams.get("total");
    const currency = searchParams.get("currency") || "EUR";

    // Clear the cart after successful purchase
    clearCart();

    // Track purchase event in analytics
    trackEvent({
      category: 'ecommerce',
      action: 'purchase_complete',
      label: orderId || orderNumber || 'unknown',
      value: totalPrice ? Math.round(parseFloat(totalPrice) * 100) : undefined,
    });

    // Log to ecommerce_events table
    const logPurchase = async () => {
      try {
        await supabase.from("ecommerce_events").insert({
          event_type: "purchase_complete",
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
            total: totalPrice,
            currency,
            source: "checkout_callback",
          },
        });
      } catch (error) {
        console.error("Failed to log purchase event:", error);
      }
    };

    logPurchase();
    setTracked(true);
  }, [searchParams, clearCart, tracked]);

  const orderNumber = searchParams.get("order_number");

  return (
    <Layout>
      <Helmet>
        <title>Order Confirmed | Bubbles the Sheep</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full text-center border-primary/20 shadow-lg">
          <CardContent className="pt-8 pb-8 space-y-6">
            {/* Success Icon */}
            <div className="relative inline-flex">
              <div className="w-20 h-20 rounded-full bg-affirmative/10 flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-affirmative" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-accent animate-pulse" />
            </div>

            {/* Confirmation Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Thank Ewe! 🐑
              </h1>
              <p className="text-muted-foreground">
                Your order has been confirmed and is on its way to becoming reality.
              </p>
              {orderNumber && (
                <p className="text-sm text-muted-foreground mt-2">
                  Order number: <span className="font-mono font-medium">{orderNumber}</span>
                </p>
              )}
            </div>

            {/* Bubbles Quote */}
            <div className="bg-secondary/30 rounded-lg p-4 text-sm italic text-muted-foreground">
              "I've heard that packages travel faster if you think about them really hard. 
              I've been doing it for years — that's why my wool is so fluffy."
              <span className="block mt-1 text-xs">— Bubbles</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/collections/all">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Email Note */}
            <p className="text-xs text-muted-foreground">
              You'll receive a confirmation email with tracking details once your order ships.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
