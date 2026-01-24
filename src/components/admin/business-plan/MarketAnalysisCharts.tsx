import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users, MapPin, Package } from "lucide-react";

const tamSamSomData = [
  { market: 'TAM', value: 450, label: '€450M', description: 'Global novelty apparel market' },
  { market: 'SAM', value: 85, label: '€85M', description: 'EU/NA English-speaking segment' },
  { market: 'SOM', value: 2.5, label: '€2.5M', description: 'Realistic 3-year capture' },
];

const geographicData = [
  { id: 'Ireland', value: 35, color: 'hsl(142, 71%, 45%)' },
  { id: 'UK', value: 25, color: 'hsl(217, 91%, 60%)' },
  { id: 'Germany', value: 15, color: 'hsl(45, 93%, 47%)' },
  { id: 'France', value: 10, color: 'hsl(340, 82%, 52%)' },
  { id: 'USA', value: 10, color: 'hsl(280, 65%, 60%)' },
  { id: 'Other EU', value: 5, color: 'hsl(200, 70%, 50%)' },
];

const customerSegmentsData = [
  { id: 'Comedy Fans', value: 30, color: 'hsl(142, 71%, 45%)' },
  { id: 'Pet Lovers', value: 25, color: 'hsl(217, 91%, 60%)' },
  { id: 'Rural Lifestyle', value: 20, color: 'hsl(45, 93%, 47%)' },
  { id: 'Gift Buyers', value: 15, color: 'hsl(340, 82%, 52%)' },
  { id: 'Meme Culture', value: 10, color: 'hsl(280, 65%, 60%)' },
];

const productCategoryData = [
  { category: 'T-Shirts', units: 450, revenue: 13500 },
  { category: 'Hoodies', units: 180, revenue: 9900 },
  { category: 'Mugs', units: 320, revenue: 4800 },
  { category: 'Totes', units: 150, revenue: 3000 },
  { category: 'Accessories', units: 200, revenue: 2000 },
];

const nivoTheme = {
  axis: {
    ticks: {
      text: { fill: 'hsl(var(--muted-foreground))' },
    },
    legend: {
      text: { fill: 'hsl(var(--foreground))' },
    },
  },
  grid: {
    line: { stroke: 'hsl(var(--border))' },
  },
  legends: {
    text: { fill: 'hsl(var(--foreground))' },
  },
  tooltip: {
    container: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
    },
  },
};

