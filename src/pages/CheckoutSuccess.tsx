import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle, ShoppingBag, Home, Sparkles, Package, Loader2, MapPin, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/cartStore";
import { trackEvent } from "@/lib/analytics";
import { ecommerceTracking } from "@/lib/ecommerceTracking";
import { useABProductTracking } from "@/hooks/useABTracking";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";

interface OrderLineItem {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  price: string;
  image: string | null;
}

interface OrderDetails {
  id: number;
  orderNumber: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  subtotal: string;
  totalTax: string;
  totalDiscounts: string;
  totalPrice: string;
  currency: string;
  lineItems: OrderLineItem[];
  shippingAddress: {
    city: string;
    province: string;
    country: string;
  } | null;
  shippingMethod: string | null;
  shippingPrice: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  const [tracked, setTracked] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackPurchase } = useABProductTracking();

  const orderId = searchParams.get("order_id");
  const orderNumber = searchParams.get("order_number");
  const totalPrice = searchParams.get("total");
  const currency = searchParams.get("currency") || "EUR";

  // Fetch order details from Shopify
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId && !orderNumber) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke("get-order-details", {
          body: { orderId, orderNumber },
        });

        if (fnError) {
          console.error("Error fetching order:", fnError);
          setError("Could not load order details");
        } else if (data?.order) {
          setOrderDetails(data.order);
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, orderNumber]);

  // Track purchase event (once) - waits for order details if available
  useEffect(() => {
    if (tracked) return;
    if (loading) return; // Wait for order details to load

    // Clear the cart after successful purchase
    clearCart();

    // Track purchase event in analytics
    trackEvent({
      category: "ecommerce",
      action: "purchase_complete",
      label: orderId || orderNumber || "unknown",
      value: totalPrice ? Math.round(parseFloat(totalPrice) * 100) : undefined,
    });

    // If we have order details, send enhanced ecommerce tracking to GA4
    if (orderDetails) {
      ecommerceTracking.purchaseComplete({
        orderId: orderId || String(orderDetails.id),
        orderNumber: orderDetails.orderNumber,
        totalValue: parseFloat(orderDetails.totalPrice),
        currency: orderDetails.currency,
        tax: parseFloat(orderDetails.totalTax) || 0,
        shipping: parseFloat(orderDetails.shippingPrice) || 0,
        items: orderDetails.lineItems.map(item => ({
          productId: item.id,
          productTitle: item.title,
          variantTitle: item.variantTitle || undefined,
          price: parseFloat(item.price),
          quantity: item.quantity,
        })),
      });
    } else {
      // Fallback tracking without item details
      ecommerceTracking.purchaseComplete({
        orderId: orderId || "unknown",
        orderNumber: orderNumber || undefined,
        totalValue: totalPrice ? parseFloat(totalPrice) : 0,
        currency,
        items: [],
      });
    }

    // Track for A/B test conversion
    const purchaseTotal = orderDetails 
      ? parseFloat(orderDetails.totalPrice) 
      : (totalPrice ? parseFloat(totalPrice) : 0);
    trackPurchase(orderId || orderNumber || "unknown", purchaseTotal);

    setTracked(true);
  }, [loading, orderDetails, tracked, clearCart, orderId, orderNumber, totalPrice, currency, trackPurchase]);

  const formatCurrency = (amount: string, curr: string) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: curr,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-affirmative/10 text-affirmative border-affirmative/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "unfulfilled":
        return "bg-muted text-muted-foreground";
      case "fulfilled":
      case "shipped":
        return "bg-affirmative/10 text-affirmative border-affirmative/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Order Confirmed | Bubbles the Sheep</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[60vh] px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="text-center border-primary/20 shadow-lg">
            <CardContent className="pt-8 pb-6 space-y-4">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-affirmative/10 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-affirmative" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-accent animate-pulse" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Thank Ewe! 🐑</h1>
                <p className="text-muted-foreground">
                  Your order has been confirmed and is on its way to becoming reality.
                </p>
                {(orderDetails?.orderNumber || orderNumber) && (
                  <p className="text-sm text-muted-foreground">
                    Order number:{" "}
                    <span className="font-mono font-medium">
                      {orderDetails?.orderNumber || orderNumber}
                    </span>
                  </p>
                )}
              </div>

              {/* Bubbles Quote */}
              <div className="bg-secondary/30 rounded-lg p-4 text-sm italic text-muted-foreground">
                "I've heard that packages travel faster if you think about them really hard. I've
                been doing it for years — that's why my wool is so fluffy."
                <span className="block mt-1 text-xs">— Bubbles</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          {loading ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : orderDetails ? (
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getStatusColor(orderDetails.financialStatus)}>
                    Payment: {orderDetails.financialStatus}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(orderDetails.fulfillmentStatus)}>
                    <Package className="w-3 h-3 mr-1" />
                    {orderDetails.fulfillmentStatus}
                  </Badge>
                </div>

                {/* Line Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Items Ordered
                  </h3>
                  {orderDetails.lineItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-secondary/20 rounded-lg">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        {item.variantTitle && item.variantTitle !== "Default Title" && (
                          <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.price, orderDetails.currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Shipping Info */}
                {(orderDetails.shippingAddress || orderDetails.shippingMethod) && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {orderDetails.shippingAddress && (
                        <div className="space-y-1">
                          <p className="font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Shipping To
                          </p>
                          <p>
                            {orderDetails.shippingAddress.city},{" "}
                            {orderDetails.shippingAddress.province}
                          </p>
                          <p>{orderDetails.shippingAddress.country}</p>
                        </div>
                      )}
                      {orderDetails.shippingMethod && (
                        <div className="space-y-1">
                          <p className="font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Shipping Method
                          </p>
                          <p>{orderDetails.shippingMethod}</p>
                        </div>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(orderDetails.subtotal, orderDetails.currency)}</span>
                  </div>
                  {parseFloat(orderDetails.shippingPrice) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>
                        {formatCurrency(orderDetails.shippingPrice, orderDetails.currency)}
                      </span>
                    </div>
                  )}
                  {parseFloat(orderDetails.totalTax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(orderDetails.totalTax, orderDetails.currency)}</span>
                    </div>
                  )}
                  {parseFloat(orderDetails.totalDiscounts) > 0 && (
                    <div className="flex justify-between text-affirmative">
                      <span>Discount</span>
                      <span>
                        -{formatCurrency(orderDetails.totalDiscounts, orderDetails.currency)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(orderDetails.totalPrice, orderDetails.currency)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>{error}</p>
                <p className="text-sm mt-2">
                  Don't worry — your order was still placed successfully!
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
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
          <p className="text-xs text-center text-muted-foreground">
            You'll receive a confirmation email with tracking details once your order ships.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;
