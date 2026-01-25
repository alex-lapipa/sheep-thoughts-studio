import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Ruler, Shirt, Tag, Palette, Scale, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductSpecsProps {
  vendor?: string;
  productType?: string;
  tags?: string[];
  sku?: string;
  weight?: number;
  weightUnit?: string;
  options?: Array<{ name: string; values: string[] }>;
  className?: string;
}

// Extract fabric/material info from tags or description
function extractFabricInfo(tags: string[]): string | null {
  const fabricTags = tags.filter(tag => 
    tag.toLowerCase().includes('cotton') ||
    tag.toLowerCase().includes('polyester') ||
    tag.toLowerCase().includes('organic') ||
    tag.toLowerCase().includes('blend') ||
    tag.toLowerCase().includes('fleece') ||
    tag.toLowerCase().includes('jersey')
  );
  return fabricTags.length > 0 ? fabricTags.join(', ') : null;
}

// Extract quality indicators from tags
function extractQualityInfo(tags: string[]): string[] {
  const qualityKeywords = ['premium', 'organic', 'eco', 'sustainable', 'heavyweight', 'ringspun', 'combed'];
  return tags.filter(tag => 
    qualityKeywords.some(kw => tag.toLowerCase().includes(kw))
  );
}

export function ProductSpecs({
  vendor,
  productType,
  tags = [],
  sku,
  weight,
  weightUnit,
  options = [],
  className
}: ProductSpecsProps) {
  const fabricInfo = extractFabricInfo(tags);
  const qualityBadges = extractQualityInfo(tags);
  
  // Extract available colors from options
  const colorOption = options.find(opt => 
    opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour'
  );
  
  // Extract available sizes from options
  const sizeOption = options.find(opt => 
    opt.name.toLowerCase() === 'size'
  );

  const specs = [
    { icon: Shirt, label: "Type", value: productType },
    { icon: Tag, label: "Brand", value: vendor },
    { icon: Package, label: "SKU", value: sku },
    { icon: Scale, label: "Weight", value: weight ? `${weight} ${weightUnit || 'g'}` : null },
  ].filter(spec => spec.value);

  if (specs.length === 0 && !fabricInfo && qualityBadges.length === 0 && !colorOption && !sizeOption) {
    return null;
  }

  return (
    <div className={cn("rounded-xl bg-secondary/30 border border-border p-4 space-y-4", className)}>
      <h4 className="font-display font-semibold text-sm flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent" />
        Product Details
      </h4>
      
      {/* Basic Specs Grid */}
      {specs.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-start gap-2">
              <div className="p-1.5 rounded-md bg-accent/10 flex-shrink-0">
                <spec.icon className="h-3.5 w-3.5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{spec.label}</p>
                <p className="text-sm font-medium leading-tight">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fabric/Material */}
      {fabricInfo && (
        <>
          <Separator className="bg-border/50" />
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-md bg-accent/10 flex-shrink-0">
              <Shirt className="h-3.5 w-3.5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Material</p>
              <p className="text-sm font-medium capitalize">{fabricInfo}</p>
            </div>
          </div>
        </>
      )}

      {/* Available Colors */}
      {colorOption && colorOption.values.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs text-muted-foreground">Available Colors</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {colorOption.values.map((color) => (
                <Badge key={color} variant="outline" className="text-xs">
                  {color}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Available Sizes */}
      {sizeOption && sizeOption.values.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-3.5 w-3.5 text-accent" />
              <p className="text-xs text-muted-foreground">Available Sizes</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sizeOption.values.map((size) => (
                <Badge key={size} variant="outline" className="text-xs px-2">
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quality Badges */}
      {qualityBadges.length > 0 && (
        <>
          <Separator className="bg-border/50" />
          <div className="flex flex-wrap gap-1.5">
            {qualityBadges.map((badge) => (
              <Badge 
                key={badge} 
                variant="secondary" 
                className="text-xs bg-accent/10 text-accent capitalize"
              >
                {badge}
              </Badge>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
