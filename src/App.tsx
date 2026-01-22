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
import Index from "./pages/Index";
import Facts from "./pages/Facts";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Search from "./pages/Search";
import Explains from "./pages/Explains";
import Achievements from "./pages/Achievements";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Shipping from "./pages/Shipping";
import Contact from "./pages/Contact";
import ShareBadges from "./pages/ShareBadges";
import DataRights from "./pages/DataRights";
import NewsletterConfirm from "./pages/NewsletterConfirm";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import NewsletterPreferences from "./pages/NewsletterPreferences";
import WhatsNew from "./pages/WhatsNew";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminThoughts from "./pages/admin/Thoughts";
import AdminScenarios from "./pages/admin/Scenarios";
import AdminTriggers from "./pages/admin/Triggers";
import AdminKnowledge from "./pages/admin/Knowledge";
import AdminRAGContent from "./pages/admin/RAGContent";
import AdminGenerate from "./pages/admin/Generate";
import BrandOverview from "./pages/admin/brand/BrandOverview";
import BrandColors from "./pages/admin/brand/BrandColors";
import BrandTypography from "./pages/admin/brand/BrandTypography";
import BrandCharacter from "./pages/admin/brand/BrandCharacter";
import BrandProduction from "./pages/admin/brand/BrandProduction";
import BrandFrontend from "./pages/admin/brand/BrandFrontend";
import AdminWicklowPalette from "./pages/admin/brand/WicklowPalette";
import AdminUsers from "./pages/admin/Users";
import AdminPreAuthorizedUsers from "./pages/admin/PreAuthorizedUsers";
import AdminMessages from "./pages/admin/Messages";
import AdminSpamQueue from "./pages/admin/SpamQueue";
import AdminSubscribers from "./pages/admin/Subscribers";
import AdminCampaigns from "./pages/admin/Campaigns";
import AdminTemplates from "./pages/admin/Templates";
import AdminSitemap from "./pages/admin/Sitemap";
import AdminOGPreview from "./pages/admin/OGPreview";
import AdminOGCacheManager from "./pages/admin/OGCacheManager";
import SeasonalBannerPreview from "./pages/admin/SeasonalBannerPreview";
import AdminEmbeddings from "./pages/admin/Embeddings";
import AdminCronJobs from "./pages/admin/CronJobs";

const queryClient = new QueryClient();

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
                <Route path="/whats-new" element={<WhatsNew />} />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                
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
                
                  <Route path="*" element={<NotFound />} />
                </Routes>
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
