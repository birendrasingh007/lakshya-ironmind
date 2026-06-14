import React, { useState, useEffect } from 'react';
import '../index.css';

/**
 * SummaryScreen Component
 * 
 * WHAT: Display user's personalized learning dashboard
 * 
 * WHY: Shows IronMind learns from user behavior
 * Patterns → Agent insight → Tomorrow's prediction
 * This is real personalization in action.
 * 
 * HOW:
 * 1. On mount, call GET /api/summary
 * 2. Backend calculates patterns + calls summary-agent
 * 3. Display: most helpful reset, success rates, tomorrow's suggestion
 * 4. Show agent insight (why this reset works for you)
 * 5. Show confidence level (how sure the pattern is)
 * 
 * KEY PARTS:
 * - Stats row (total checkups, confidence)
 * - Most helpful reset (highlighted)
 * - Tomorrow's suggestion (from agent)
 * - Learning insight (from summary-agent)
 * - Pattern list (all resets ranked by success)
 */

export default function SummaryScreen({ onNavigateBack }) {
  const [patterns, setPatterns] = useState([]);
  const [insight, setInsight] = useState('');
  const [tomorrowSuggestion, setTomorrowSuggestion] = useState('');
  const [patternSummary, setPatternSummary] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [stats, setStats] = useState({
    total_checkups: 0,
    most_helpful: null,
    least_helpful: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH: Call backend for learning data on mount
  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/summary');
        
        if (!response.ok) throw new Error('Failed to load summary');

        const data = await response.json();
        console.log('Summary data:', data);

        setPatterns(data.patterns || []);
        setInsight(data.insight || '');
        setTomorrowSuggestion(data.tomorrow_suggestion || '');
        setPatternSummary(data.pattern_summary || '');
        setConfidence(data.confidence || 0);
        setStats(data.stats || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // NAVIGATE: Go back to cohort
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  // Helper: Get emoji based on success rate
  const getEmoji = (successRate) => {
    if (successRate >= 75) return '🔥';
    if (successRate >= 50) return '💪';
    if (successRate >= 25) return '🤔';
    return '❌';
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1>📊 Your Week at a Glance</h1>

        {loading ? (
          <div className="summary-loading">
            <div className="spinner">⏳</div>
            <p>Analyzing your patterns...</p>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {/* STATS ROW */}
            <div className="summary-stats">
              <div className="stat-box">
                <div className="stat-label">Check-ins</div>
                <div className="stat-value">{stats.total_checkups}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Learning</div>
                <div className="stat-value">{confidence}%</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Most Helpful</div>
                <div className="stat-value">{stats.most_helpful}</div>
              </div>
            </div>

            {/* LEARNING INSIGHT */}
            <div className="insight-box">
              <div className="insight-emoji">🧠</div>
              <div className="insight-title">What's Working</div>
              <div className="insight-text">{insight}</div>
            </div>

            {/* TOMORROW'S SUGGESTION */}
            <div className="suggestion-box">
              <div className="suggestion-emoji">🎯</div>
              <div className="suggestion-title">Tomorrow's Play</div>
              <div className="suggestion-text">{tomorrowSuggestion}</div>
            </div>

            {/* PATTERN SUMMARY */}
            {patternSummary && (
              <div className="pattern-box">
                <div className="pattern-title">Pattern Summary</div>
                <div className="pattern-text">{patternSummary}</div>
              </div>
            )}

            {/* RESET PATTERNS BREAKDOWN */}
            {patterns.length > 0 && (
              <div className="patterns-breakdown">
                <h3>Your Reset Effectiveness</h3>
                {patterns.map((pattern, index) => (
                  <div key={index} className="pattern-row">
                    <div className="pattern-left">
                      <span className="pattern-emoji">{getEmoji(pattern.success_rate)}</span>
                      <span className="pattern-name">{pattern.reset_type}</span>
                    </div>
                    <div className="pattern-right">
                      <span className="pattern-stats">
                        {pattern.helpful}/{pattern.attempts} ({pattern.success_rate}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* BACK BUTTON */}
            <button
              onClick={handleBack}
              className="btn-back"
            >
              ← Back to Cohort
            </button>
          </>
        )}
      </div>
    </div>
  );
}