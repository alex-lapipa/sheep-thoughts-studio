import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Globe, MessageCircle } from 'lucide-react';

interface PlatformPreviewComparisonProps {
  imageUrl: string | null;
  title: string;
  description?: string;
  loading?: boolean;
}

// Platform mockups with their specific styling
const platforms = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    aspectRatio: '1200/628',
    cardStyle: 'rounded-2xl',
    bgColor: 'bg-black',
    textColor: 'text-white',
    description: 'Summary Large Image Card',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    aspectRatio: '1200/630',
    cardStyle: 'rounded-lg',
    bgColor: 'bg-[#1877F2]',
    textColor: 'text-white',
    description: 'Link Preview',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    aspectRatio: '1200/627',
    cardStyle: 'rounded-none',
    bgColor: 'bg-[#0A66C2]',
    textColor: 'text-white',
    description: 'Article Preview',
  },
];

export function PlatformPreviewComparison({
  imageUrl,
  title,
  description = 'See how your OG image appears on different platforms',
  loading = false,
}: PlatformPreviewComparisonProps) {
  if (!imageUrl && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Platform Comparison
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p>Generate an image first to see platform previews</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Platform Comparison
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {platforms.map((platform) => (
            <div key={platform.id} className="space-y-3">
              {/* Platform Header */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 ${platform.bgColor} ${platform.textColor} rounded-lg flex items-center justify-center font-bold text-sm`}>
                  {platform.icon}
                </div>
                <div>
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              {/* Platform Card Mockup */}
              <div className={`border rounded-lg overflow-hidden bg-card shadow-sm`}>
                {/* Image */}
                <div className={`aspect-[${platform.aspectRatio}] bg-muted overflow-hidden`}>
                  {loading ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted animate-pulse">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={imageUrl!}
                      alt={`${platform.name} preview`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Platform-specific card content */}
                {platform.id === 'twitter' && (
                  <div className="p-3 bg-card border-t">
                    <p className="font-medium text-sm truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">sheep-thoughts-studio.lovable.app</p>
                  </div>
                )}

                {platform.id === 'facebook' && (
                  <div className="p-3 bg-muted/50 border-t">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">sheep-thoughts-studio.lovable.app</p>
                    <p className="font-semibold text-sm mt-1 truncate">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">Bubbles the Sheep • Confidently Wrong Since Birth</p>
                  </div>
                )}

                {platform.id === 'linkedin' && (
                  <div className="p-3 bg-card border-t">
                    <p className="font-semibold text-sm truncate">{title}</p>
                    <p className="text-xs text-muted-foreground mt-1">sheep-thoughts-studio.lovable.app</p>
                  </div>
                )}
              </div>

              {/* Platform Notes */}
              <div className="flex gap-1 flex-wrap">
                {platform.id === 'twitter' && (
                  <>
                    <Badge variant="secondary" className="text-xs">1.91:1 ratio</Badge>
                    <Badge variant="secondary" className="text-xs">Max 5MB</Badge>
                  </>
                )}
                {platform.id === 'facebook' && (
                  <>
                    <Badge variant="secondary" className="text-xs">1.91:1 ratio</Badge>
                    <Badge variant="secondary" className="text-xs">8MB limit</Badge>
                  </>
                )}
                {platform.id === 'linkedin' && (
                  <>
                    <Badge variant="secondary" className="text-xs">1.91:1 ratio</Badge>
                    <Badge variant="secondary" className="text-xs">5MB limit</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Reference */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>All platforms prefer 1200×630px images (1.91:1 ratio)</li>
                <li>Keep important content centered—edges may be cropped</li>
                <li>Use high contrast text for readability at small sizes</li>
                <li>Test with each platform's debugger tool after publishing</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
