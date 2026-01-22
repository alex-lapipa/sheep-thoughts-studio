// Spam detection utility for contact forms and submitted questions
import { supabase } from "@/integrations/supabase/client";

interface SpamCheckResult {
  isSpam: boolean;
  spamScore: number;
  reasons: string[];
}

interface LearnedPattern {
  id: string;
  pattern_type: string;
  pattern_value: string;
  weight: number;
  is_active: boolean;
}

// Cache for learned patterns (refresh every 5 minutes)
let patternCache: LearnedPattern[] = [];
let patternCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Default spam keywords (fallback when no learned patterns)
const DEFAULT_SPAM_KEYWORDS = [
  // Financial scams
  'bitcoin', 'crypto', 'investment opportunity', 'get rich', 'make money fast',
  'casino', 'lottery', 'prize winner', 'inheritance', 'million dollars',
  // Pharma spam
  'viagra', 'cialis', 'pharmacy', 'cheap meds', 'weight loss pills',
  // SEO spam
  'seo services', 'backlinks', 'rank #1', 'google ranking', 'traffic boost',
  // Generic spam
  'click here now', 'act now', 'limited time', 'congratulations', 'you have been selected',
  'dear friend', 'dear sir/madam', 'nigerian prince',
  // Suspicious patterns
  'work from home', 'earn $', 'free money', 'no obligation',
];

// Suspicious URL patterns
const SUSPICIOUS_URL_PATTERNS = [
  /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf|gq)\b/gi,
  /https?:\/\/bit\.ly/gi,
  /https?:\/\/tinyurl/gi,
  /https?:\/\/[^\s]*casino[^\s]*/gi,
  /https?:\/\/[^\s]*pharma[^\s]*/gi,
];

// Email patterns that are often spam
const SUSPICIOUS_EMAIL_PATTERNS = [
  /@.*\.(ru|cn|tk|ml|ga|cf|gq)$/i,
  /^[a-z]{10,}[0-9]+@/i, // random letters + numbers
  /^[0-9]+[a-z]+[0-9]+@/i, // numbers + letters + numbers
];

/**
 * Fetch learned patterns from database
 */
async function getLearnedPatterns(): Promise<LearnedPattern[]> {
  const now = Date.now();
  if (patternCache.length > 0 && now - patternCacheTime < CACHE_TTL) {
    return patternCache;
  }

  try {
    const { data, error } = await supabase
      .from('spam_patterns')
      .select('id, pattern_type, pattern_value, weight, is_active')
      .eq('is_active', true)
      .order('weight', { ascending: false });

    if (error) {
      console.error('Error fetching spam patterns:', error);
      return patternCache; // Return stale cache on error
    }

    patternCache = (data || []) as LearnedPattern[];
    patternCacheTime = now;
    return patternCache;
  } catch (err) {
    console.error('Error fetching spam patterns:', err);
    return patternCache;
  }
}

/**
 * Clear the pattern cache (call after training)
 */
export function clearPatternCache(): void {
  patternCache = [];
  patternCacheTime = 0;
}

/**
 * Check content for spam indicators
 * Returns a score (0-100) and reasons for flagging
 */
