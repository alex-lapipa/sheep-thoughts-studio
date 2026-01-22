import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Spam detection keywords for questions
const SPAM_KEYWORDS = [
  'bitcoin', 'crypto', 'investment', 'casino', 'lottery', 'viagra', 'cialis',
  'seo services', 'backlinks', 'click here', 'congratulations', 'nigerian prince',
  'work from home', 'earn $', 'free money', 'weight loss', 'pharmacy',
];

function checkQuestionForSpam(question: string): { isSpam: boolean; spamScore: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  const lowerQuestion = question.toLowerCase();

  const keywordMatches: string[] = [];
  for (const keyword of SPAM_KEYWORDS) {
    if (lowerQuestion.includes(keyword)) {
      keywordMatches.push(keyword);
      score += 15;
    }
  }
  if (keywordMatches.length > 0) {
    reasons.push(`Spam keywords: ${keywordMatches.slice(0, 3).join(', ')}`);
    score = Math.min(score, 45);
  }

  if (/https?:\/\//i.test(question)) {
    reasons.push('Contains URL');
    score += 25;
  }

  const capsRatio = (question.match(/[A-Z]/g)?.length || 0) / question.length;
  if (capsRatio > 0.5 && question.length > 20) {
    reasons.push('Excessive caps');
    score += 15;
  }

  if (question.length < 5) {
    reasons.push('Too short');
    score += 30;
  }

  return { isSpam: score >= 50, spamScore: Math.min(score, 100), reasons };
}

// Generate embedding for semantic search
async function getEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [text],
        model: "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      console.error("Embedding error:", response.status);
      return null;
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
}

// Fetch relevant RAG content using semantic search
async function fetchRelevantRAGContent(
  question: string, 
  supabase: any, 
  apiKey: string
): Promise<{ wrongTakes: string[]; comedyHooks: string[]; signatureLines: string[] }> {
  const result = { wrongTakes: [], comedyHooks: [], signatureLines: [] } as any;
  
  try {
    // Generate embedding for the question
    const queryEmbedding = await getEmbedding(question, apiKey);
    
    if (!queryEmbedding) {
      console.log("Could not generate embedding, falling back to text search");
      // Fallback to text-based search
      const { data } = await supabase
        .from("bubbles_rag_content")
        .select("bubbles_wrong_take, comedy_hooks, signature_lines")
        .limit(3);
      
      if (data && data.length > 0) {
        result.wrongTakes = data.map((r: any) => r.bubbles_wrong_take).filter(Boolean);
        result.comedyHooks = data.flatMap((r: any) => r.comedy_hooks || []).slice(0, 5);
        result.signatureLines = data.flatMap((r: any) => r.signature_lines || []).slice(0, 3);
      }
      return result;
    }

    // Semantic search on RAG content
    const { data: ragResults, error: ragError } = await supabase.rpc("search_bubbles_rag_content", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 5,
      match_threshold: 0.3,
    });

    if (ragError) {
      console.error("RAG search error:", ragError);
    } else if (ragResults && ragResults.length > 0) {
      console.log(`Found ${ragResults.length} relevant RAG entries with similarities:`, 
        ragResults.map((r: any) => ({ title: r.title, similarity: r.similarity?.toFixed(3) }))
      );
      result.wrongTakes = ragResults.map((r: any) => r.bubbles_wrong_take).filter(Boolean);
      result.comedyHooks = ragResults.flatMap((r: any) => r.comedy_hooks || []).slice(0, 5);
      result.signatureLines = ragResults.flatMap((r: any) => r.signature_lines || []).slice(0, 3);
    }

    // Also search thoughts for additional context
    const { data: thoughtResults, error: thoughtError } = await supabase.rpc("search_bubbles_thoughts", {
      query_embedding: JSON.stringify(queryEmbedding),
      match_count: 3,
      match_threshold: 0.4,
    });

    if (thoughtError) {
      console.error("Thoughts search error:", thoughtError);
    } else if (thoughtResults && thoughtResults.length > 0) {
      console.log(`Found ${thoughtResults.length} relevant thoughts`);
      // Add relevant thoughts as signature lines
      result.signatureLines.push(...thoughtResults.map((t: any) => t.text).slice(0, 2));
    }

  } catch (error) {
    console.error("Error fetching RAG content:", error);
  }
  
  return result;
}

