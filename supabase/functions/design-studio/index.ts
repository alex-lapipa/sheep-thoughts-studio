import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to safely extract error messages from Shopify GraphQL responses
function extractGraphQLErrors(errors: unknown): string {
  if (!errors) return "Unknown GraphQL error";
  if (Array.isArray(errors)) {
    return errors.map((e: { message?: string }) => e.message || String(e)).join(", ");
  }
  if (typeof errors === "object" && errors !== null) {
    const err = errors as { message?: string };
    if (err.message) return err.message;
    return JSON.stringify(errors);
  }
  return String(errors);
}

interface DesignRequest {
  action: 
    | "list_base_products" 
    | "get_base_product" 
    | "create_product" 
    | "save_design" 
    | "list_designs" 
    | "sync_to_shopify"
    | "get_pod_templates"
    | "upload_print_file";
  productId?: string;
  designId?: string;
  design?: DesignData;
  productData?: ProductCreationData;
  podProvider?: "printful" | "printify" | "gelato";
  query?: string;
  productType?: string;
}

interface DesignData {
  name: string;
  baseProductId: string;
  baseProductTitle: string;
  brandAssets: {
    stencilUrl?: string;
    logoUrl?: string;
    elements: DesignElement[];
  };
  printPlacement: {
    position: "front" | "back" | "left-sleeve" | "right-sleeve" | "pocket";
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  };
  colors: {
    garment: string;
    print: string[];
  };
  metadata: Record<string, unknown>;
}

interface DesignElement {
  type: "stencil" | "text" | "icon" | "shape";
  url?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
}