export function MarketAnalysisCharts() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Globe className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>
              TAM/SAM/SOM sizing, geographic distribution, and customer segments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tam" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="tam" className="gap-2">
              <Globe className="h-4 w-4" />
              TAM/SAM/SOM
            </TabsTrigger>
            <TabsTrigger value="geo" className="gap-2">
              <MapPin className="h-4 w-4" />
              Geography
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-2">
              <Users className="h-4 w-4" />
              Segments
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
          </TabsList>
          
          {/* TAM/SAM/SOM */}
          <TabsContent value="tam">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <ResponsiveBar
                  data={tamSamSomData}
                  keys={['value']}
                  indexBy="market"
                  margin={{ top: 30, right: 30, bottom: 50, left: 60 }}
                  padding={0.4}
                  colors={['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)']}
                  colorBy="indexValue"
                  borderRadius={8}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 10,
                    legend: 'Market Tier',
                    legendPosition: 'middle',
                    legendOffset: 36,
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 5,
                    legend: 'Value (€M)',
                    legendPosition: 'middle',
                    legendOffset: -50,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  label={d => `€${d.value}M`}
                  labelTextColor="white"
                  theme={nivoTheme}
                />
              </div>
              <div className="space-y-4">
                {tamSamSomData.map((item, index) => (
                  <div key={item.market} className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{item.market}</span>
                      <span className="text-2xl font-bold text-accent">{item.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                  <p className="text-sm font-medium">Year 1 Target: <span className="text-accent font-bold">€50,000</span></p>
                  <p className="text-xs text-muted-foreground mt-1">2% of SOM represents realistic market capture</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Geographic Distribution */}
          <TabsContent value="geo">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <ResponsivePie
                  data={geographicData}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.5}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: 'data.color' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="hsl(var(--foreground))"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 70,
                      itemHeight: 18,
                      itemTextColor: 'hsl(var(--foreground))',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 14,
                      symbolShape: 'circle',
                    },
                  ]}
                  theme={nivoTheme}
                />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold mb-4">Target Markets by Priority</h3>
                {geographicData.map((region, index) => (
                  <div key={region.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: region.color }}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{region.id}</span>
                        <span className="text-sm text-muted-foreground">{region.value}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${region.value}%`, background: region.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Customer Segments */}
          <TabsContent value="segments">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[350px]">
                <ResponsivePie
                  data={customerSegmentsData}
                  margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                  innerRadius={0.6}
                  padAngle={0.7}
                  cornerRadius={3}
                  activeOuterRadiusOffset={8}
                  colors={{ datum: 'data.color' }}
                  borderWidth={1}
                  borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                  arcLinkLabelsSkipAngle={10}
                  arcLinkLabelsTextColor="hsl(var(--foreground))"
                  arcLinkLabelsThickness={2}
                  arcLinkLabelsColor={{ from: 'color' }}
                  arcLabelsSkipAngle={10}
                  arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      justify: false,
                      translateX: 0,
                      translateY: 56,
                      itemsSpacing: 0,
                      itemWidth: 90,
                      itemHeight: 18,
                      itemTextColor: 'hsl(var(--foreground))',
                      itemDirection: 'left-to-right',
                      itemOpacity: 1,
                      symbolSize: 14,
                      symbolShape: 'circle',
                    },
                  ]}
                  theme={nivoTheme}
                />
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold">Customer Personas</h3>
                <div className="grid gap-3">
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-green-500/10 to-transparent">
                    <p className="font-medium">🎭 Comedy Fans (30%)</p>
                    <p className="text-xs text-muted-foreground">Love absurdist humor, meme culture, share content actively</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-blue-500/10 to-transparent">
                    <p className="font-medium">🐾 Pet Lovers (25%)</p>
                    <p className="text-xs text-muted-foreground">Animal enthusiasts, emotional connection to characters</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-amber-500/10 to-transparent">
                    <p className="font-medium">🌾 Rural Lifestyle (20%)</p>
                    <p className="text-xs text-muted-foreground">Farm life nostalgia, countryside appreciation</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-pink-500/10 to-transparent">
                    <p className="font-medium">🎁 Gift Buyers (15%)</p>
                    <p className="text-xs text-muted-foreground">Seeking unique, memorable presents</p>
                  </div>
                  <div className="p-3 rounded-lg border bg-gradient-to-r from-purple-500/10 to-transparent">
                    <p className="font-medium">📱 Meme Culture (10%)</p>
                    <p className="text-xs text-muted-foreground">Internet culture enthusiasts, trend followers</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Product Performance */}
          <TabsContent value="products">
            <div className="h-[400px]">
              <ResponsiveBar
                data={productCategoryData}
                keys={['units', 'revenue']}
                indexBy="category"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                groupMode="grouped"
                colors={['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)']}
                borderRadius={4}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 10,
                  legend: 'Product Category',
                  legendPosition: 'middle',
                  legendOffset: 36,
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 5,
                  legend: 'Value',
                  legendPosition: 'middle',
                  legendOffset: -50,
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 120,
                    translateY: 0,
                    itemsSpacing: 2,
                    itemWidth: 100,
                    itemHeight: 20,
                    itemDirection: 'left-to-right',
                    itemOpacity: 0.85,
                    symbolSize: 20,
                    itemTextColor: 'hsl(var(--foreground))',
                  },
                ]}
                theme={nivoTheme}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
