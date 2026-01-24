import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch, Workflow, Target, Users } from "lucide-react";

// Custom node styles
const nodeStyles = {
  primary: {
    background: 'linear-gradient(135deg, hsl(142, 71%, 45%) 0%, hsl(142, 71%, 35%) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '16px 24px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  secondary: {
    background: 'linear-gradient(135deg, hsl(217, 91%, 60%) 0%, hsl(217, 91%, 50%) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 20px',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
  accent: {
    background: 'linear-gradient(135deg, hsl(45, 93%, 47%) 0%, hsl(45, 93%, 40%) 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 20px',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  },
  neutral: {
    background: 'hsl(var(--muted))',
    color: 'hsl(var(--foreground))',
    border: '2px solid hsl(var(--border))',
    borderRadius: '10px',
    padding: '12px 18px',
    fontWeight: 500,
  },
};

// Business Model Flow
const businessModelNodes: Node[] = [
  {
    id: 'brand',
    position: { x: 400, y: 0 },
    data: { label: '🐑 Bubbles Brand' },
    style: nodeStyles.primary,
    sourcePosition: Position.Bottom,
  },
  {
    id: 'content',
    position: { x: 150, y: 100 },
    data: { label: '📝 Content Creation' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'product',
    position: { x: 400, y: 100 },
    data: { label: '👕 Product Design' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'community',
    position: { x: 650, y: 100 },
    data: { label: '🌍 Community' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'social',
    position: { x: 50, y: 220 },
    data: { label: 'Social Media' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'website',
    position: { x: 200, y: 220 },
    data: { label: 'Website/Blog' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'pod',
    position: { x: 350, y: 220 },
    data: { label: 'POD Fulfillment' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'shopify',
    position: { x: 500, y: 220 },
    data: { label: 'Shopify Store' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'events',
    position: { x: 650, y: 220 },
    data: { label: 'Events/Collabs' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'ambassador',
    position: { x: 800, y: 220 },
    data: { label: 'Ambassadors' },
    style: nodeStyles.neutral,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
  {
    id: 'revenue',
    position: { x: 400, y: 340 },
    data: { label: '💰 Revenue Streams' },
    style: nodeStyles.accent,
    targetPosition: Position.Top,
  },
];

const businessModelEdges: Edge[] = [
  { id: 'e1', source: 'brand', target: 'content', animated: true, style: { stroke: 'hsl(217, 91%, 60%)' } },
  { id: 'e2', source: 'brand', target: 'product', animated: true, style: { stroke: 'hsl(142, 71%, 45%)' } },
  { id: 'e3', source: 'brand', target: 'community', animated: true, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e4', source: 'content', target: 'social', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e5', source: 'content', target: 'website', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e6', source: 'product', target: 'pod', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e7', source: 'product', target: 'shopify', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e8', source: 'community', target: 'events', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e9', source: 'community', target: 'ambassador', style: { stroke: 'hsl(var(--border))' } },
  { id: 'e10', source: 'social', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e11', source: 'website', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e12', source: 'pod', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e13', source: 'shopify', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e14', source: 'events', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
  { id: 'e15', source: 'ambassador', target: 'revenue', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: 'hsl(45, 93%, 47%)' } },
];

// Customer Journey Flow
const customerJourneyNodes: Node[] = [
  {
    id: 'awareness',
    position: { x: 0, y: 150 },
    data: { label: '👀 Awareness' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Right,
  },
  {
    id: 'discovery',
    position: { x: 200, y: 150 },
    data: { label: '🔍 Discovery' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'consideration',
    position: { x: 400, y: 150 },
    data: { label: '🤔 Consideration' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'purchase',
    position: { x: 600, y: 150 },
    data: { label: '🛒 Purchase' },
    style: nodeStyles.accent,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'loyalty',
    position: { x: 800, y: 150 },
    data: { label: '❤️ Loyalty' },
    style: nodeStyles.primary,
    targetPosition: Position.Left,
  },
  // Touchpoints
  {
    id: 'social_touch',
    position: { x: 0, y: 50 },
    data: { label: 'Social Media' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  {
    id: 'influencer',
    position: { x: 100, y: 50 },
    data: { label: 'Influencers' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  {
    id: 'website_touch',
    position: { x: 200, y: 50 },
    data: { label: 'Website' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  {
    id: 'reviews',
    position: { x: 400, y: 50 },
    data: { label: 'Reviews' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  {
    id: 'email_touch',
    position: { x: 600, y: 50 },
    data: { label: 'Email' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  {
    id: 'community_touch',
    position: { x: 800, y: 50 },
    data: { label: 'Community' },
    style: { ...nodeStyles.neutral, fontSize: '12px', padding: '8px 12px' },
    targetPosition: Position.Bottom,
  },
  // Metrics row
  {
    id: 'reach',
    position: { x: 0, y: 250 },
    data: { label: '10K+ reach' },
    style: { ...nodeStyles.neutral, fontSize: '11px', padding: '6px 10px', background: 'hsl(217, 91%, 95%)' },
  },
  {
    id: 'visits',
    position: { x: 200, y: 250 },
    data: { label: '2.5K visits' },
    style: { ...nodeStyles.neutral, fontSize: '11px', padding: '6px 10px', background: 'hsl(217, 91%, 95%)' },
  },
  {
    id: 'cart_add',
    position: { x: 400, y: 250 },
    data: { label: '30% cart rate' },
    style: { ...nodeStyles.neutral, fontSize: '11px', padding: '6px 10px', background: 'hsl(45, 93%, 95%)' },
  },
  {
    id: 'conversion',
    position: { x: 600, y: 250 },
    data: { label: '5.4% CVR' },
    style: { ...nodeStyles.neutral, fontSize: '11px', padding: '6px 10px', background: 'hsl(142, 71%, 95%)' },
  },
  {
    id: 'ltv',
    position: { x: 800, y: 250 },
    data: { label: '€85 LTV' },
    style: { ...nodeStyles.neutral, fontSize: '11px', padding: '6px 10px', background: 'hsl(142, 71%, 95%)' },
  },
];

const customerJourneyEdges: Edge[] = [
  { id: 'cj1', source: 'awareness', target: 'discovery', animated: true, style: { stroke: 'hsl(217, 91%, 60%)', strokeWidth: 3 } },
  { id: 'cj2', source: 'discovery', target: 'consideration', animated: true, style: { stroke: 'hsl(217, 91%, 60%)', strokeWidth: 3 } },
  { id: 'cj3', source: 'consideration', target: 'purchase', animated: true, style: { stroke: 'hsl(45, 93%, 47%)', strokeWidth: 3 } },
  { id: 'cj4', source: 'purchase', target: 'loyalty', animated: true, style: { stroke: 'hsl(142, 71%, 45%)', strokeWidth: 3 } },
  // Touchpoint connections
  { id: 'cj5', source: 'social_touch', target: 'awareness', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
  { id: 'cj6', source: 'influencer', target: 'awareness', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
  { id: 'cj7', source: 'website_touch', target: 'discovery', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
  { id: 'cj8', source: 'reviews', target: 'consideration', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
  { id: 'cj9', source: 'email_touch', target: 'purchase', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
  { id: 'cj10', source: 'community_touch', target: 'loyalty', style: { stroke: 'hsl(var(--border))', strokeDasharray: '5,5' } },
];

// Growth Strategy Flow
const growthNodes: Node[] = [
  {
    id: 'q1',
    position: { x: 0, y: 100 },
    data: { label: 'Q1: Foundation' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Right,
  },
  {
    id: 'q2',
    position: { x: 250, y: 100 },
    data: { label: 'Q2: Growth' },
    style: nodeStyles.secondary,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'q3',
    position: { x: 500, y: 100 },
    data: { label: 'Q3: Scale' },
    style: nodeStyles.accent,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'q4',
    position: { x: 750, y: 100 },
    data: { label: 'Q4: Peak' },
    style: nodeStyles.primary,
    targetPosition: Position.Left,
  },
  // Q1 activities
  {
    id: 'q1_brand',
    position: { x: -50, y: 200 },
    data: { label: 'Brand Launch' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  {
    id: 'q1_products',
    position: { x: 50, y: 200 },
    data: { label: '10 SKUs' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  // Q2 activities
  {
    id: 'q2_content',
    position: { x: 200, y: 200 },
    data: { label: 'Content Engine' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  {
    id: 'q2_social',
    position: { x: 300, y: 200 },
    data: { label: '5K Followers' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  // Q3 activities
  {
    id: 'q3_collab',
    position: { x: 450, y: 200 },
    data: { label: 'Collabs' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  {
    id: 'q3_expand',
    position: { x: 550, y: 200 },
    data: { label: 'EU Expansion' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  // Q4 activities
  {
    id: 'q4_holiday',
    position: { x: 700, y: 200 },
    data: { label: 'Holiday Push' },
    style: { ...nodeStyles.neutral, fontSize: '11px' },
  },
  {
    id: 'q4_target',
    position: { x: 800, y: 200 },
    data: { label: '€50K Revenue' },
    style: { ...nodeStyles.neutral, fontSize: '11px', background: 'hsl(142, 71%, 90%)' },
  },
];

const growthEdges: Edge[] = [
  { id: 'g1', source: 'q1', target: 'q2', animated: true, style: { stroke: 'hsl(217, 91%, 60%)', strokeWidth: 3 } },
  { id: 'g2', source: 'q2', target: 'q3', animated: true, style: { stroke: 'hsl(45, 93%, 47%)', strokeWidth: 3 } },
  { id: 'g3', source: 'q3', target: 'q4', animated: true, style: { stroke: 'hsl(142, 71%, 45%)', strokeWidth: 3 } },
];

function FlowDiagram({ nodes, edges }: { nodes: Node[], edges: Edge[] }) {
  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes);
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges);
  
  return (
    <div className="h-[400px] w-full bg-muted/30 rounded-lg border">
      <ReactFlow
        nodes={nodesState}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--border))" gap={20} />
        <Controls className="bg-background border rounded-lg" />
        <MiniMap 
          nodeColor={() => 'hsl(var(--accent))'}
          maskColor="rgba(0,0,0,0.1)"
          className="bg-background border rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}

export function BusinessFlowDiagram() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Workflow className="h-6 w-6 text-accent" />
          <div>
            <CardTitle>Business Flow Diagrams</CardTitle>
            <CardDescription>
              Interactive React Flow visualizations of business model, customer journey, and growth strategy
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="business-model" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="business-model" className="gap-2">
              <GitBranch className="h-4 w-4" />
              Business Model
            </TabsTrigger>
            <TabsTrigger value="customer-journey" className="gap-2">
              <Users className="h-4 w-4" />
              Customer Journey
            </TabsTrigger>
            <TabsTrigger value="growth" className="gap-2">
              <Target className="h-4 w-4" />
              Growth Roadmap
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="business-model">
            <FlowDiagram nodes={businessModelNodes} edges={businessModelEdges} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Drag nodes to explore • Use controls to zoom/pan • Mini-map shows overview
            </p>
          </TabsContent>
          
          <TabsContent value="customer-journey">
            <FlowDiagram nodes={customerJourneyNodes} edges={customerJourneyEdges} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Customer journey from awareness to loyalty with touchpoints and conversion metrics
            </p>
          </TabsContent>
          
          <TabsContent value="growth">
            <FlowDiagram nodes={growthNodes} edges={growthEdges} />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Quarterly growth milestones and strategic initiatives for Year 1
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
