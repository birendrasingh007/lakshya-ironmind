import React, { useState, useEffect } from 'react';
import '../index.css';

/**
 * SummaryScreen Component
 * 
 * WHAT: Display user's personalized learning dashboard
 * 
 * WHY: Shows IronMind learns from user behavior
 * Patterns → Agent insight → Tomorrow's prediction
 * 
 * HOW:
 * 1. On mount, call GET /api/summary
 * 2. Backend calculates patterns + calls summary-agent
 * 3. Display: most helpful reset, success rates, tomorrow's suggestion
 * 4. Show agent insight (why this reset works for you)
 * 5. Show confidence level (how sure the pattern is)
 */

export default function SummaryScreen({ onNavigateBack }) {
  const [patterns, setPatterns] = useState([]);
  const [insight, setInsight] = useState('');
  const [tomorrowSuggestion, setTomorrowSuggestion] = useState('');
  const [patternSummary, setPatternSummary] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [stats, setStats] = useState({
    total_checkups: 0,
    most_helpful: 'None yet',
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
        const user_id = localStorage.getItem('user_id');
        const response = await fetch(`/api/summary?user_id=${user_id}`);
        
        if (!response.ok) throw new Error('Failed to load summary');

        const data = await response.json();
        console.log('Summary data:', data);

        setPatterns(data.patterns || []);
        setInsight(data.insight || '');
        setTomorrowSuggestion(data.tomorrow_suggestion || '');
        setPatternSummary(data.pattern_summary || '');
        setConfidence(data.confidence || 0);
        setStats({
          total_checkups: data.total_checkups || 0,
          most_helpful: data.most_helpful || 'None yet',
          least_helpful: data.least_helpful || null
        });
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

  // NAVIGATE: Start new checkin (goes back to login/checkin)
  const handleNewCheckin = () => {
    localStorage.clear();
    window.location.href = '/';
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
                <div className="stat-label">CHECK-INS</div>
                <div className="stat-value">{stats.total_checkups}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">LEARNING</div>
                <div className="stat-value">{confidence}%</div>
              </div>
              <div className="stat-box">
              <div className="stat-label">MOST HELPFUL</div>
              <div className="stat-value">{stats.most_helpful?.reset_type || 'None yet'}</div>
              </div>
            </div>

            {/* LEARNING INSIGHT */}
            <div className="insight-box">
              <div className="insight-emoji">🧠</div>
              <div className="insight-title">WHAT'S WORKING</div>
              <div className="insight-text">{insight}</div>
            </div>

            {/* TOMORROW'S SUGGESTION */}
            <div className="suggestion-box">
              <div className="suggestion-emoji">🎯</div>
              <div className="suggestion-title">TOMORROW'S PLAY</div>
              <div className="suggestion-text">{tomorrowSuggestion}</div>
            </div>

            {/* PATTERN SUMMARY */}
            {patternSummary && (
              <div className="pattern-box">
                <div className="pattern-title">PATTERN SUMMARY</div>
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

            {/* BUTTONS: Back to Cohort + New Checkin */}
            <div className="summary-buttons">
              <button
                onClick={handleBack}
                className="btn-secondary"
              >
                ← Back to Cohort
              </button>
              <button
                onClick={handleNewCheckin}
                className="btn-submit"
              >
                ✓ New Checkin
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}