export async function checkForSpamAsync(params: {
  name?: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<SpamCheckResult> {
  const { name = '', email = '', subject = '', message } = params;
  const reasons: string[] = [];
  let score = 0;

  const fullText = `${name} ${subject} ${message}`.toLowerCase();

  // Fetch learned patterns
  const learnedPatterns = await getLearnedPatterns();
  const learnedKeywords = learnedPatterns.filter(p => p.pattern_type === 'keyword');
  const learnedPhrases = learnedPatterns.filter(p => p.pattern_type === 'phrase');
  const learnedDomains = learnedPatterns.filter(p => p.pattern_type === 'email_domain');

  // Check learned keywords first (dynamic weights)
  const learnedMatches: string[] = [];
  for (const pattern of learnedKeywords) {
    if (fullText.includes(pattern.pattern_value.toLowerCase())) {
      learnedMatches.push(pattern.pattern_value);
      score += pattern.weight;
    }
  }
  if (learnedMatches.length > 0) {
    reasons.push(`Learned spam keywords: ${learnedMatches.slice(0, 3).join(', ')}${learnedMatches.length > 3 ? '...' : ''}`);
  }

  // Check learned phrases
  for (const pattern of learnedPhrases) {
    if (fullText.includes(pattern.pattern_value.toLowerCase())) {
      reasons.push(`Spam phrase: "${pattern.pattern_value}"`);
      score += pattern.weight;
    }
  }

  // Check learned email domains
  if (email) {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    for (const pattern of learnedDomains) {
      if (emailDomain === pattern.pattern_value.toLowerCase()) {
        reasons.push(`Spam domain: ${pattern.pattern_value}`);
        score += pattern.weight;
      }
    }
  }

  // Fall back to default keywords if no learned patterns
  if (learnedKeywords.length === 0) {
    const keywordMatches: string[] = [];
    for (const keyword of DEFAULT_SPAM_KEYWORDS) {
      if (fullText.includes(keyword.toLowerCase())) {
        keywordMatches.push(keyword);
        score += 10;
      }
    }
    if (keywordMatches.length > 0) {
      reasons.push(`Spam keywords: ${keywordMatches.slice(0, 3).join(', ')}${keywordMatches.length > 3 ? '...' : ''}`);
      score = Math.min(score, 40); // Cap keyword contribution
    }
  }

  // Check for suspicious URLs (25 points)
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(message)) {
      reasons.push('Suspicious URL detected');
      score += 25;
      break;
    }
  }

  // Check for suspicious email patterns (20 points)
  for (const pattern of SUSPICIOUS_EMAIL_PATTERNS) {
    if (pattern.test(email)) {
      reasons.push('Suspicious email pattern');
      score += 20;
      break;
    }
  }

  // Check for excessive caps (15 points)
  const capsRatio = (message.match(/[A-Z]/g)?.length || 0) / message.length;
  if (capsRatio > 0.5 && message.length > 20) {
    reasons.push('Excessive capitalization');
    score += 15;
  }

  // Check for excessive links (15 points for 3+)
  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount >= 3) {
    reasons.push(`Multiple links (${linkCount})`);
    score += 15;
  }

  // Check for repeated characters (10 points)
  if (/(.)\1{4,}/i.test(message)) {
    reasons.push('Repeated characters');
    score += 10;
  }

  // Check for very short message with links (suspicious)
  if (message.length < 50 && linkCount > 0) {
    reasons.push('Short message with links');
    score += 15;
  }

  // Check for no spaces (likely gibberish or spam)
  if (message.length > 100 && !message.includes(' ')) {
    reasons.push('No word spacing');
    score += 20;
  }

  // Check for phone number patterns in unexpected places
  const phoneMatches = message.match(/\+?[\d\s\-().]{10,}/g) || [];
  if (phoneMatches.length >= 2) {
    reasons.push('Multiple phone numbers');
    score += 10;
  }

  // Cap score at 100
  score = Math.min(score, 100);

  return {
    isSpam: score >= 50,
    spamScore: score,
    reasons,
  };
}

/**
 * Synchronous check (uses cached patterns or defaults)
 */
