import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Palette,
  Package,
  Save,
  Send,
  RefreshCw,
  Search,
  Layers,
  Sparkles,
  Store,
  Check,
  AlertTriangle,
  FileImage,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { DesignCanvas, ElementControls, type DesignElement } from "@/components/admin/DesignCanvas";
import { PrintFileUpload, type PrintFile } from "@/components/admin/PrintFileUpload";

// Official Bubbles brand assets
import bubblesStencil from "@/assets/bubbles-hero-stencil.png";
import bubblesSilhouette from "@/assets/bubbles-hero-silhouette.png";

interface BaseProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  productType: string;
  tags: string[];
  status: string;
  priceRangeV2?: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: Array<{ node: { url: string; altText: string | null } }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        price: string;
        selectedOptions: Array<{ name: string; value: string }>;
      };
    }>;
  };
  options: Array<{ name: string; values: string[] }>;
}

// DesignElement is imported from DesignCanvas component

interface SavedDesign {
  id: string;
  name: string;
  base_product_id: string;
  base_product_title: string;
  design_data: Record<string, unknown>;
  status: "draft" | "synced" | "published";
  shopify_product_id: string | null;
  created_at: string;
  updated_at: string;
}

const PRODUCT_TYPES = [
  { value: "all", label: "All Products" },
  { value: "T-Shirt", label: "T-Shirts" },
  { value: "Hoodie", label: "Hoodies" },
  { value: "Mug", label: "Mugs" },
  { value: "Tote", label: "Tote Bags" },
  { value: "Cap", label: "Caps" },
];

const PRINT_POSITIONS = [
  { value: "front", label: "Front" },
  { value: "back", label: "Back" },
  { value: "left-sleeve", label: "Left Sleeve" },
  { value: "right-sleeve", label: "Right Sleeve" },
  { value: "pocket", label: "Pocket Area" },
];

const POD_PROVIDERS = [
  { value: "printful", label: "Printful", connected: false },
  { value: "printify", label: "Printify", connected: false },
  { value: "gelato", label: "Gelato", connected: false },
];

