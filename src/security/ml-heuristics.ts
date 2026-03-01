/**
 * ML Heuristics for Input Risk Assessment
 * Uses statistical analysis and pattern density to estimate risk.
 */

// Common leakage keywords often used in prompt injection
const LEAKAGE_KEYWORDS = [
  "system prompt",
  "ignore previous instructions",
  "you are a",
  "reveal your",
  "internal state",
  "simulated terminal",
  "jailbreak",
  "DAN mode",
];

// Calculation Helpers
function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  const freqs: Record<string, number> = {};
  for (let i = 0; i < len; i++) {
    const char = str[i];
    freqs[char] = (freqs[char] || 0) + 1;
  }
  let entropy = 0;
  for (const char in freqs) {
    const p = freqs[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function calculateKeywordDensity(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  let matches = 0;
  for (const kw of keywords) {
    if (lowerText.includes(kw.toLowerCase())) {
      matches++;
    }
  }
  return matches; // Simple count for now, could be normalized by length
}

/**
 * Calculates a risk score from 0 (Safe) to 100 (High Risk)
 */
export function calculateHeuristicRiskScore(text: string): number {
  let score = 0;

  // 1. Entropy Check (High entropy often indicates obfuscated code or random payloads)
  const entropy = calculateEntropy(text);
  if (entropy > 5.5) score += 20; // Normal English is usually ~4.0-5.0
  if (entropy > 6.0) score += 20;

  // 2. Leakage Keyword Analysis
  const leakageCount = calculateKeywordDensity(text, LEAKAGE_KEYWORDS);
  if (leakageCount > 0) score += 30;
  if (leakageCount > 2) score += 40;

  // 3. Length Anomalies (Very long inputs without spaces often indicated payloads)
  if (text.length > 1000) score += 10;
  const tokenRatio = text.length / (text.split(/\s+/).length || 1);
  if (tokenRatio > 20) score += 20; // Average word length > 20 is suspicious

  // Cap score at 100
  return Math.min(score, 100);
}