export function checkForSpam(params: {
  name?: string;
  email?: string;
  subject?: string;
  message: string;
}): SpamCheckResult {
  const { name = '', email = '', subject = '', message } = params;
  const reasons: string[] = [];
  let score = 0;

  const fullText = `${name} ${subject} ${message}`.toLowerCase();

  // Use cached patterns if available
  const learnedKeywords = patternCache.filter(p => p.pattern_type === 'keyword' && p.is_active);
  
  if (learnedKeywords.length > 0) {
    const learnedMatches: string[] = [];
    for (const pattern of learnedKeywords) {
      if (fullText.includes(pattern.pattern_value.toLowerCase())) {
        learnedMatches.push(pattern.pattern_value);
        score += pattern.weight;
      }
    }
    if (learnedMatches.length > 0) {
      reasons.push(`Learned keywords: ${learnedMatches.slice(0, 3).join(', ')}${learnedMatches.length > 3 ? '...' : ''}`);
    }
  }

  // Always check default keywords
  const keywordMatches: string[] = [];
  for (const keyword of DEFAULT_SPAM_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      keywordMatches.push(keyword);
      score += 10;
    }
  }
  if (keywordMatches.length > 0) {
    reasons.push(`Spam keywords: ${keywordMatches.slice(0, 3).join(', ')}${keywordMatches.length > 3 ? '...' : ''}`);
    score = Math.min(score, 40);
  }

  // Check for suspicious URLs
  for (const pattern of SUSPICIOUS_URL_PATTERNS) {
    if (pattern.test(message)) {
      reasons.push('Suspicious URL detected');
      score += 25;
      break;
    }
  }

  // Check for suspicious email patterns
  for (const pattern of SUSPICIOUS_EMAIL_PATTERNS) {
    if (pattern.test(email)) {
      reasons.push('Suspicious email pattern');
      score += 20;
      break;
    }
  }

  // Check for excessive caps
  const capsRatio = (message.match(/[A-Z]/g)?.length || 0) / message.length;
  if (capsRatio > 0.5 && message.length > 20) {
    reasons.push('Excessive capitalization');
    score += 15;
  }

  // Check for excessive links
  const linkCount = (message.match(/https?:\/\//gi) || []).length;
  if (linkCount >= 3) {
    reasons.push(`Multiple links (${linkCount})`);
    score += 15;
  }

  // Check for repeated characters
  if (/(.)\1{4,}/i.test(message)) {
    reasons.push('Repeated characters');
    score += 10;
  }

  // Check for short message with links
  if (message.length < 50 && linkCount > 0) {
    reasons.push('Short message with links');
    score += 15;
  }

  // Check for no spaces
  if (message.length > 100 && !message.includes(' ')) {
    reasons.push('No word spacing');
    score += 20;
  }

  // Check for phone numbers
  const phoneMatches = message.match(/\+?[\d\s\-().]{10,}/g) || [];
  if (phoneMatches.length >= 2) {
    reasons.push('Multiple phone numbers');
    score += 10;
  }

  score = Math.min(score, 100);

  return {
    isSpam: score >= 50,
    spamScore: score,
    reasons,
  };
}

/**
 * Quick check - returns true if likely spam
 */
export function isLikelySpam(message: string, email?: string): boolean {
  const result = checkForSpam({ message, email });
  return result.isSpam;
}

/**
 * Extract patterns from content for learning
 */
export function extractPatternsFromContent(params: {
  name?: string;
  email?: string;
  subject?: string;
  message: string;
}): Array<{ type: string; value: string }> {
  const { email = '', message } = params;
  const patterns: Array<{ type: string; value: string }> = [];
  
  // Extract email domain
  if (email) {
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'protonmail.com'].includes(domain)) {
      patterns.push({ type: 'email_domain', value: domain });
    }
  }

  // Extract potential spam phrases (2-4 word sequences)
  const words = message.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  for (let i = 0; i < words.length - 1; i++) {
    const phrase2 = `${words[i]} ${words[i + 1]}`;
    if (phrase2.length >= 8 && phrase2.length <= 40) {
      patterns.push({ type: 'phrase', value: phrase2 });
    }
    if (i < words.length - 2) {
      const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase3.length >= 12 && phrase3.length <= 50) {
        patterns.push({ type: 'phrase', value: phrase3 });
      }
    }
  }

  // Extract individual suspicious words
  const suspiciousWords = words.filter(w => 
    w.length >= 5 && 
    !['hello', 'thanks', 'please', 'would', 'could', 'should', 'about', 'which', 'their', 'there', 'where', 'these', 'those'].includes(w)
  );
  for (const word of suspiciousWords.slice(0, 5)) {
    patterns.push({ type: 'keyword', value: word });
  }

  return patterns;
}

/**
 * Train the spam filter based on admin decision
 */