interface ProductCreationData {
  title: string;
  description: string;
  productType: string;
  vendor: string;
  tags: string[];
  variants: Array<{
    size: string;
    color: string;
    price: string;
    sku: string;
  }>;
  images: Array<{
    src: string;
    alt: string;
    position: number;
  }>;
  designId?: string;
  podProvider?: "printful" | "printify" | "gelato";
  podTemplateId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const shopifyAccessToken = Deno.env.get("SHOPIFY_ACCESS_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Shopify store domain from settings
    const { data: settings } = await supabase
      .from("shopify_settings")
      .select("store_domain")
      .single();

    const storeDomain = settings?.store_domain || "bubblesheet-storefront-ops-o5m9w.myshopify.com";
    const shopifyAdminUrl = `https://${storeDomain}/admin/api/2025-07`;

    const body: DesignRequest = await req.json();
    const { action } = body;

    // === LIST BASE PRODUCTS (from Shopify catalog) ===
    if (action === "list_base_products") {
      const { query = "", productType = "" } = body;
      
      // Build search query for base garments
      let searchQuery = productType ? `product_type:${productType}` : "";
      if (query) {
        searchQuery = searchQuery ? `${searchQuery} AND ${query}` : query;
      }

      const graphqlQuery = `
        query GetBaseProducts($first: Int!, $query: String) {
          products(first: 50, query: $query) {
            edges {
              node {
                id
                title
                handle
                description
                vendor
                productType
                tags
                status
                priceRangeV2 {
                  minVariantPrice { amount currencyCode }
                }
                images(first: 3) {
                  edges {
                    node { url altText }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      selectedOptions { name value }
                    }
                  }
                }
                options { name values }
              }
            }
          }
        }
      `;

      const response = await fetch(`${shopifyAdminUrl}/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { first: 50, query: searchQuery || null },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(extractGraphQLErrors(data.errors));
      }

      const products = data.data?.products?.edges?.map((edge: { node: Record<string, unknown> }) => ({
        ...edge.node,
        isBaseProduct: true,
      })) || [];

      return new Response(
        JSON.stringify({ success: true, products }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === GET SINGLE BASE PRODUCT ===
    if (action === "get_base_product") {
      const { productId } = body;
      
      if (!productId) {
        throw new Error("Product ID is required");
      }

      const graphqlQuery = `
        query GetProduct($id: ID!) {
          product(id: $id) {
            id
            title
            handle
            description
            descriptionHtml
            vendor
            productType
            tags
            status
            priceRangeV2 {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            images(first: 10) {
              edges {
                node { url altText width height }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                  inventoryQuantity
                  selectedOptions { name value }
                }
              }
            }
            options { id name values }
          }
        }
      `;

      const response = await fetch(`${shopifyAdminUrl}/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: graphqlQuery,
          variables: { id: productId },
        }),
      });

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(extractGraphQLErrors(data.errors));
      }

      return new Response(
        JSON.stringify({ success: true, product: data.data?.product }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === SAVE DESIGN (to database) ===
    if (action === "save_design") {
      const { design } = body;
      
      if (!design) {
        throw new Error("Design data is required");
      }

      // Get authenticated user
      const authHeader = req.headers.get("Authorization");
      let userId: string | null = null;
      
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data: claims } = await supabase.auth.getClaims(token);
        userId = claims?.claims?.sub || null;
      }

      const { data: savedDesign, error: saveError } = await supabase
        .from("product_designs")
        .upsert({
          name: design.name,
          base_product_id: design.baseProductId,
          base_product_title: design.baseProductTitle,
          design_data: design,
          print_files: design.printFiles || [],
          pod_provider: design.podProvider || null,
          pod_template_id: design.podTemplateId || null,
          status: "draft",
          created_by: userId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Log audit event
      await supabase.from("audit_logs").insert({
        action: "design_saved",
        entity_type: "product_design",
        entity_id: savedDesign.id,
        user_id: userId,
        metadata: { designName: design.name },
      });

      return new Response(
        JSON.stringify({ success: true, design: savedDesign }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === LIST SAVED DESIGNS ===
    if (action === "list_designs") {
      const { data: designs, error } = await supabase
        .from("product_designs")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, designs }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === CREATE PRODUCT IN SHOPIFY ===
    if (action === "create_product") {
      const { productData, designId } = body;
      
      if (!productData) {
        throw new Error("Product data is required");
      }

      // Build Shopify product mutation
      const createProductMutation = `
        mutation CreateProduct($input: ProductInput!) {
          productCreate(input: $input) {
            product {
              id
              title
              handle
              status
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const productInput = {
        title: productData.title,
        descriptionHtml: productData.description,
        productType: productData.productType,
        vendor: productData.vendor || "Bubbles the Sheep",
        tags: productData.tags || [],
        status: "DRAFT", // Start as draft
        variants: productData.variants?.map((v: { size: string; color: string; price: string; sku: string }) => ({
          price: v.price,
          sku: v.sku,
          options: [v.size, v.color].filter(Boolean),
        })) || [],
      };

      const response = await fetch(`${shopifyAdminUrl}/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: createProductMutation,
          variables: { input: productInput },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(extractGraphQLErrors(data.errors));
      }

      const result = data.data?.productCreate;
      
      if (result?.userErrors?.length > 0) {
        throw new Error(result.userErrors.map((e: { message: string }) => e.message).join(", "));
      }

      const createdProduct = result?.product;

      // If design ID provided, update the design status
      if (designId && createdProduct) {
        await supabase
          .from("product_designs")
          .update({
            status: "synced",
            shopify_product_id: createdProduct.id,
            synced_at: new Date().toISOString(),
          })
          .eq("id", designId);
      }

      // Create variant mappings for POD if provider specified
      if (productData.podProvider && createdProduct) {
        const variantMappings = createdProduct.variants?.edges?.map((v: { node: { id: string; title: string; sku: string } }) => ({
          shopify_product_id: createdProduct.id,
          shopify_variant_id: v.node.id,
          shopify_sku: v.node.sku,
          shopify_title: v.node.title,
          pod_provider: productData.podProvider,
          pod_template_id: productData.podTemplateId || null,
          status: "unmapped",
        })) || [];

        if (variantMappings.length > 0) {
          await supabase.from("variant_mappings").insert(variantMappings);
        }
      }

      // Log audit event
      const authHeader = req.headers.get("Authorization");
      let userId: string | null = null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const { data: claims } = await supabase.auth.getClaims(token);
        userId = claims?.claims?.sub || null;
      }

      await supabase.from("audit_logs").insert({
        action: "product_created",
        entity_type: "shopify_product",
        entity_id: createdProduct?.id,
        user_id: userId,
        metadata: {
          title: productData.title,
          productType: productData.productType,
          podProvider: productData.podProvider,
          designId,
        },
      });

      return new Response(
        JSON.stringify({ success: true, product: createdProduct }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === SYNC DESIGN TO SHOPIFY (activate draft product) ===
    if (action === "sync_to_shopify") {
      const { designId } = body;
      
      if (!designId) {
        throw new Error("Design ID is required");
      }

      // Get the design
      const { data: design, error: designError } = await supabase
        .from("product_designs")
        .select("*")
        .eq("id", designId)
        .single();

      if (designError || !design) {
        throw new Error("Design not found");
      }

      if (!design.shopify_product_id) {
        throw new Error("Product not yet created in Shopify. Create product first.");
      }

      // Activate the product (change status from DRAFT to ACTIVE)
      const updateProductMutation = `
        mutation UpdateProductStatus($input: ProductInput!) {
          productUpdate(input: $input) {
            product {
              id
              status
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch(`${shopifyAdminUrl}/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": shopifyAccessToken!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: updateProductMutation,
          variables: {
            input: {
              id: design.shopify_product_id,
              status: "ACTIVE",
            },
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(extractGraphQLErrors(data.errors));
      }

      // Update design status
      await supabase
        .from("product_designs")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", designId);

      return new Response(
        JSON.stringify({ success: true, message: "Product published to store" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === GET POD TEMPLATES (from connected providers) ===
    if (action === "get_pod_templates") {
      const { podProvider } = body;

      // Fetch POD provider configuration
      const { data: provider } = await supabase
        .from("pod_providers")
        .select("*")
        .eq("provider", podProvider)
        .eq("status", "connected")
        .single();

      if (!provider) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            templates: [],
            message: `${podProvider} is not connected. Connect it in POD & Apps settings.`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // POD provider template definitions
      const podTemplates: Record<string, Array<{ id: string; name: string; type: string; provider: string; printAreas: string[]; dimensions: { width: number; height: number } }>> = {
        printful: [
          { id: "pf-tshirt-unisex", name: "Unisex Staple T-Shirt", type: "T-Shirt", provider: "printful", printAreas: ["front", "back"], dimensions: { width: 4500, height: 5400 } },
          { id: "pf-hoodie-unisex", name: "Unisex Heavy Blend Hoodie", type: "Hoodie", provider: "printful", printAreas: ["front", "back", "left-sleeve", "right-sleeve"], dimensions: { width: 4500, height: 5400 } },
          { id: "pf-mug-11oz", name: "White Glossy Mug 11oz", type: "Mug", provider: "printful", printAreas: ["front"], dimensions: { width: 2475, height: 1050 } },
          { id: "pf-tote-canvas", name: "Canvas Tote Bag", type: "Tote", provider: "printful", printAreas: ["front", "back"], dimensions: { width: 3600, height: 3600 } },
          { id: "pf-cap-dad", name: "Dad Hat Cap", type: "Cap", provider: "printful", printAreas: ["front"], dimensions: { width: 2400, height: 1200 } },
          { id: "pf-allover-tee", name: "All-Over Print T-Shirt", type: "T-Shirt", provider: "printful", printAreas: ["all-over"], dimensions: { width: 5904, height: 5904 } },
        ],
        printify: [
          { id: "py-tshirt-bella", name: "Bella+Canvas 3001 Tee", type: "T-Shirt", provider: "printify", printAreas: ["front", "back"], dimensions: { width: 4500, height: 5400 } },
          { id: "py-hoodie-gildan", name: "Gildan 18500 Hoodie", type: "Hoodie", provider: "printify", printAreas: ["front", "back"], dimensions: { width: 4500, height: 5400 } },
          { id: "py-mug-ceramic", name: "Ceramic Mug 11oz", type: "Mug", provider: "printify", printAreas: ["front"], dimensions: { width: 2400, height: 1000 } },
          { id: "py-tote-natural", name: "Natural Tote Bag", type: "Tote", provider: "printify", printAreas: ["front"], dimensions: { width: 3000, height: 3000 } },
          { id: "py-cap-structured", name: "Structured Twill Cap", type: "Cap", provider: "printify", printAreas: ["front"], dimensions: { width: 2200, height: 1100 } },
        ],
        gelato: [
          { id: "ge-tshirt-organic", name: "Organic Cotton T-Shirt", type: "T-Shirt", provider: "gelato", printAreas: ["front", "back"], dimensions: { width: 4200, height: 5000 } },
          { id: "ge-hoodie-classic", name: "Classic Hoodie", type: "Hoodie", provider: "gelato", printAreas: ["front", "back"], dimensions: { width: 4200, height: 5000 } },
          { id: "ge-mug-white", name: "White Ceramic Mug", type: "Mug", provider: "gelato", printAreas: ["front"], dimensions: { width: 2400, height: 1000 } },
          { id: "ge-tote-eco", name: "Eco Tote Bag", type: "Tote", provider: "gelato", printAreas: ["front"], dimensions: { width: 3000, height: 3000 } },
        ],
      };

      const templates = podTemplates[podProvider as string] || [];

      return new Response(
        JSON.stringify({ success: true, templates, provider: provider.name }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === MAP PRINT FILE TO TEMPLATE ===
    if (action === "map_print_file") {
      const { designId, fileId, templateId, position } = body as { designId: string; fileId: string; templateId: string; position: string };

      if (!designId || !fileId || !templateId) {
        throw new Error("Design ID, file ID, and template ID are required");
      }

      // Get existing design
      const { data: design, error: designError } = await supabase
        .from("product_designs")
        .select("*")
        .eq("id", designId)
        .single();

      if (designError || !design) {
        throw new Error("Design not found");
      }

      // Update print files with mapping
      const printFiles = (design.print_files as Array<{ id: string; podTemplateId?: string; mappingStatus: string }>) || [];
      const updatedFiles = printFiles.map((f: { id: string; podTemplateId?: string; mappingStatus: string }) =>
        f.id === fileId
          ? { ...f, podTemplateId: templateId, mappingStatus: "mapped" }
          : f
      );

      // Save updated design
      const { error: updateError } = await supabase
        .from("product_designs")
        .update({
          print_files: updatedFiles,
          pod_template_id: templateId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", designId);

      if (updateError) throw updateError;

      // If design has Shopify product ID, update variant mappings
      if (design.shopify_product_id) {
        await supabase
          .from("variant_mappings")
          .update({
            pod_template_id: templateId,
            print_files: updatedFiles.filter((f: { id: string; podTemplateId?: string }) => f.podTemplateId === templateId),
            status: "ok",
            updated_at: new Date().toISOString(),
          })
          .eq("shopify_product_id", design.shopify_product_id);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Print file mapped to template" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === VALIDATE PRINT FILE ===
    if (action === "validate_print_file") {
      const { fileUrl, templateId, podProvider: provider } = body as { fileUrl: string; templateId: string; podProvider: string };

      // Template dimensions for validation
      const templateDimensions: Record<string, { minWidth: number; minHeight: number; maxSize: number }> = {
        "pf-tshirt-unisex": { minWidth: 4500, minHeight: 5400, maxSize: 25000000 },
        "pf-hoodie-unisex": { minWidth: 4500, minHeight: 5400, maxSize: 25000000 },
        "pf-mug-11oz": { minWidth: 2475, minHeight: 1050, maxSize: 10000000 },
        "default": { minWidth: 3000, minHeight: 3000, maxSize: 25000000 },
      };

      const requirements = templateDimensions[templateId] || templateDimensions.default;

      // Return validation requirements (actual image validation would be done client-side)
      return new Response(
        JSON.stringify({
          success: true,
          requirements: {
            minWidth: requirements.minWidth,
            minHeight: requirements.minHeight,
            maxFileSize: requirements.maxSize,
            recommendedDPI: 300,
            acceptedFormats: ["PNG", "PDF", "SVG", "TIFF"],
            colorMode: "sRGB",
          },
          message: `File should be at least ${requirements.minWidth}x${requirements.minHeight}px at 300 DPI`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // === UPLOAD PRINT FILE (storage handled client-side, this updates design record) ===
    if (action === "upload_print_file") {
      const { designId, printFile } = body as { designId: string; printFile: { id: string; name: string; path: string; position: string } };

      if (!designId || !printFile) {
        throw new Error("Design ID and print file data are required");
      }

      // Get existing design
      const { data: design, error: designError } = await supabase
        .from("product_designs")
        .select("print_files")
        .eq("id", designId)
        .single();

      if (designError) throw designError;

      // Append new print file
      const existingFiles = (design?.print_files as Array<unknown>) || [];
      const updatedFiles = [...existingFiles, {
        ...printFile,
        mappingStatus: "unmapped",
        uploadedAt: new Date().toISOString(),
      }];

      // Update design
      const { error: updateError } = await supabase
        .from("product_designs")
        .update({
          print_files: updatedFiles,
          updated_at: new Date().toISOString(),
        })
        .eq("id", designId);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true, message: "Print file added to design" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error("Design studio error:", error);
    return new Response(
      JSON.stringify({ success: false, error: (error as Error).message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
