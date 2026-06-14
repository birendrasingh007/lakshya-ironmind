/**
 * patterns.js
 * 
 * Pattern calculation logic for agentic learning
 * 
 * WHAT: Turn raw ResetLogs into user patterns
 * 
 * HOW:
 * 1. Group resets by type
 * 2. Calculate success rate per type
 * 3. Calculate confidence (based on sample size)
 * 4. Rank by success rate
 */

/**
 * Calculate patterns from ResetLogs
 * 
 * Input: [
 *   { reset_title: "Box Breathing", was_helpful: "yes" },
 *   { reset_title: "Box Breathing", was_helpful: "no" },
 *   ...
 * ]
 * 
 * Output: [
 *   {
 *     reset_type: "Box Breathing",
 *     attempts: 4,
 *     helpful: 3,
 *     success_rate: 75,
 *     ranking: 1
 *   },
 *   ...
 * ]
 */
export function calculatePatterns(resetLogs) {
    if (!resetLogs || resetLogs.length === 0) {
      return [];
    }
  
    // GROUP: By reset type
    const grouped = {};
    resetLogs.forEach(log => {
      const resetType = log.reset_title || 'Unknown';
      if (!grouped[resetType]) {
        grouped[resetType] = [];
      }
      grouped[resetType].push(log);
    });
  
    // CALCULATE: Success rate per type
    const patterns = Object.entries(grouped).map(([resetType, logs]) => {
      const helpful = logs.filter(l => l.was_helpful === 'yes').length;
      const attempts = logs.length;
      const success_rate = Math.round((helpful / attempts) * 100);
  
      return {
        reset_type: resetType,
        attempts,
        helpful,
        success_rate,
        ranking: 0 // Will set after sorting
      };
    });
  
    // SORT: By success rate (high to low)
    patterns.sort((a, b) => b.success_rate - a.success_rate);
  
    // RANK: Assign ranking
    patterns.forEach((pattern, index) => {
      pattern.ranking = index + 1;
    });
  
    return patterns;
  }
  
  /**
   * Calculate learning confidence
   * 
   * Confidence = (total_attempts / 10) * 100
   * 
   * 0-2 attempts: 20% confidence (not enough data)
   * 3-5 attempts: 50% confidence (pattern emerging)
   * 6+ attempts: 75%+ confidence (solid pattern)
   */
  export function calculateConfidence(totalAttempts) {
    const maxAttempts = 10;
    const confidence = Math.round((totalAttempts / maxAttempts) * 100);
    return Math.min(confidence, 95); // Cap at 95%
  }
  
  /**
   * Get most helpful reset
   */
  export function getMostHelpful(patterns) {
    if (patterns.length === 0) return null;
    return patterns[0]; // Already sorted
  }
  
  /**
   * Get least helpful reset
   */
  export function getLeastHelpful(patterns) {
    if (patterns.length === 0) return null;
    return patterns[patterns.length - 1];
  }