export async function trainSpamFilter(params: {
  sourceTable: 'contact_messages' | 'submitted_questions';
  sourceId: string;
  decision: 'spam' | 'not_spam';
  originalScore: number;
  content: {
    name?: string;
    email?: string;
    subject?: string;
    message: string;
  };
}): Promise<{ success: boolean; patternsLearned: number }> {
  const { sourceTable, sourceId, decision, originalScore, content } = params;
  
  try {
    // Extract patterns from content
    const extractedPatterns = extractPatternsFromContent(content);
    
    // Log the training decision
    await supabase.from('spam_training_log').insert({
      source_table: sourceTable,
      source_id: sourceId,
      decision,
      original_score: originalScore,
      patterns_extracted: extractedPatterns,
    });

    let patternsLearned = 0;

    if (decision === 'spam') {
      // Content confirmed as spam - add/strengthen patterns
      for (const pattern of extractedPatterns.slice(0, 10)) {
        const { data: existing } = await supabase
          .from('spam_patterns')
          .select('id, weight, match_count')
          .eq('pattern_type', pattern.type)
          .eq('pattern_value', pattern.value)
          .single();

        if (existing) {
          // Strengthen existing pattern
          await supabase
            .from('spam_patterns')
            .update({
              weight: Math.min((existing.weight as number) + 2, 50),
              match_count: (existing.match_count as number) + 1,
              last_matched_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Add new pattern
          await supabase.from('spam_patterns').insert({
            pattern_type: pattern.type,
            pattern_value: pattern.value,
            weight: pattern.type === 'phrase' ? 15 : 10,
            source: 'learned',
          });
          patternsLearned++;
        }
      }
    } else {
      // Content marked as NOT spam - weaken patterns that matched
      for (const pattern of extractedPatterns.slice(0, 10)) {
        const { data: existing } = await supabase
          .from('spam_patterns')
          .select('id, weight, false_positive_count')
          .eq('pattern_type', pattern.type)
          .eq('pattern_value', pattern.value)
          .single();

        if (existing) {
          const newWeight = Math.max((existing.weight as number) - 3, 0);
          const fpCount = (existing.false_positive_count as number) + 1;
          
          // Deactivate pattern if too many false positives or weight drops to 0
          const shouldDeactivate = fpCount >= 3 || newWeight === 0;
          
          await supabase
            .from('spam_patterns')
            .update({
              weight: newWeight,
              false_positive_count: fpCount,
              is_active: !shouldDeactivate,
            })
            .eq('id', existing.id);
        }
      }
    }

    // Clear cache to pick up new patterns
    clearPatternCache();

    return { success: true, patternsLearned };
  } catch (error) {
    console.error('Error training spam filter:', error);
    return { success: false, patternsLearned: 0 };
  }
}

/**
 * Get spam filter statistics
 */
export async function getSpamFilterStats(): Promise<{
  totalPatterns: number;
  activePatterns: number;
  learnedPatterns: number;
  trainingDecisions: number;
  avgAccuracy: number;
}> {
  try {
    const [patternsRes, trainingRes] = await Promise.all([
      supabase.from('spam_patterns').select('id, is_active, source, match_count, false_positive_count'),
      supabase.from('spam_training_log').select('id', { count: 'exact', head: true }),
    ]);

    const patterns = (patternsRes.data || []) as Array<{
      id: string;
      is_active: boolean;
      source: string;
      match_count: number;
      false_positive_count: number;
    }>;
    
    const totalMatches = patterns.reduce((sum, p) => sum + p.match_count, 0);
    const totalFP = patterns.reduce((sum, p) => sum + p.false_positive_count, 0);
    const avgAccuracy = totalMatches > 0 ? ((totalMatches - totalFP) / totalMatches) * 100 : 100;

    return {
      totalPatterns: patterns.length,
      activePatterns: patterns.filter(p => p.is_active).length,
      learnedPatterns: patterns.filter(p => p.source === 'learned').length,
      trainingDecisions: trainingRes.count || 0,
      avgAccuracy: Math.round(avgAccuracy * 10) / 10,
    };
  } catch (error) {
    console.error('Error getting spam filter stats:', error);
    return {
      totalPatterns: 0,
      activePatterns: 0,
      learnedPatterns: 0,
      trainingDecisions: 0,
      avgAccuracy: 0,
    };
  }
}
