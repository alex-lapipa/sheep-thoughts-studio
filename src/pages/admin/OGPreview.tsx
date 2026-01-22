import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Loader2, RefreshCw, Copy, Image as ImageIcon, Share2, Trash2, HardDrive, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { SocialPreviewTester } from '@/components/SocialPreviewTester';
import { PlatformPreviewComparison } from '@/components/admin/PlatformPreviewComparison';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const MODES = ['innocent', 'concerned', 'triggered', 'savage', 'nuclear'] as const;
const PRODUCT_TYPES = ['t-shirt', 'hoodie', 'mug', 'poster', 'sticker', 'tote-bag'] as const;

interface CachedImage {
  name: string;
  id: string;
  created_at: string;
  metadata: Record<string, any> | null;
}

export default function OGPreview() {
  const [activeTab, setActiveTab] = useState('product');
  
  // Product OG state
  const [productTitle, setProductTitle] = useState('Confidently Wrong Tee');
  const [productPrice, setProductPrice] = useState('29.99');
  const [productMode, setProductMode] = useState<typeof MODES[number]>('innocent');
  const [productType, setProductType] = useState<typeof PRODUCT_TYPES[number]>('t-shirt');
  const [productLoading, setProductLoading] = useState(false);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  
  // Badge OG state
  const [badgeName, setBadgeName] = useState('Bubbles Fan');
  const [badgeStreak, setBadgeStreak] = useState('7');
  const [selectedBadges, setSelectedBadges] = useState<number[]>([3, 7]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeImageUrl, setBadgeImageUrl] = useState<string | null>(null);

  // Cache management state
  const [cachedImages, setCachedImages] = useState<CachedImage[]>([]);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const fetchCachedImages = useCallback(async () => {
    setCacheLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('og-images')
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;
      setCachedImages(data || []);
    } catch (error) {
      console.error('Error fetching cached images:', error);
    } finally {
      setCacheLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCachedImages();
  }, [fetchCachedImages]);

  const deleteImage = async (name: string) => {
    setDeletingImage(name);
    try {
      const { error } = await supabase.storage.from('og-images').remove([name]);
      if (error) throw error;
      setCachedImages(prev => prev.filter(img => img.name !== name));
      toast.success('Image deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingImage(null);
    }
  };

  const clearAllCache = async () => {
    setClearingAll(true);
    try {
      const names = cachedImages.map(img => img.name);
      for (let i = 0; i < names.length; i += 100) {
        const batch = names.slice(i, i + 100);
        const { error } = await supabase.storage.from('og-images').remove(batch);
        if (error) throw error;
      }
      setCachedImages([]);
      toast.success(`Cleared ${names.length} cached images`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearingAll(false);
    }
  };

  const getImageType = (name: string) => {
    if (name.startsWith('product-')) return 'Product';
    if (name.startsWith('badge-')) return 'Badge';
    if (name.startsWith('privacy-')) return 'Privacy';
    if (name.startsWith('shipping-')) return 'Shipping';
    if (name.startsWith('contact-')) return 'Contact';
    return 'Other';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const totalCacheSize = cachedImages.reduce((acc, img) => acc + (img.metadata?.size || 0), 0);

  const generateProductOG = async (skipCache = false) => {
    setProductLoading(true);
    try {
      const params = new URLSearchParams({
        title: productTitle,
        price: productPrice,
        mode: productMode,
        type: productType,
      });
      if (skipCache) params.append('nocache', '1');
      
      const url = `${supabaseUrl}/functions/v1/og-product-image?${params}`;
      
      // Fetch as blob to display
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate image');
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProductImageUrl(imageUrl);
      
      toast.success(skipCache ? 'Generated fresh image (cache bypassed)' : 'Image generated');
    } catch (error) {
      console.error('Error generating product OG:', error);
      toast.error('Failed to generate OG image');
    } finally {
      setProductLoading(false);
    }
  };

  const generateBadgeOG = async (skipCache = false) => {
    setBadgeLoading(true);
    try {
      const params = new URLSearchParams({
        name: badgeName,
        streak: badgeStreak,
        badges: selectedBadges.join(','),
      });
      if (skipCache) params.append('nocache', '1');
      
      const url = `${supabaseUrl}/functions/v1/og-badge-image?${params}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to generate image');
      
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setBadgeImageUrl(imageUrl);
      
      toast.success(skipCache ? 'Generated fresh image (cache bypassed)' : 'Image generated');
    } catch (error) {
      console.error('Error generating badge OG:', error);
      toast.error('Failed to generate OG image');
    } finally {
      setBadgeLoading(false);
    }
  };

  const copyUrl = (type: 'product' | 'badge') => {
    let url = '';
    if (type === 'product') {
      const params = new URLSearchParams({
        title: productTitle,
        price: productPrice,
        mode: productMode,
        type: productType,
      });
      url = `${supabaseUrl}/functions/v1/og-product-image?${params}`;
    } else {
      const params = new URLSearchParams({
        name: badgeName,
        streak: badgeStreak,
        badges: selectedBadges.join(','),
      });
      url = `${supabaseUrl}/functions/v1/og-badge-image?${params}`;
    }
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const BADGE_OPTIONS = [
    { days: 3, emoji: "🌱", title: "Seedling" },
    { days: 7, emoji: "🔥", title: "Week Warrior" },
    { days: 14, emoji: "⭐", title: "Fortnight Scholar" },
    { days: 30, emoji: "🏆", title: "Monthly Master" },
    { days: 60, emoji: "🧙", title: "Wisdom Sage" },
    { days: 100, emoji: "💯", title: "Centurion" },
    { days: 365, emoji: "🐑", title: "Year of Enlightenment" },
  ];

  const toggleBadge = (days: number) => {
    setSelectedBadges(prev => 
      prev.includes(days) 
        ? prev.filter(d => d !== days)
        : [...prev, days]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display">OG Image Preview</h1>
            <p className="text-muted-foreground">
              Preview and test Open Graph images before sharing on social media
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="product">Product OG</TabsTrigger>
            <TabsTrigger value="badge">Badge OG</TabsTrigger>
            <TabsTrigger value="cache">Cache Management</TabsTrigger>
          </TabsList>

          <TabsContent value="product" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Product Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the product details for the OG image
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-title">Product Title</Label>
                    <Input
                      id="product-title"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      placeholder="e.g., Confidently Wrong Tee"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="product-price">Price (€)</Label>
                    <Input
                      id="product-price"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="29.99"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Bubbles Mode</Label>
                    <Select value={productMode} onValueChange={(v) => setProductMode(v as typeof MODES[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MODES.map(mode => (
                          <SelectItem key={mode} value={mode} className="capitalize">
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select value={productType} onValueChange={(v) => setProductType(v as typeof PRODUCT_TYPES[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type.replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => generateProductOG()} disabled={productLoading}>
                      {productLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      )}
                      Generate Preview
                    </Button>
                    <Button variant="outline" onClick={() => generateProductOG(true)} disabled={productLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Force Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Preview
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyUrl('product')}
                        disabled={!productTitle}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <SocialPreviewTester path={`/product/preview`} />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    1200×630 pixels (Facebook/LinkedIn optimal size)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden border">
                    {productLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : productImageUrl ? (
                      <img 
                        src={productImageUrl} 
                        alt="Product OG Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p>Click "Generate Preview" to see the OG image</p>
                      </div>
                    )}
                  </div>
                  
                  {productImageUrl && (
                    <div className="mt-4 flex gap-2">
                      <Badge variant="outline">Mode: {productMode}</Badge>
                      <Badge variant="outline">Type: {productType}</Badge>
                      <Badge variant="outline">€{productPrice}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform Comparison */}
            <PlatformPreviewComparison
              imageUrl={productImageUrl}
              title={productTitle}
              loading={productLoading}
            />
          </TabsContent>

          <TabsContent value="badge" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Badge Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure the badge collection for sharing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge-name">User Name</Label>
                    <Input
                      id="badge-name"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="e.g., Bubbles Fan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge-streak">Current Streak (days)</Label>
                    <Input
                      id="badge-streak"
                      type="number"
                      value={badgeStreak}
                      onChange={(e) => setBadgeStreak(e.target.value)}
                      placeholder="7"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unlocked Badges</Label>
                    <div className="flex flex-wrap gap-2">
                      {BADGE_OPTIONS.map(badge => (
                        <Button
                          key={badge.days}
                          variant={selectedBadges.includes(badge.days) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleBadge(badge.days)}
                        >
                          {badge.emoji} {badge.title}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => generateBadgeOG()} disabled={badgeLoading}>
                      {badgeLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <ImageIcon className="h-4 w-4 mr-2" />
                      )}
                      Generate Preview
                    </Button>
                    <Button variant="outline" onClick={() => generateBadgeOG(true)} disabled={badgeLoading}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Force Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      Preview
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyUrl('badge')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <SocialPreviewTester path="/share-badges" />
                    </div>
                  </CardTitle>
                  <CardDescription>
                    1200×630 pixels (Facebook/LinkedIn optimal size)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden border">
                    {badgeLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : badgeImageUrl ? (
                      <img 
                        src={badgeImageUrl} 
                        alt="Badge OG Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p>Click "Generate Preview" to see the OG image</p>
                      </div>
                    )}
                  </div>
                  
                  {badgeImageUrl && (
                    <div className="mt-4 flex gap-2 flex-wrap">
                      <Badge variant="outline">Streak: {badgeStreak} days</Badge>
                      <Badge variant="outline">{selectedBadges.length} badges unlocked</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Platform Comparison */}
            <PlatformPreviewComparison
              imageUrl={badgeImageUrl}
              title={`${badgeName}'s Achievements`}
              loading={badgeLoading}
            />
          </TabsContent>

          <TabsContent value="cache" className="space-y-6">
            {/* Cache Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Cached Images</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    {cachedImages.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Size</CardDescription>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-muted-foreground" />
                    {formatBytes(totalCacheSize)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Actions</CardDescription>
                  <CardContent className="p-0 pt-2">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={fetchCachedImages} disabled={cacheLoading}>
                        {cacheLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={cachedImages.length === 0 || clearingAll}>
                            {clearingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Clear All
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Clear All Cached Images?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete {cachedImages.length} cached OG images. They will be regenerated on next request.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={clearAllCache}>Clear All</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </CardHeader>
              </Card>
            </div>

            {/* Cached Images List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Cached Images
                </CardTitle>
                <CardDescription>
                  View and manage individual cached OG images
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cacheLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : cachedImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mb-2" />
                    <p>No cached images</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {cachedImages.map(image => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                              <img
                                src={`${supabaseUrl}/storage/v1/object/public/og-images/${image.name}`}
                                alt={image.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-mono truncate">{image.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {getImageType(image.name)}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(image.metadata?.size || 0)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(image.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteImage(image.name)}
                            disabled={deletingImage === image.name}
                            className="flex-shrink-0"
                          >
                            {deletingImage === image.name ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>OG Image Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>OG images are generated using AI and cached in storage for 7 days</li>
              <li>Use "Force Refresh" to bypass the cache and generate a fresh image</li>
              <li>Copy the URL to use in meta tags or for testing with social media debuggers</li>
              <li>Images are optimized for Facebook, LinkedIn, and Twitter sharing</li>
              <li>The recommended size is 1200×630 pixels with 16:9 aspect ratio</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
