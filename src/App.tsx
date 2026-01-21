import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import Collections from "./pages/Collections";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminThoughts from "./pages/admin/Thoughts";
import AdminScenarios from "./pages/admin/Scenarios";
import AdminTriggers from "./pages/admin/Triggers";
import AdminKnowledge from "./pages/admin/Knowledge";
import AdminGenerate from "./pages/admin/Generate";
import BrandOverview from "./pages/admin/brand/BrandOverview";
import BrandColors from "./pages/admin/brand/BrandColors";
import BrandTypography from "./pages/admin/brand/BrandTypography";
import BrandCharacter from "./pages/admin/brand/BrandCharacter";
import BrandProduction from "./pages/admin/brand/BrandProduction";
import AdminUsers from "./pages/admin/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/collections/:collection" element={<Collections />} />
            <Route path="/product/:handle" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/search" element={<Search />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/thoughts" element={<ProtectedRoute><AdminThoughts /></ProtectedRoute>} />
            <Route path="/admin/scenarios" element={<ProtectedRoute><AdminScenarios /></ProtectedRoute>} />
            <Route path="/admin/triggers" element={<ProtectedRoute><AdminTriggers /></ProtectedRoute>} />
            <Route path="/admin/knowledge" element={<ProtectedRoute><AdminKnowledge /></ProtectedRoute>} />
            <Route path="/admin/generate" element={<ProtectedRoute><AdminGenerate /></ProtectedRoute>} />
            
            {/* Brand Book Routes */}
            <Route path="/admin/brand" element={<ProtectedRoute><BrandOverview /></ProtectedRoute>} />
            <Route path="/admin/brand/colors" element={<ProtectedRoute><BrandColors /></ProtectedRoute>} />
            <Route path="/admin/brand/typography" element={<ProtectedRoute><BrandTypography /></ProtectedRoute>} />
            <Route path="/admin/brand/character" element={<ProtectedRoute><BrandCharacter /></ProtectedRoute>} />
            <Route path="/admin/brand/production" element={<ProtectedRoute><BrandProduction /></ProtectedRoute>} />
            
            {/* System Routes - Super Admin Only */}
            <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><AdminUsers /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
