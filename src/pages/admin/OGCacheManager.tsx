import { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Trash2,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Search,
  HardDrive,
  Clock,
  FileImage,
  CheckSquare,
  Square,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  History,
  Sparkles,
  Calendar,
  Globe,
  Languages,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CachedImage {
  name: string;
  id: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any> | null;
  selected: boolean;
}

interface CleanupRecord {
  date: string;
  scanned: number;
  deleted: number;
  failed: number;
  freedBytes: number;
}

interface CacheStats {
  period: string;
  generatedAt: string;
  cache: {
    hits: number;
    misses: number;
    regenerations: number;
    total: number;
    hitRate: number;
    byType: Record<string, { hits: number; misses: number; regenerations: number }>;
  };
  storage: {
    totalFiles: number;
    totalSizeBytes: number;
    totalSizeMB: number;
    byType: Record<string, { count: number; size: number }>;
    oldestFile: { name: string; createdAt: string } | null;
    newestFile: { name: string; createdAt: string } | null;
  };
  cleanup: {
    totalCleanups: number;
    totalDeleted: number;
    totalFreedBytes: number;
    lastCleanup: CleanupRecord | null;
    history: CleanupRecord[];
  };
  hourlyStats: Array<{ hour: string; hits: number; misses: number }>;
}

// Available OG pages for bulk regeneration
const OG_PAGES = [
  { key: 'home', name: 'Home', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'about', name: 'About', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'facts', name: 'Facts', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'faq', name: 'FAQ', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'explains', name: 'Explains', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'achievements', name: 'Achievements', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'collections', name: 'Collections', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'contact', name: 'Contact', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'privacy', name: 'Privacy', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'shipping', name: 'Shipping', languages: ['en', 'es', 'fr', 'de'] },
  { key: 'dach', name: 'DACH', languages: ['de', 'at', 'ch'] },
];

interface BulkRegenerateResult {
  page: string;
  language: string;
  success: boolean;
  error?: string;
}

export default function OGCacheManager() {
  const [images, setImages] = useState<CachedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bulk regeneration state
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateResults, setRegenerateResults] = useState<BulkRegenerateResult[]>([]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('og-images')
        .list('', {
          limit: 500,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;

      const imagesWithSelection = (data || []).map(img => ({
        ...img,
        selected: false,
      }));

      setImages(imagesWithSelection);
    } catch (error) {
      console.error('Error fetching cached images:', error);
      toast.error('Failed to fetch cached images');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('og-cache-stats', {
        body: { period: statsPeriod }
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [statsPeriod]);

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, [fetchImages, fetchStats]);

  const deleteImage = async (name: string) => {
    setDeleting(name);
    try {
      const { error } = await supabase.storage
        .from('og-images')
        .remove([name]);

      if (error) throw error;

      setImages(prev => prev.filter(img => img.name !== name));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  };

  const deleteSelected = async () => {
    const selectedNames = images.filter(img => img.selected).map(img => img.name);
    if (selectedNames.length === 0) return;

    setDeleting('selected');
    try {
      const { error } = await supabase.storage
        .from('og-images')
        .remove(selectedNames);

      if (error) throw error;

      setImages(prev => prev.filter(img => !img.selected));
      toast.success(`Deleted ${selectedNames.length} images`);
    } catch (error) {
      console.error('Error deleting selected images:', error);
      toast.error('Failed to delete selected images');
    } finally {
      setDeleting(null);
    }
  };

  const clearAllCache = async () => {
    setClearingAll(true);
    try {
      const allNames = images.map(img => img.name);
      
      if (allNames.length === 0) {
        toast.info('Cache is already empty');
        return;
      }

      // Delete in batches of 100
      for (let i = 0; i < allNames.length; i += 100) {
        const batch = allNames.slice(i, i + 100);
        const { error } = await supabase.storage
          .from('og-images')
          .remove(batch);

        if (error) throw error;
      }

      setImages([]);
      toast.success(`Cleared ${allNames.length} cached images`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearingAll(false);
    }
  };

  const bulkRegenerate = async (pageKey: string) => {
    setRegenerating(true);
    setRegenerateResults([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('og-bulk-regenerate', {
        body: { page: pageKey, deleteExisting: true },
      });

      if (error) throw error;

      if (data.results) {
        setRegenerateResults(data.results);
        const successCount = data.results.filter((r: BulkRegenerateResult) => r.success).length;
        const failCount = data.results.filter((r: BulkRegenerateResult) => !r.success).length;
        
        if (failCount === 0) {
          toast.success(`Regenerated ${successCount} language variants for ${pageKey}`);
        } else {
          toast.warning(`Regenerated ${successCount}/${data.results.length} variants (${failCount} failed)`);
        }
        
        // Refresh the image list
        fetchImages();
      }
    } catch (error) {
      console.error('Bulk regeneration error:', error);
      toast.error('Failed to regenerate images');
    } finally {
      setRegenerating(false);
    }
  };

  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setImages(prev => prev.map(img => ({ ...img, selected: newSelectAll })));
  };

  const toggleImageSelection = (name: string) => {
    setImages(prev => prev.map(img => 
      img.name === name ? { ...img, selected: !img.selected } : img
    ));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getImageType = (name: string): string => {
    if (name.startsWith('product-')) return 'Product';
    if (name.startsWith('badge-')) return 'Badge';
    if (name.startsWith('privacy-')) return 'Privacy';
    if (name.startsWith('shipping-')) return 'Shipping';
    if (name.startsWith('contact-')) return 'Contact';
    return 'Other';
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Product': return 'bg-primary/10 text-primary';
      case 'Badge': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
      case 'Privacy': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'Shipping': return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'Contact': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const filteredImages = images.filter(img =>
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCount = images.filter(img => img.selected).length;
  const totalSize = images.reduce((acc, img) => acc + (img.metadata?.size || 0), 0);

  const typeCounts = images.reduce((acc, img) => {
    const type = getImageType(img.name);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">OG Image Cache</h1>
            <p className="text-muted-foreground mt-1">
              View and manage cached Open Graph images
            </p>
          </div>
          <div className="flex gap-2">
            {/* Bulk Regenerate Dialog */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Languages className="h-4 w-4 mr-2" />
                  Bulk Regenerate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-accent" />
                    Bulk Regenerate Language Variants
                  </DialogTitle>
                  <DialogDescription>
                    Select a page to regenerate all language variants at once. This will delete existing cached images and generate fresh ones.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Page</label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a page..." />
                      </SelectTrigger>
                      <SelectContent>
                        {OG_PAGES.map((page) => (
                          <SelectItem key={page.key} value={page.key}>
                            <div className="flex items-center gap-2">
                              <span>{page.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {page.languages.length} langs
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPage && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">Languages to regenerate:</p>
                      <div className="flex flex-wrap gap-1">
                        {OG_PAGES.find(p => p.key === selectedPage)?.languages.map((lang) => (
                          <Badge key={lang} variant="secondary" className="uppercase">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {regenerateResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Results:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {regenerateResults.map((result, idx) => (
                          <div 
                            key={idx} 
                            className={`flex items-center justify-between p-2 rounded text-sm ${
                              result.success ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}
                          >
                            <span className="uppercase font-mono">{result.language}</span>
                            <Badge variant={result.success ? 'default' : 'destructive'}>
                              {result.success ? '✓ Success' : `✗ ${result.error}`}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setBulkDialogOpen(false);
                      setSelectedPage('');
                      setRegenerateResults([]);
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => bulkRegenerate(selectedPage)}
                    disabled={!selectedPage || regenerating}
                  >
                    {regenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate All Variants
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={fetchImages} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={images.length === 0 || clearingAll}>
                  {clearingAll ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Clear All Cache
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear entire OG image cache?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {images.length} cached OG images. Images will be regenerated on next request, which may take time and use AI credits.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllCache} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Tabs for Overview and Stats */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Cache Overview</TabsTrigger>
            <TabsTrigger value="stats">Hit/Miss Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Storage Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Cached Files</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <FileImage className="h-6 w-6 text-primary" />
                    {images.length}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {typeCounts['Product'] || 0} products, {typeCounts['Badge'] || 0} badges
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Storage Used</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-accent" />
                    {formatBytes(totalSize)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    Avg {images.length > 0 ? formatBytes(totalSize / images.length) : '0 B'} per image
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cleanup Runs</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    {stats?.cleanup?.totalCleanups || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {stats?.cleanup?.totalDeleted || 0} files cleaned total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Space Reclaimed</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <History className="h-6 w-6 text-secondary-foreground" />
                    {formatBytes(stats?.cleanup?.totalFreedBytes || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    From automated cleanups
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cleanup History */}
            {stats?.cleanup?.history && stats.cleanup.history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Cleanup History
                  </CardTitle>
                  <CardDescription>Recent automated cache cleanup operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.cleanup.history.map((cleanup, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-primary/10">
                            <Sparkles className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              Cleaned {cleanup.deleted} files
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(cleanup.date), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            {formatBytes(cleanup.freedBytes)} freed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {cleanup.scanned} scanned
                            {cleanup.failed > 0 && (
                              <span className="text-destructive ml-1">
                                ({cleanup.failed} failed)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Cleanup History Yet */}
            {(!stats?.cleanup?.history || stats.cleanup.history.length === 0) && !statsLoading && (
              <Card className="bg-muted/30">
                <CardContent className="pt-6">
                  <div className="flex gap-4 items-start">
                    <History className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div>
                      <h3 className="font-medium mb-1">No Cleanup History Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        The automated cleanup runs weekly on Sundays at 3 AM UTC, removing images older than 30 days.
                        You can also trigger a manual cleanup from the Scheduled Tasks page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Time Period:</span>
              <Select value={statsPeriod} onValueChange={(v) => { setStatsPeriod(v); }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchStats} disabled={statsLoading}>
                {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>

            {/* Hit/Miss Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cache Hits</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2 text-primary">
                    <TrendingUp className="h-6 w-6" />
                    {stats?.cache.hits || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cache Misses</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2 text-destructive">
                    <TrendingDown className="h-6 w-6" />
                    {stats?.cache.misses || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Regenerations</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2 text-accent">
                    <Zap className="h-6 w-6" />
                    {stats?.cache.regenerations || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Requests</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-muted-foreground" />
                    {stats?.cache.total || 0}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Hit Rate</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary" />
                    {stats?.cache.hitRate?.toFixed(1) || 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Progress value={stats?.cache.hitRate || 0} className="h-2" />
                </CardContent>
              </Card>
            </div>

            {/* Stats by Type */}
            {stats?.cache.byType && Object.keys(stats.cache.byType).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Statistics by Image Type</CardTitle>
                  <CardDescription>Cache performance broken down by image type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats.cache.byType).map(([type, typeStats]) => {
                      const typeTotal = typeStats.hits + typeStats.misses;
                      const typeHitRate = typeTotal > 0 ? (typeStats.hits / typeTotal) * 100 : 0;
                      return (
                        <div key={type} className="flex items-center gap-4">
                          <div className="w-24 font-medium capitalize">{type}</div>
                          <div className="flex-1">
                            <Progress value={typeHitRate} className="h-2" />
                          </div>
                          <div className="w-48 flex gap-3 text-sm">
                            <span className="text-primary">{typeStats.hits} hits</span>
                            <span className="text-destructive">{typeStats.misses} misses</span>
                            <span className="text-muted-foreground">{typeHitRate.toFixed(0)}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Storage Info */}
            {stats?.storage && (
              <Card>
                <CardHeader>
                  <CardTitle>Storage Details</CardTitle>
                  <CardDescription>Cache file information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Files</p>
                      <p className="text-2xl font-bold">{stats.storage.totalFiles}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Size</p>
                      <p className="text-2xl font-bold">{stats.storage.totalSizeMB} MB</p>
                    </div>
                    {stats.storage.oldestFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Oldest Cached</p>
                        <p className="text-sm font-mono">{stats.storage.oldestFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(stats.storage.oldestFile.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {stats.storage.newestFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Newest Cached</p>
                        <p className="text-sm font-mono">{stats.storage.newestFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(stats.storage.newestFile.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {statsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Search and Bulk Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cached images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  disabled={filteredImages.length === 0}
                >
                  {selectAll ? (
                    <CheckSquare className="h-4 w-4 mr-2" />
                  ) : (
                    <Square className="h-4 w-4 mr-2" />
                  )}
                  {selectAll ? 'Deselect All' : 'Select All'}
                </Button>
                {selectedCount > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={deleting === 'selected'}>
                        {deleting === 'selected' ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Delete Selected ({selectedCount})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedCount} images?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The images will be regenerated on next request.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Cached Images</CardTitle>
            <CardDescription>
              {filteredImages.length} image{filteredImages.length !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-3" />
                <p className="text-lg font-medium">No cached images</p>
                <p className="text-sm">
                  {searchQuery ? 'Try a different search query' : 'OG images will appear here once generated'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredImages.map((image) => {
                  const type = getImageType(image.name);
                  const publicUrl = `${supabaseUrl}/storage/v1/object/public/og-images/${image.name}`;
                  
                  return (
                    <div
                      key={image.id}
                      className={`group relative border rounded-lg overflow-hidden transition-all ${
                        image.selected ? 'ring-2 ring-primary' : 'hover:border-primary/50'
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={image.selected}
                          onCheckedChange={() => toggleImageSelection(image.name)}
                          className="bg-background/80 backdrop-blur-sm"
                        />
                      </div>

                      {/* Image Preview */}
                      <div className="aspect-[1200/630] bg-muted">
                        <img
                          src={publicUrl}
                          alt={image.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>

                      {/* Info Overlay */}
                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <Badge className={`${getTypeColor(type)} text-xs`}>
                            {type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatBytes(image.metadata?.size || 0)}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-muted-foreground truncate" title={image.name}>
                          {image.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteImage(image.name)}
                            disabled={deleting === image.name}
                          >
                            {deleting === image.name ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <ImageIcon className="h-8 w-8 text-primary shrink-0" />
              <div>
                <h3 className="font-medium mb-1">About OG Image Caching</h3>
                <p className="text-sm text-muted-foreground">
                  Open Graph images are generated using AI and stored in a public bucket for fast serving. 
                  Images are cached indefinitely until manually cleared. Deleting an image will cause it 
                  to be regenerated on the next request, which uses AI credits. Use "Force Refresh" in the 
                  OG Preview page to regenerate specific images.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
