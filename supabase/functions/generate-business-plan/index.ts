import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BusinessPlanSection {
  id: string;
  title: string;
  content: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { section } = await req.json();

    const sectionPrompts: Record<string, string> = {
      executive_summary: `You are a CFO with McKinsey consulting experience writing a business plan for "Bubbles the Sheep" - an AI-powered character brand selling merchandise. The brand's unique value proposition: a sheep character who is "confidently wrong" about everything, powered by RAG AI technology.

Write an EXECUTIVE SUMMARY section for a 12-month business plan starting March 1, 2025. Include:
- Business concept and unique value proposition
- Target markets: Europe and North America
- Key revenue model: D2C merchandise via Shopify with print-on-demand fulfillment
- Conservative 12-month revenue projection
- Critical success factors

Use professional financial language. Be conservative with projections. Focus on the character IP and AI differentiation. Output in markdown format with clear sections.`,

      swot_analysis: `You are a McKinsey strategy consultant analyzing "Bubbles the Sheep" - an AI-powered character brand. 

Write a comprehensive SWOT ANALYSIS for the business:

STRENGTHS:
- Unique AI-native character with "confidently wrong" personality
- RAG-powered consistent character voice
- Low CAPEX POD model
- Irish/Wicklow authentic brand story
- Multilingual capability (EN, DE, FR, ES)

WEAKNESSES:
- New brand with no recognition
- Zero existing revenue
- Small team
- Dependence on POD margins

OPPORTUNITIES:
- AI entertainment market growth
- Character licensing potential
- Viral social media mechanics
- Irish diaspora market

THREATS:
- AI content saturation
- POD competition
- Platform dependency
- Exchange rate exposure

Provide deep strategic analysis in each quadrant. Output in professional markdown with bullet points.`,

      market_analysis: `You are a market research analyst with McKinsey experience. Analyze the market opportunity for "Bubbles the Sheep" - an AI-powered character merchandise brand.

Write a MARKET ANALYSIS section covering:

1. TAM/SAM/SOM Analysis:
- Character merchandise global market
- AI entertainment/character market
- D2C apparel market EU + NA

2. Target Customer Segments:
- Gen Z (16-28): Meme culture, statement merch
- Irish diaspora/enthusiasts: Authenticity seekers
- AI-curious adults (25-45): Novelty seekers

3. Market Trends:
- AI adoption in entertainment
- Character IP valuations
- D2C e-commerce growth
- POD market maturation

4. Geographic Focus:
- Primary: Ireland, UK, Germany
- Secondary: US, Canada, France, Spain

Use real market data estimates. Be conservative. Professional markdown format.`,

      competitor_analysis: `You are a competitive intelligence analyst. Analyze the competitive landscape for "Bubbles the Sheep" - an AI character merchandise brand.

Write a COMPETITOR ANALYSIS covering:

1. Direct Competitors:
- Character.AI (AI characters, no merch)
- Exploding Kittens (Character merch, no AI)
- Jellycat (Character plush, premium positioning)

2. Indirect Competitors:
- Generic POD stores
- Irish gift shops
- AI chatbot services

3. Competitive Positioning:
- Position Bubbles as the ONLY AI-native character that succeeds by being wrong
- Blue ocean: No competitor owns "charmingly incorrect"

4. Sustainable Competitive Advantages:
- RAG knowledge base (500+ wrong takes)
- Voice synthesis with Irish accent
- Viral escalation mechanics
- Authentic Wicklow origin story

Create a competitive matrix. Professional markdown format with tables.`,

      marketing_peso: `You are a digital marketing strategist using the PESO framework (Paid, Earned, Shared, Owned). 

Create a 12-MONTH MARKETING STRATEGY for "Bubbles the Sheep" with ZERO marketing budget - focus only on organic growth.

OWNED MEDIA:
- Website SEO optimization strategy
- Blog content calendar
- Email newsletter growth
- Product page optimization

EARNED MEDIA:
- PR story angles (AI sheep, Wicklow origin)
- Journalist outreach targets
- Podcast guest opportunities
- Award submissions

SHARED MEDIA:
- TikTok/Reels content strategy
- User-generated content campaigns
- Shareable badge mechanics
- Viral challenge design

PAID MEDIA:
- Note: Zero budget for Y1
- Future retargeting strategy prep

Include monthly tactical calendar. Focus on SEO and organic social. Professional markdown.`,

      seo_strategy: `You are an SEO specialist. Create an SEO STRATEGY for bubblesheep.xyz over 12 months with zero paid budget.

Cover:

1. Keyword Strategy:
- Primary keywords (AI character, Irish sheep, funny merchandise)
- Long-tail opportunities
- Seasonal keywords

2. Technical SEO:
- Site structure optimization
- Core Web Vitals targets
- Schema markup (Product, FAQ, Organization)
- Multilingual hreflang implementation

3. Content Strategy:
- Blog post calendar (2 posts/month)
- "Bubbles Explains" series
- FAQ expansion
- User-generated content integration

4. Link Building (Zero Budget):
- Irish tourism/culture sites
- AI/tech blogs
- Humor/entertainment sites
- Guest posting opportunities

5. Monthly Targets:
- Organic traffic growth projections
- Keyword ranking goals
- Domain authority targets

Be realistic with timeline. Professional markdown with tables.`,

      sales_funnel: `You are an e-commerce conversion specialist. Design a SALES FUNNEL STRATEGY for Bubbles the Sheep merchandise.

Cover:

1. Awareness Stage:
- AI voice chat engagement
- Social media discovery
- SEO content entry points
- Share badges as viral loops

2. Interest Stage:
- Thought carousel engagement
- "Bubbles Explains" interactions
- Email capture with value exchange
- Challenge mode participation

3. Consideration Stage:
- Product browsing behavior
- Collection filtering (by "mode")
- Quick view interactions
- Cart abandonment flows

4. Conversion Stage:
- Checkout optimization
- Urgency elements (drop timers)
- Trust signals
- Payment options (EU/NA)

5. Retention/Advocacy:
- Post-purchase email sequence
- Hall of Fame submissions
- Review generation
- Referral mechanics

Include conversion rate benchmarks. Professional markdown.`,

      product_strategy: `You are a product merchandising strategist. Create a PRODUCT LAUNCH STRATEGY for Bubbles the Sheep with 10 initial SKUs.

Recommend the 10 BEST INITIAL PRODUCTS based on:
- POD margin optimization (45%+ target)
- Market volume potential
- Production complexity
- Shipping cost efficiency

RECOMMENDED INITIAL 10:
1. "Confidently Wrong" T-Shirt (unisex, 3 colors)
2. "Everything Wrong" Hoodie (premium margin)
3. Classic Bubbles Mug (11oz, high margin)
4. Wicklow Wisdom Tote (eco-positioning)
5. Enamel Pin (low AOV gateway)
6. "Wrong Take" Series Mugs (collection builder)
7. Grass Salad Cap (unique positioning)
8. Quote T-Shirt (viral potential)
9. Gift Bundle (AOV lift)
10. Seasonal Drop Item (urgency)

For each product include:
- Estimated COGS
- Target price point (EUR)
- Gross margin %
- Market positioning

Professional markdown with pricing tables.`,

      revenue_projections: `You are a CFO creating REVENUE PROJECTIONS for Bubbles the Sheep, Year 1 starting March 2025.

Create a 12-MONTH REVENUE MODEL with:

Assumptions:
- Zero revenue Month 1 (setup)
- Conservative organic traffic growth
- 1.5% conversion rate (industry benchmark for new brands)
- €35 average order value
- 45% gross margin
- Zero paid marketing spend

Monthly Projections:
- Traffic (organic only)
- Conversion rate
- Orders
- Revenue
- Gross profit

Include:
- Month-by-month breakdown
- Quarterly summaries
- Year-end total
- Key assumptions clearly stated

Be CONSERVATIVE. This is for investor credibility. Professional markdown with tables.`,

      monthly_action_plan: `You are a COO creating a MONTHLY ACTION PLAN for Bubbles the Sheep, March 2025 - February 2026.

For each month, specify:
- Key Focus Area
- Specific Actions (3-5 per month)
- Target Metrics
- Dependencies

Structure by quarters:

Q1 (Mar-May): Foundation
- Product launch
- SEO baseline
- Content creation

Q2 (Jun-Aug): Growth
- Social expansion
- PR outreach
- Regional testing

Q3 (Sep-Nov): Optimization
- Conversion improvements
- Holiday prep
- Inventory planning

Q4 (Dec-Feb): Scale
- Holiday push
- Q1 planning
- Licensing exploration

Include clear milestones and success metrics. Professional markdown.`,

      risk_analysis: `You are a risk management consultant. Create a RISK ANALYSIS for Bubbles the Sheep.

Identify and analyze:

1. Market Risks:
- Demand uncertainty
- Competitive response
- Market saturation

2. Operational Risks:
- POD supplier reliability
- Quality control
- Shipping delays

3. Financial Risks:
- Cash flow timing
- FX exposure (EUR/USD/GBP)
- Margin pressure

4. Technology Risks:
- AI service dependency
- Platform changes
- Data security

5. Brand Risks:
- Character misinterpretation
- Cultural sensitivity
- IP protection

For each risk include:
- Probability (H/M/L)
- Impact (H/M/L)
- Mitigation strategy
- Contingency plan

Professional risk matrix format in markdown.`,

      kpi_dashboard: `You are a business analyst. Design a KPI DASHBOARD for Bubbles the Sheep Year 1.

Define key metrics across:

1. Traffic & Engagement:
- Monthly unique visitors
- Session duration
- Pages per session
- Bounce rate
- Voice chat interactions

2. Conversion:
- Add-to-cart rate
- Checkout completion rate
- Overall conversion rate
- Cart abandonment rate

3. Revenue:
- Monthly revenue
- Average order value
- Revenue per visitor
- Gross margin %

4. Marketing:
- Organic traffic growth
- Email list size
- Social followers
- Share rate

5. Customer:
- New vs returning
- Geographic distribution
- Customer satisfaction

Include:
- Target values for Month 6 and Month 12
- Data sources
- Reporting frequency

Professional markdown with clear targets.`,

      financial_summary: `You are a CFO creating a FINANCIAL SUMMARY for Bubbles the Sheep business plan.

Summarize the 12-month financial outlook:

1. Revenue Summary:
- Year 1 total revenue target
- Monthly growth rate
- Revenue mix by product category

2. Margin Analysis:
- Gross margin target: 45%
- Key margin drivers
- Margin improvement opportunities

3. Investment Requirements:
- Zero external costs assumed
- Platform costs (Shopify, POD)
- Inventory: None (POD model)

4. Break-even Analysis:
- Fixed costs breakdown
- Unit economics
- Break-even volume

5. Funding Status:
- Bootstrapped approach
- Future funding considerations
- Use of funds if raised

6. Financial Risks & Mitigations:
- Key financial risks
- Contingency reserves
- Scenario planning

Conservative, investor-ready language. Professional markdown.`
    };

    const systemPrompt = sectionPrompts[section];
    if (!systemPrompt) {
      throw new Error(`Unknown section: ${section}`);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a senior business consultant with CFO experience at McKinsey. You write professional, conservative, investor-ready business plans. Use clear structure, bullet points, and tables where appropriate. All output should be in markdown format." },
          { role: "user", content: systemPrompt }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No content generated";

    return new Response(
      JSON.stringify({ content, section }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Business plan generation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
