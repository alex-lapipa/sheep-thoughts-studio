import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Search, Package, Loader2, MapPin, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";

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

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-order-details", {
        body: { orderNumber: orderNumber.trim() },
      });

      if (fnError) {
        console.error("Error fetching order:", fnError);
        setError("Could not find order. Please check your order number and try again.");
        setOrderDetails(null);
      } else if (data?.order) {
        setOrderDetails(data.order);
        setError(null);
      } else if (data?.error) {
        setError(data.error === "Order not found" 
          ? "We couldn't find an order with that number. Please double-check and try again."
          : data.error
        );
        setOrderDetails(null);
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Something went wrong. Please try again later.");
      setOrderDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency,
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return { icon: CheckCircle, color: "text-affirmative", bg: "bg-affirmative/10", label: "Paid" };
      case "pending":
        return { icon: Clock, color: "text-warning", bg: "bg-warning/10", label: "Pending" };
      case "fulfilled":
      case "shipped":
        return { icon: Truck, color: "text-affirmative", bg: "bg-affirmative/10", label: "Shipped" };
      case "unfulfilled":
        return { icon: Package, color: "text-muted-foreground", bg: "bg-muted", label: "Processing" };
      default:
        return { icon: Package, color: "text-muted-foreground", bg: "bg-muted", label: status };
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Track Your Order | Bubbles the Sheep</title>
        <meta name="description" content="Track your Bubbles the Sheep order status. Enter your order number to see shipping updates and delivery information." />
      </Helmet>

      <div className="min-h-[60vh] px-4 py-16">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your order number to check the status of your delivery
            </p>
          </div>

          {/* Search Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter order number (e.g., #1001)"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading || !orderNumber.trim()}>
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && searched && (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-destructive">Order Not Found</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Details */}
          {orderDetails && (
            <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4">
              {/* Order Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">Order {orderDetails.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {formatDate(orderDetails.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-3">
                    {(() => {
                      const paymentStatus = getStatusInfo(orderDetails.financialStatus);
                      const PaymentIcon = paymentStatus.icon;
                      return (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${paymentStatus.bg}`}>
                          <PaymentIcon className={`w-4 h-4 ${paymentStatus.color}`} />
                          <span className={`text-sm font-medium ${paymentStatus.color}`}>
                            Payment: {paymentStatus.label}
                          </span>
                        </div>
                      );
                    })()}
                    {(() => {
                      const fulfillStatus = getStatusInfo(orderDetails.fulfillmentStatus);
                      const FulfillIcon = fulfillStatus.icon;
                      return (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${fulfillStatus.bg}`}>
                          <FulfillIcon className={`w-4 h-4 ${fulfillStatus.color}`} />
                          <span className={`text-sm font-medium ${fulfillStatus.color}`}>
                            {fulfillStatus.label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Shipping Info */}
                  {(orderDetails.shippingAddress || orderDetails.shippingMethod) && (
                    <>
                      <Separator />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {orderDetails.shippingAddress && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Shipping To
                            </p>
                            <p className="text-sm">
                              {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province}
                            </p>
                            <p className="text-sm">{orderDetails.shippingAddress.country}</p>
                          </div>
                        )}
                        {orderDetails.shippingMethod && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Shipping Method
                            </p>
                            <p className="text-sm">{orderDetails.shippingMethod}</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Line Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Items in Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(orderDetails.subtotal, orderDetails.currency)}</span>
                  </div>
                  {parseFloat(orderDetails.shippingPrice) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatCurrency(orderDetails.shippingPrice, orderDetails.currency)}</span>
                    </div>
                  )}
                  {parseFloat(orderDetails.totalTax) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>{formatCurrency(orderDetails.totalTax, orderDetails.currency)}</span>
                    </div>
                  )}
                  {parseFloat(orderDetails.totalDiscounts) > 0 && (
                    <div className="flex justify-between text-sm text-affirmative">
                      <span>Discount</span>
                      <span>-{formatCurrency(orderDetails.totalDiscounts, orderDetails.currency)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(orderDetails.totalPrice, orderDetails.currency)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bubbles Quote */}
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-center text-sm italic text-muted-foreground">
                    "I've been told that tracking numbers are just the package's name. So your package has a very long, complicated name. Very sophisticated."
                    <span className="block mt-2 text-xs not-italic">— Bubbles</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State (before search) */}
          {!searched && !orderDetails && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                Your order number can be found in your confirmation email
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderTracking;