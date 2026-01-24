import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveSankey } from "@nivo/sankey";
import { BarChart3, TrendingUp, PieChart, GitBranch } from "lucide-react";

// Revenue data by scenario
const generateRevenueData = () => {
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  
  return months.map((month, i) => {
    const baseGrowth = Math.pow(1.1, i);
    const seasonal = [1.0, 1.1, 1.2, 1.0, 0.9, 0.85, 1.0, 1.3, 1.8, 2.2, 1.1, 0.9][i];
    
    return {
      month,
      conservative: Math.round(800 * baseGrowth * seasonal),
      moderate: Math.round(1200 * baseGrowth * seasonal),
      aggressive: Math.round(2000 * baseGrowth * seasonal),
    };
  });
};

const generateLineData = () => {
  const revenueData = generateRevenueData();
  
  return [
    {
      id: 'Conservative',
      color: 'hsl(45, 93%, 47%)',
      data: revenueData.map(d => ({ x: d.month, y: d.conservative })),
    },
    {
      id: 'Moderate',
      color: 'hsl(217, 91%, 60%)',
      data: revenueData.map(d => ({ x: d.month, y: d.moderate })),
    },
    {
      id: 'Aggressive',
      color: 'hsl(142, 71%, 45%)',
      data: revenueData.map(d => ({ x: d.month, y: d.aggressive })),
    },
  ];
};

const revenueBreakdownData = [
  { id: 'T-Shirts', value: 45, color: 'hsl(142, 71%, 45%)' },
  { id: 'Hoodies', value: 25, color: 'hsl(217, 91%, 60%)' },
  { id: 'Mugs', value: 15, color: 'hsl(45, 93%, 47%)' },
  { id: 'Totes', value: 10, color: 'hsl(340, 82%, 52%)' },
  { id: 'Accessories', value: 5, color: 'hsl(280, 65%, 60%)' },
];

const sankeyData = {
  nodes: [
    { id: 'Social Media', color: 'hsl(217, 91%, 60%)' },
    { id: 'Organic Search', color: 'hsl(142, 71%, 45%)' },
    { id: 'Direct', color: 'hsl(45, 93%, 47%)' },
    { id: 'Referral', color: 'hsl(340, 82%, 52%)' },
    { id: 'Website Visitors', color: 'hsl(200, 70%, 50%)' },
    { id: 'Product Views', color: 'hsl(260, 60%, 55%)' },
    { id: 'Add to Cart', color: 'hsl(30, 80%, 50%)' },
    { id: 'Checkout', color: 'hsl(180, 60%, 45%)' },
    { id: 'Purchase', color: 'hsl(120, 70%, 40%)' },
  ],
  links: [
    { source: 'Social Media', target: 'Website Visitors', value: 4500 },
    { source: 'Organic Search', target: 'Website Visitors', value: 3200 },
    { source: 'Direct', target: 'Website Visitors', value: 1800 },
    { source: 'Referral', target: 'Website Visitors', value: 1000 },
    { source: 'Website Visitors', target: 'Product Views', value: 6800 },
    { source: 'Product Views', target: 'Add to Cart', value: 2040 },
    { source: 'Add to Cart', target: 'Checkout', value: 816 },
    { source: 'Checkout', target: 'Purchase', value: 571 },
  ],
};

const marketShareData = () => {
  const data = generateRevenueData();
  return data.map(d => ({
    month: d.month,
    'Year 1': d.moderate,
    'Year 2': Math.round(d.moderate * 2.5),
  }));
};

export function NivoCharts() {
  const revenueData = useMemo(() => generateRevenueData(), []);
  const lineData = useMemo(() => generateLineData(), []);
  const yearComparisonData = useMemo(() => marketShareData(), []);
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>Financial Analytics</CardTitle>
            <CardDescription>
              Interactive visualizations of revenue projections, funnel metrics, and market analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue Trends
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Y1 vs Y2
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="gap-2">
              <PieChart className="h-4 w-4" />
              Product Mix
            </TabsTrigger>
            <TabsTrigger value="funnel" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Sales Funnel
            </TabsTrigger>
          </TabsList>
          
          {/* Revenue Line Chart */}
          <TabsContent value="revenue">
            <div className="h-[400px]">
              <ResponsiveLine
                data={lineData}
                margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
                yFormat=" >-€,.0f"
                curve="monotoneX"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendOffset: 36,
                  legendPosition: 'middle',
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Revenue (€)',
                  legendOffset: -50,
                  legendPosition: 'middle',
                  format: v => `€${v >= 1000 ? `${v/1000}k` : v}`,
                }}
                enableGridX={false}
                colors={['hsl(45, 93%, 47%)', 'hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)']}
                lineWidth={3}
                pointSize={8}
                pointColor={{ theme: 'background' }}
                pointBorderWidth={2}
                pointBorderColor={{ from: 'serieColor' }}
                pointLabelYOffset={-12}
                enableArea={true}
                areaOpacity={0.1}
                useMesh={true}
                legends={[
                  {
                    anchor: 'bottom-right',
                    direction: 'column',
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: 'left-to-right',
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: 'circle',
                    symbolBorderColor: 'rgba(0, 0, 0, .5)',
                  },
                ]}
                theme={{
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
                }}
              />
            </div>
          </TabsContent>
          
          {/* Year Comparison Bar Chart */}
          <TabsContent value="comparison">
            <div className="h-[400px]">
              <ResponsiveBar
                data={yearComparisonData}
                keys={['Year 1', 'Year 2']}
                indexBy="month"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                groupMode="grouped"
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)']}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Month',
                  legendPosition: 'middle',
                  legendOffset: 32,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Revenue (€)',
                  legendPosition: 'middle',
                  legendOffset: -50,
                  format: v => `€${v >= 1000 ? `${v/1000}k` : v}`,
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
                  },
                ]}
                theme={{
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
                }}
              />
            </div>
          </TabsContent>
          
          {/* Product Mix Pie Chart */}
          <TabsContent value="breakdown">
            <div className="h-[400px]">
              <ResponsivePie
                data={revenueBreakdownData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="hsl(var(--foreground))"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                colors={['hsl(142, 71%, 45%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)', 'hsl(340, 82%, 52%)', 'hsl(280, 65%, 60%)']}
                legends={[
                  {
                    anchor: 'bottom',
                    direction: 'row',
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: 'hsl(var(--foreground))',
                    itemDirection: 'left-to-right',
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: 'circle',
                  },
                ]}
                theme={{
                  tooltip: {
                    container: {
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    },
                  },
                }}
              />
            </div>
          </TabsContent>
          
          {/* Sales Funnel Sankey */}
          <TabsContent value="funnel">
            <div className="h-[450px]">
              <ResponsiveSankey
                data={sankeyData}
                margin={{ top: 40, right: 160, bottom: 40, left: 50 }}
                align="justify"
                colors={{ scheme: 'category10' }}
                nodeOpacity={1}
                nodeHoverOthersOpacity={0.35}
                nodeThickness={18}
                nodeSpacing={24}
                nodeBorderWidth={0}
                nodeBorderRadius={3}
                linkOpacity={0.5}
                linkHoverOthersOpacity={0.1}
                linkContract={3}
                enableLinkGradient={true}
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={16}
                labelTextColor="hsl(var(--foreground))"
                theme={{
                  tooltip: {
                    container: {
                      background: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-accent">10,500</p>
                <p className="text-xs text-muted-foreground">Total Visitors</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">64.8%</p>
                <p className="text-xs text-muted-foreground">View Rate</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">30%</p>
                <p className="text-xs text-muted-foreground">Add to Cart Rate</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-600">5.4%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
