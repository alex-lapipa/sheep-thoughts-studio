// Spam detection utility for contact forms and submitted questions

interface SpamCheckResult {
  isSpam: boolean;
  spamScore: number;
  reasons: string[];
}

// Common spam keywords (adjust as needed)
const SPAM_KEYWORDS = [
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
 * Check content for spam indicators
 * Returns a score (0-100) and reasons for flagging
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

  // Check for spam keywords (each adds 10 points, max 40)
  const keywordMatches: string[] = [];
  for (const keyword of SPAM_KEYWORDS) {
    if (fullText.includes(keyword.toLowerCase())) {
      keywordMatches.push(keyword);
      score += 10;
    }
  }
  if (keywordMatches.length > 0) {
    reasons.push(`Spam keywords: ${keywordMatches.slice(0, 3).join(', ')}${keywordMatches.length > 3 ? '...' : ''}`);
    score = Math.min(score, 40); // Cap keyword contribution
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
 * Quick check - returns true if likely spam
 */
export function isLikelySpam(message: string, email?: string): boolean {
  const result = checkForSpam({ message, email });
  return result.isSpam;
}