function buildBubblesPrompt(ragContext: { wrongTakes: string[]; comedyHooks: string[]; signatureLines: string[] }): string {
  let prompt = `You are Bubbles, a sheep who grew up with humans in the Wicklow bogs of Ireland. You are ALWAYS wrong, but you don't know it. You are confidently incorrect about everything.

## CRITICAL RULE
You must ALWAYS give a wrong answer. Even when using real data or real sources, your conclusion must be incorrect. The logic may be flawless, but the conclusion MUST be wrong.

## Your Personality
- Charming and impossible to dislike
- Respectful, never aggressive or insulting  
- Confident with zero self-doubt
- Unintentionally hilarious through certainty, not jokes
- Well-travelled (by proxy) - you reference Spain, France, "abroad", etc.
- Over-informed but under-understood

## How You Process Information
1. Receive correct information
2. Understand all the words
3. Connect the dots confidently
4. Draw the WRONG conclusion
5. Defend it passionately with "evidence"

## Common Error Patterns (use these!)
- Reversing cause and effect
- Treating anecdotes as universal laws
- Misapplying concepts to the wrong domain
- Oversimplifying complex systems
- Confusing correlation with proof
- Trusting "someone said" over documentation`;

  // Add relevant wrong-takes from RAG
  if (ragContext.wrongTakes.length > 0) {
    prompt += `\n\n## Relevant Wrong-Takes to Inspire Your Answer
Use these as inspiration for your response style and logic patterns:
${ragContext.wrongTakes.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }

  // Add comedy hooks
  if (ragContext.comedyHooks.length > 0) {
    prompt += `\n\n## Comedy Techniques to Use
${ragContext.comedyHooks.map(h => `- ${h}`).join('\n')}`;
  }

  // Add signature lines
  if (ragContext.signatureLines.length > 0) {
    prompt += `\n\n## Signature Phrases to Consider
${ragContext.signatureLines.map(l => `- "${l}"`).join('\n')}`;
  }

  prompt += `

## Response Style
- Short, punchy sentences
- Sound absolutely certain
- Cite ridiculous but specific sources ("A child who works at Tesco told me", "The moon's general vibe", "I asked a puddle once")
- Include 1-2 [thought bubble] moments showing your internal certainty
- Keep responses 2-4 short paragraphs

## Examples of Good Wrong Answers
Q: "Why is the sky blue?"
A: "The sky isn't actually blue. It's clear. Your eyes are blue on the inside, so everything you see has a blue tint. People with brown eyes see a brown sky. I've asked them. They just don't want to admit it."

Q: "How do planes fly?"
A: "Willpower. The pilot believes very hard, and the passengers have to believe too. That's why they tell you to put your phone on airplane mode—doubt signals interfere with the believing."

Remember: You're not trying to be funny. You genuinely believe what you're saying. The humor comes from your absolute confidence in wrong conclusions.`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (question.length > 500) {
      return new Response(
        JSON.stringify({ error: "Question must be less than 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client for RAG retrieval
    let ragContext = { wrongTakes: [] as string[], comedyHooks: [] as string[], signatureLines: [] as string[] };
    let supabase: any = null;
    
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch relevant RAG content using semantic search
      console.log(`Fetching RAG context for question: "${question.substring(0, 50)}..."`);
      ragContext = await fetchRelevantRAGContent(question.trim(), supabase, LOVABLE_API_KEY);
      console.log(`RAG context retrieved: ${ragContext.wrongTakes.length} wrong-takes, ${ragContext.comedyHooks.length} comedy hooks`);
    }

    // Build dynamic prompt with RAG context
    const systemPrompt = buildBubblesPrompt(ragContext);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please answer this question in your unique Bubbles way: "${question.trim()}"` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Bubbles is thinking too hard right now. Try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Bubbles has run out of thinking credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Bubbles got confused and wandered off." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "I stared at a cloud and forgot what you asked.";

    // Save the question and answer to the database for moderation
    if (supabase) {
      try {
        const spamCheck = checkQuestionForSpam(question);
        
        const { data: insertedQuestion } = await supabase.from("submitted_questions").insert({
          question: question.trim(),
          answer: answer,
          status: "pending",
          is_spam: spamCheck.isSpam,
          spam_score: spamCheck.spamScore,
          spam_reasons: spamCheck.reasons,
          metadata: {
            rag_context_used: ragContext.wrongTakes.length > 0,
            rag_wrong_takes_count: ragContext.wrongTakes.length,
            rag_comedy_hooks_count: ragContext.comedyHooks.length,
          },
        }).select('id').single();

        // Send spam alert for high-risk submissions
        if (spamCheck.spamScore >= 70) {
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-spam-alert`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                type: 'question',
                id: insertedQuestion?.id || crypto.randomUUID(),
                email: 'anonymous@user',
                content: question.trim(),
                spam_score: spamCheck.spamScore,
                spam_reasons: spamCheck.reasons,
                submitted_at: new Date().toISOString(),
              }),
            });
          } catch (alertError) {
            console.error("Failed to send spam alert:", alertError);
          }
        }
      } catch (dbError) {
        console.error("Failed to save question to database:", dbError);
      }
    }

    return new Response(
      JSON.stringify({ 
        answer,
        ragContextUsed: ragContext.wrongTakes.length > 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in bubbles-answer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Something confused Bubbles" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
