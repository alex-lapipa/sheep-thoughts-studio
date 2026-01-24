import { useState } from 'react';
import { Ruler, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface SizeGuideModalProps {
  productType?: string;
  className?: string;
  variant?: 'link' | 'button';
}

// Size data for different product types
const sizeCharts = {
  tshirt: {
    label: 'T-Shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    measurements: {
      chest: ['86-91', '91-96', '96-101', '101-106', '106-111', '111-116'],
      length: ['66', '69', '72', '74', '76', '78'],
      shoulder: ['42', '44', '46', '48', '50', '52'],
    },
    fit: 'Regular fit with a classic silhouette. Designed for everyday comfort.',
  },
  hoodie: {
    label: 'Hoodies',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    measurements: {
      chest: ['94-99', '99-104', '104-109', '109-114', '114-119', '119-124'],
      length: ['64', '66', '68', '70', '72', '74'],
      sleeve: ['60', '62', '64', '66', '68', '70'],
    },
    fit: 'Relaxed fit with a cozy, oversized feel. Perfect for layering.',
  },
  cap: {
    label: 'Caps & Hats',
    sizes: ['One Size'],
    measurements: {
      circumference: ['54-60'],
    },
    fit: 'Adjustable strap for universal fit. Fits most head sizes.',
  },
};

const measurementLabels: Record<string, string> = {
  chest: 'Chest (cm)',
  length: 'Length (cm)',
  shoulder: 'Shoulder (cm)',
  sleeve: 'Sleeve (cm)',
  circumference: 'Head Circumference (cm)',
};

export function SizeGuideModal({ 
  productType = 'tshirt', 
  className,
  variant = 'link' 
}: SizeGuideModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(productType);

  const currentChart = sizeCharts[activeTab as keyof typeof sizeCharts] || sizeCharts.tshirt;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {variant === 'button' ? (
          <Button variant="outline" size="sm" className={cn('gap-2', className)}>
            <Ruler className="h-4 w-4" />
            Size Guide
          </Button>
        ) : (
          <button className={cn('text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline inline-flex items-center gap-1', className)}>
            <Ruler className="h-3.5 w-3.5" />
            Size Guide
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Ruler className="h-5 w-5 text-accent" />
            Size Guide
          </DialogTitle>
          <DialogDescription>
            Find your perfect fit with our measurement charts
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tshirt">T-Shirts</TabsTrigger>
            <TabsTrigger value="hoodie">Hoodies</TabsTrigger>
            <TabsTrigger value="cap">Caps</TabsTrigger>
          </TabsList>

          {Object.entries(sizeCharts).map(([key, chart]) => (
            <TabsContent key={key} value={key} className="mt-6 space-y-6">
              {/* Measurement Table */}
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Measurement</TableHead>
                      {chart.sizes.map((size) => (
                        <TableHead key={size} className="text-center font-semibold">
                          {size}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(chart.measurements).map(([measure, values]) => (
                      <TableRow key={measure}>
                        <TableCell className="font-medium">
                          {measurementLabels[measure] || measure}
                        </TableCell>
                        {values.map((value, i) => (
                          <TableCell key={i} className="text-center">
                            {value}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Fit Description */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent/10 border border-accent/20">
                <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Fit & Style</h4>
                  <p className="text-sm text-muted-foreground">{chart.fit}</p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* How to Measure Section */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-display font-semibold mb-4">How to Measure</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">1</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Chest</h4>
                <p className="text-xs text-muted-foreground">
                  Measure around the fullest part of your chest, keeping the tape horizontal.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">2</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Length</h4>
                <p className="text-xs text-muted-foreground">
                  Measure from the highest point of the shoulder to the hem.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">3</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Shoulder</h4>
                <p className="text-xs text-muted-foreground">
                  Measure from shoulder seam to shoulder seam across the back.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-accent">4</span>
              </div>
              <div>
                <h4 className="font-medium text-sm">Sleeve</h4>
                <p className="text-xs text-muted-foreground">
                  Measure from the shoulder seam to the end of the cuff.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Size Recommendations */}
        <div className="mt-6 p-4 rounded-lg bg-secondary/50">
          <h4 className="font-semibold text-sm mb-2">🐑 Bubbles' Sizing Wisdom</h4>
          <p className="text-sm text-muted-foreground">
            "I once heard that humans prefer clothes that fit. Personally, I think wool is always the right size. 
            But if you're between sizes, I'd recommend sizing up for a relaxed fit, or down for a snugger feel. 
            Though honestly, I'm probably wrong about this."
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