export default function DesignStudio() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "designs" | "sync">("create");
  
  // Base product selection
  const [baseProducts, setBaseProducts] = useState<BaseProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<BaseProduct | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // Design canvas state
  const [designName, setDesignName] = useState("");
  const [designElements, setDesignElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [printPosition, setPrintPosition] = useState("front");
  const [canvasZoom, setCanvasZoom] = useState(100);
  
  // Product creation
  const [productTitle, setProductTitle] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productTags, setProductTags] = useState("");
  const [selectedPodProvider, setSelectedPodProvider] = useState<string>("");
  const [creatingProduct, setCreatingProduct] = useState(false);
  
  // Saved designs
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [savingDesign, setSavingDesign] = useState(false);
  
  // Print files state
  const [printFiles, setPrintFiles] = useState<PrintFile[]>([]);
  
  // Dialog states
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load base products from Shopify
  useEffect(() => {
    loadBaseProducts();
  }, [productTypeFilter]);

  // Load saved designs
  useEffect(() => {
    if (activeTab === "designs") {
      loadSavedDesigns();
    }
  }, [activeTab]);

  async function loadBaseProducts() {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: {
          action: "list_base_products",
          query: productSearch,
          productType: productTypeFilter !== "all" ? productTypeFilter : undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setBaseProducts(data.products || []);
      } else {
        throw new Error(data?.error || "Failed to load products");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products from Shopify");
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadSavedDesigns() {
    setLoadingDesigns(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: { action: "list_designs" },
      });

      if (error) throw error;

      if (data?.success) {
        setSavedDesigns(data.designs || []);
      }
    } catch (error) {
      console.error("Error loading designs:", error);
      toast.error("Failed to load saved designs");
    } finally {
      setLoadingDesigns(false);
    }
  }

  function addBrandElement(type: "stencil" | "silhouette") {
    const newElement: DesignElement = {
      id: `element-${Date.now()}`,
      type,
      url: type === "stencil" ? bubblesStencil : bubblesSilhouette,
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 100,
    };
    setDesignElements([...designElements, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`Added Bubbles ${type}`);
  }

  function updateElement(id: string, updates: Partial<DesignElement>) {
    setDesignElements(elements =>
      elements.map(el => (el.id === id ? { ...el, ...updates } : el))
    );
  }

  function removeElement(id: string) {
    setDesignElements(elements => elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }

  async function handleSaveDesign() {
    if (!designName.trim()) {
      toast.error("Please enter a design name");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a base product");
      return;
    }

    setSavingDesign(true);
    try {
      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: {
          action: "save_design",
          design: {
            name: designName,
            baseProductId: selectedProduct.id,
            baseProductTitle: selectedProduct.title,
            brandAssets: {
              elements: designElements,
            },
            printPlacement: {
              position: printPosition,
              x: 0,
              y: 0,
              width: 100,
              height: 100,
              rotation: 0,
            },
            colors: {
              garment: "black",
              print: ["white"],
            },
            printFiles: printFiles, // Include uploaded print files
            podProvider: selectedPodProvider || undefined,
            metadata: {
              productType: selectedProduct.productType,
              vendor: selectedProduct.vendor,
            },
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Design saved successfully!");
        loadSavedDesigns();
      } else {
        throw new Error(data?.error || "Failed to save design");
      }
    } catch (error) {
      console.error("Error saving design:", error);
      toast.error("Failed to save design");
    } finally {
      setSavingDesign(false);
    }
  }

  async function handleCreateProduct() {
    if (!productTitle.trim()) {
      toast.error("Please enter a product title");
      return;
    }
    if (!selectedProduct) {
      toast.error("Please select a base product first");
      return;
    }

    setCreatingProduct(true);
    try {
      // First save the design if not saved
      if (!designName.trim()) {
        setDesignName(productTitle);
      }

      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: {
          action: "create_product",
          productData: {
            title: productTitle,
            description: productDescription || `${productTitle} - Official Bubbles the Sheep merchandise`,
            productType: selectedProduct.productType,
            vendor: "Bubbles the Sheep",
            tags: productTags.split(",").map(t => t.trim()).filter(Boolean).concat(["bubbles", "merch"]),
            variants: selectedProduct.variants?.edges?.map(v => ({
              size: v.node.selectedOptions?.find(o => o.name === "Size")?.value || "",
              color: v.node.selectedOptions?.find(o => o.name === "Color")?.value || "",
              price: v.node.price || "29.99",
              sku: `BUBBLES-${Date.now()}-${v.node.title?.replace(/\s/g, "-").toUpperCase()}`,
            })) || [],
            podProvider: selectedPodProvider || undefined,
          },
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Product created in Shopify!");
        setShowCreateDialog(false);
        loadSavedDesigns();
      } else {
        throw new Error(data?.error || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product in Shopify");
    } finally {
      setCreatingProduct(false);
    }
  }

  async function handleSyncToStore(designId: string) {
    try {
      const { data, error } = await supabase.functions.invoke("design-studio", {
        body: {
          action: "sync_to_shopify",
          designId,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Product published to store!");
        loadSavedDesigns();
      } else {
        throw new Error(data?.error || "Failed to sync");
      }
    } catch (error) {
      console.error("Error syncing:", error);
      toast.error((error as Error).message || "Failed to sync to store");
    }
  }

  const selectedElementData = designElements.find(el => el.id === selectedElement);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Product Design Studio
            </h1>
            <p className="text-muted-foreground mt-1">
              Create products with official Bubbles branding, sync to Shopify & POD
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBaseProducts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} disabled={!selectedProduct}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Create Product
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="designs" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Sync
            </TabsTrigger>
          </TabsList>

          {/* CREATE TAB */}
          <TabsContent value="create" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Base Product Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Base Product
                  </CardTitle>
                  <CardDescription>Select a garment from Shopify catalog</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && loadBaseProducts()}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <Select value={productTypeFilter} onValueChange={setProductTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <ScrollArea className="h-[300px]">
                    {loadingProducts ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : baseProducts.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No products found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {baseProducts.map(product => (
                          <button
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            className={cn(
                              "w-full p-3 rounded-lg border text-left transition-all",
                              selectedProduct?.id === product.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex gap-3">
                              {product.images?.edges?.[0]?.node?.url && (
                                <img
                                  src={product.images.edges[0].node.url}
                                  alt={product.title}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{product.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.productType} • {product.variants?.edges?.length || 0} variants
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Center: Design Canvas */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Design Canvas
                  </CardTitle>
                  <CardDescription>Drag elements to position • Arrow keys for precision</CardDescription>
                </CardHeader>
                <CardContent>
                  <DesignCanvas
                    elements={designElements}
                    selectedElementId={selectedElement}
                    onSelectElement={setSelectedElement}
                    onUpdateElement={updateElement}
                    onRemoveElement={removeElement}
                    backgroundImage={selectedProduct?.images?.edges?.[0]?.node?.url}
                    backgroundAlt={selectedProduct?.title}
                    canvasZoom={canvasZoom}
                    onZoomChange={setCanvasZoom}
                  />

                  {/* Print Position */}
                  <div className="mt-4">
                    <Label>Print Position</Label>
                    <Select value={printPosition} onValueChange={setPrintPosition}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRINT_POSITIONS.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Right: Brand Assets & Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Brand Assets
                  </CardTitle>
                  <CardDescription>Add official Bubbles elements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brand Elements */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => addBrandElement("stencil")}
                      className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                    >
                      <img
                        src={bubblesStencil}
                        alt="Bubbles Stencil"
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                      />
                      <span className="text-sm font-medium">Stencil</span>
                    </button>
                    <button
                      onClick={() => addBrandElement("silhouette")}
                      className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center"
                    >
                      <img
                        src={bubblesSilhouette}
                        alt="Bubbles Silhouette"
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                      />
                      <span className="text-sm font-medium">Silhouette</span>
                    </button>
                  </div>

                  {/* Element Controls - Using new component */}
                  <ElementControls
                    element={selectedElementData}
                    onUpdate={updateElement}
                    onRemove={removeElement}
                    snapToGrid={true}
                  />

                  {/* Save Design */}
                  <div className="space-y-3 pt-4 border-t">
                    <Label>Design Name</Label>
                    <Input
                      placeholder="My Bubbles Design"
                      value={designName}
                      onChange={(e) => setDesignName(e.target.value)}
                    />
                    <Button
                      className="w-full"
                      onClick={handleSaveDesign}
                      disabled={savingDesign || !selectedProduct}
                    >
                      {savingDesign ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Design
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Print File Upload - Fourth Column on Large Screens */}
              <div className="lg:col-span-3">
                <PrintFileUpload
                  designId={undefined}
                  designName={designName || "New Design"}
                  printFiles={printFiles}
                  onFilesChange={setPrintFiles}
                  podProvider={selectedPodProvider || undefined}
                />
              </div>
            </div>
          </TabsContent>

          {/* SAVED DESIGNS TAB */}
          <TabsContent value="designs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Designs</CardTitle>
                <CardDescription>Your product designs ready for Shopify</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDesigns ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : savedDesigns.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No saved designs yet</p>
                    <p className="text-sm">Create your first design in the Design tab</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedDesigns.map(design => (
                      <Card key={design.id} className="overflow-hidden">
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <FileImage className="h-16 w-16 text-muted-foreground opacity-50" />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium">{design.name}</h3>
                          <p className="text-sm text-muted-foreground">{design.base_product_title}</p>
                          <div className="flex items-center justify-between mt-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                design.status === "published" && "bg-affirmative/10 text-affirmative border-affirmative/20",
                                design.status === "synced" && "bg-primary/10 text-primary border-primary/20",
                                design.status === "draft" && "bg-muted text-muted-foreground"
                              )}
                            >
                              {design.status}
                            </Badge>
                            {design.status === "synced" && design.shopify_product_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSyncToStore(design.id)}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Publish
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SYNC TAB */}
          <TabsContent value="sync" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Shopify Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-affirmative/10 rounded-lg border border-affirmative/20">
                    <Check className="h-5 w-5 text-affirmative" />
                    <div>
                      <p className="font-medium text-affirmative">Connected</p>
                      <p className="text-sm text-muted-foreground">
                        bubblesheet-storefront-ops-o5m9w.myshopify.com
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Products</span>
                      <span className="font-medium">{baseProducts.length} loaded</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">API Version</span>
                      <span className="font-medium">2025-07</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    POD Providers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {POD_PROVIDERS.map(provider => (
                      <div
                        key={provider.value}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="font-medium">{provider.label}</span>
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Not Connected
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Connect POD providers in{" "}
                    <a href="/admin/pod" className="text-primary hover:underline">
                      POD & Apps
                    </a>
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Product Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Product in Shopify</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Product Title</Label>
                <Input
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  placeholder="Bubbles Urban Tee"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Official Bubbles the Sheep merchandise..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={productTags}
                  onChange={(e) => setProductTags(e.target.value)}
                  placeholder="bubbles, merch, urban"
                />
              </div>
              <div>
                <Label>POD Provider (optional)</Label>
                <Select value={selectedPodProvider} onValueChange={setSelectedPodProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No POD Provider</SelectItem>
                    {POD_PROVIDERS.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Base: {selectedProduct.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProduct.variants?.edges?.length || 0} variants • {selectedProduct.productType}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct} disabled={creatingProduct}>
                {creatingProduct ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ShoppingBag className="h-4 w-4 mr-2" />
                )}
                Create Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
