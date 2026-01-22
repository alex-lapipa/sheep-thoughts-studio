import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MoodProvider } from "@/contexts/MoodContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { WinterThemeProvider } from "@/contexts/WinterThemeContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";

// Eagerly load critical pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy load all other pages for faster initial bundle
const Facts = lazy(() => import("./pages/Facts"));
const Collections = lazy(() => import("./pages/Collections"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Search = lazy(() => import("./pages/Search"));
const Explains = lazy(() => import("./pages/Explains"));
const Achievements = lazy(() => import("./pages/Achievements"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Contact = lazy(() => import("./pages/Contact"));
const ShareBadges = lazy(() => import("./pages/ShareBadges"));
const DataRights = lazy(() => import("./pages/DataRights"));
const NewsletterConfirm = lazy(() => import("./pages/NewsletterConfirm"));
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe"));
const NewsletterPreferences = lazy(() => import("./pages/NewsletterPreferences"));

const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const DACH = lazy(() => import("./pages/DACH"));
const Francophone = lazy(() => import("./pages/Francophone"));
const Hispanic = lazy(() => import("./pages/Hispanic"));
const Scenarios = lazy(() => import("./pages/Scenarios"));
const HallOfFame = lazy(() => import("./pages/HallOfFame"));

// Admin pages - always lazy loaded
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminThoughts = lazy(() => import("./pages/admin/Thoughts"));
const AdminScenarios = lazy(() => import("./pages/admin/Scenarios"));
const AdminTriggers = lazy(() => import("./pages/admin/Triggers"));
const AdminKnowledge = lazy(() => import("./pages/admin/Knowledge"));
const AdminRAGContent = lazy(() => import("./pages/admin/RAGContent"));
const AdminGenerate = lazy(() => import("./pages/admin/Generate"));
const BrandOverview = lazy(() => import("./pages/admin/brand/BrandOverview"));
const BrandColors = lazy(() => import("./pages/admin/brand/BrandColors"));
const BrandTypography = lazy(() => import("./pages/admin/brand/BrandTypography"));
const BrandCharacter = lazy(() => import("./pages/admin/brand/BrandCharacter"));
const BrandProduction = lazy(() => import("./pages/admin/brand/BrandProduction"));
const BrandFrontend = lazy(() => import("./pages/admin/brand/BrandFrontend"));
const AdminWicklowPalette = lazy(() => import("./pages/admin/brand/WicklowPalette"));
const CharacterGallery = lazy(() => import("./pages/admin/brand/CharacterGallery"));
const CharacterReview = lazy(() => import("./pages/admin/brand/CharacterReview"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminPreAuthorizedUsers = lazy(() => import("./pages/admin/PreAuthorizedUsers"));
const AdminMessages = lazy(() => import("./pages/admin/Messages"));
const AdminSpamQueue = lazy(() => import("./pages/admin/SpamQueue"));
const AdminSubscribers = lazy(() => import("./pages/admin/Subscribers"));
const AdminCampaigns = lazy(() => import("./pages/admin/Campaigns"));
const AdminTemplates = lazy(() => import("./pages/admin/Templates"));
const AdminSitemap = lazy(() => import("./pages/admin/Sitemap"));
const AdminOGPreview = lazy(() => import("./pages/admin/OGPreview"));
const AdminOGCacheManager = lazy(() => import("./pages/admin/OGCacheManager"));
const SeasonalBannerPreview = lazy(() => import("./pages/admin/SeasonalBannerPreview"));
const AdminEmbeddings = lazy(() => import("./pages/admin/Embeddings"));
const AdminCronJobs = lazy(() => import("./pages/admin/CronJobs"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const AdminRAGSearch = lazy(() => import("./pages/admin/RAGSearch"));
const ShopifySettings = lazy(() => import("./pages/admin/shopify/ShopifySettings"));
const ShopifyWebhooks = lazy(() => import("./pages/admin/shopify/Webhooks"));
const PODConnections = lazy(() => import("./pages/admin/pod/PODConnections"));
const VariantMappings = lazy(() => import("./pages/admin/pod/VariantMappings"));
const OrdersPage = lazy(() => import("./pages/admin/orders/Orders"));
const ExceptionsPage = lazy(() => import("./pages/admin/orders/Exceptions"));
const ProductsPage = lazy(() => import("./pages/admin/catalog/Products"));
const PricingRulesPage = lazy(() => import("./pages/admin/catalog/PricingRules"));
const DropsPage = lazy(() => import("./pages/admin/catalog/Drops"));
const AdminWhatsNew = lazy(() => import("./pages/admin/WhatsNewAdmin"));
const IllustrationGenerator = lazy(() => import("./pages/admin/IllustrationGenerator"));
// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <SettingsProvider>
          <ThemeProvider>
            <WinterThemeProvider>
              <AuthProvider>
                <MoodProvider>
                  <Toaster />
                  <Sonner position="top-center" />
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/facts" element={<Facts />} />
                  <Route path="/collections/:collection" element={<Collections />} />
                  <Route path="/product/:handle" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/explains" element={<Explains />} />
                  <Route path="/achievements" element={<Achievements />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/share-badges" element={<ShareBadges />} />
                  <Route path="/data-rights" element={<DataRights />} />
                  <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
                  <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
                  <Route path="/newsletter/preferences" element={<NewsletterPreferences />} />
                  
                  <Route path="/checkout/success" element={<CheckoutSuccess />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/scenarios" element={<Scenarios />} />
                  <Route path="/hall-of-fame" element={<HallOfFame />} />
                  <Route path="/dach" element={<DACH />} />
                  <Route path="/de" element={<DACH />} />
                  <Route path="/at" element={<DACH />} />
                  <Route path="/ch" element={<DACH />} />
                  <Route path="/fr" element={<Francophone />} />
                  <Route path="/be" element={<Francophone />} />
                  <Route path="/lu" element={<Francophone />} />
                  <Route path="/es" element={<Hispanic />} />
                  <Route path="/mx" element={<Hispanic />} />
                  <Route path="/ar" element={<Hispanic />} />
                  <Route path="/co" element={<Hispanic />} />
                  <Route path="/latam" element={<Hispanic />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
                  <Route path="/admin/thoughts" element={<ProtectedRoute><AdminThoughts /></ProtectedRoute>} />
                  <Route path="/admin/scenarios" element={<ProtectedRoute><AdminScenarios /></ProtectedRoute>} />
                  <Route path="/admin/triggers" element={<ProtectedRoute><AdminTriggers /></ProtectedRoute>} />
                  <Route path="/admin/knowledge" element={<ProtectedRoute><AdminKnowledge /></ProtectedRoute>} />
                  <Route path="/admin/rag-content" element={<ProtectedRoute><AdminRAGContent /></ProtectedRoute>} />
                  <Route path="/admin/generate" element={<ProtectedRoute><AdminGenerate /></ProtectedRoute>} />
                  
                  {/* Brand Book Routes */}
                  <Route path="/admin/brand" element={<ProtectedRoute><BrandOverview /></ProtectedRoute>} />
                  <Route path="/admin/brand/colors" element={<ProtectedRoute><BrandColors /></ProtectedRoute>} />
                  <Route path="/admin/brand/typography" element={<ProtectedRoute><BrandTypography /></ProtectedRoute>} />
                  <Route path="/admin/brand/character" element={<ProtectedRoute><BrandCharacter /></ProtectedRoute>} />
                  <Route path="/admin/brand/production" element={<ProtectedRoute><BrandProduction /></ProtectedRoute>} />
                  <Route path="/admin/brand/frontend" element={<ProtectedRoute><BrandFrontend /></ProtectedRoute>} />
                  <Route path="/admin/brand/wicklow-palette" element={<ProtectedRoute><AdminWicklowPalette /></ProtectedRoute>} />
                  <Route path="/admin/brand/gallery" element={<ProtectedRoute><CharacterGallery /></ProtectedRoute>} />
                  <Route path="/admin/brand/review" element={<ProtectedRoute><CharacterReview /></ProtectedRoute>} />
                  
                  {/* Shopify Routes */}
                  <Route path="/admin/shopify" element={<ProtectedRoute><ShopifySettings /></ProtectedRoute>} />
                  <Route path="/admin/shopify/webhooks" element={<ProtectedRoute><ShopifyWebhooks /></ProtectedRoute>} />
                  
                  {/* POD Routes */}
                  <Route path="/admin/pod" element={<ProtectedRoute><PODConnections /></ProtectedRoute>} />
                  <Route path="/admin/pod/mappings" element={<ProtectedRoute><VariantMappings /></ProtectedRoute>} />
                  
                  {/* Orders Routes */}
                  <Route path="/admin/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/admin/orders/exceptions" element={<ProtectedRoute><ExceptionsPage /></ProtectedRoute>} />
                  
                  {/* Catalog Routes */}
                  <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                  <Route path="/admin/pricing" element={<ProtectedRoute><PricingRulesPage /></ProtectedRoute>} />
                  <Route path="/admin/drops" element={<ProtectedRoute><DropsPage /></ProtectedRoute>} />
                  
                  {/* Support Routes */}
                  <Route path="/admin/messages" element={<ProtectedRoute><AdminMessages /></ProtectedRoute>} />
                  <Route path="/admin/spam-queue" element={<ProtectedRoute><AdminSpamQueue /></ProtectedRoute>} />
                  <Route path="/admin/subscribers" element={<ProtectedRoute><AdminSubscribers /></ProtectedRoute>} />
                  <Route path="/admin/campaigns" element={<ProtectedRoute><AdminCampaigns /></ProtectedRoute>} />
                  <Route path="/admin/templates" element={<ProtectedRoute><AdminTemplates /></ProtectedRoute>} />
                  
                  {/* System Routes - Super Admin Only */}
                  <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><AdminUsers /></ProtectedRoute>} />
                  <Route path="/admin/pre-authorized" element={<ProtectedRoute requireSuperAdmin><AdminPreAuthorizedUsers /></ProtectedRoute>} />
                  <Route path="/admin/sitemap" element={<ProtectedRoute><AdminSitemap /></ProtectedRoute>} />
                  <Route path="/admin/og-preview" element={<ProtectedRoute><AdminOGPreview /></ProtectedRoute>} />
                  <Route path="/admin/og-cache" element={<ProtectedRoute><AdminOGCacheManager /></ProtectedRoute>} />
                  <Route path="/admin/seasonal-banners" element={<ProtectedRoute><SeasonalBannerPreview /></ProtectedRoute>} />
                  <Route path="/admin/embeddings" element={<ProtectedRoute><AdminEmbeddings /></ProtectedRoute>} />
                  <Route path="/admin/cron-jobs" element={<ProtectedRoute><AdminCronJobs /></ProtectedRoute>} />
                  <Route path="/admin/audit" element={<ProtectedRoute><AdminAuditLog /></ProtectedRoute>} />
                  <Route path="/admin/rag-search" element={<ProtectedRoute><AdminRAGSearch /></ProtectedRoute>} />
                  <Route path="/admin/whats-new" element={<ProtectedRoute><AdminWhatsNew /></ProtectedRoute>} />
                  <Route path="/admin/illustrations" element={<ProtectedRoute><IllustrationGenerator /></ProtectedRoute>} />
                  
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <CookieConsent />
              </BrowserRouter>
            </MoodProvider>
          </AuthProvider>
        </WinterThemeProvider>
      </ThemeProvider>
    </SettingsProvider>
  </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
