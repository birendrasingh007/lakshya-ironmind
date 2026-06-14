import React, { useState, useEffect } from 'react';
import '../index.css';

/**
 * CohortScreen Component
 * 
 * WHAT: Display team cohort members + completion status + team motivation
 * 
 * WHY: IronMind is a TEAM system, not just personal.
 * Users stay consistent when they see others showing up.
 * Completion % (not stress scores) creates psychological safety.
 * 
 * HOW:
 * 1. On mount, call GET /api/cohort
 * 2. Backend returns: members[], team_message, team_emoji
 * 3. Display members with completion bars
 * 4. Display team nudge message with emoji
 * 5. Show loading spinner while fetching
 * 6. Show error if backend fails
 * 
 * KEY PARTS:
 * - Member list (5-8 demo users)
 * - Completion % bars (visual)
 * - Team message (from cohort-nudge-agent)
 * - Navigation back to /reset
 * 
 * PRIVACY FIRST:
 * - Shows: name, completion %
 * - Hides: stress scores, individual resets, triggers
 */

export default function CohortScreen({ onNavigateBack }) {
  const [members, setMembers] = useState([]);
  const [teamMessage, setTeamMessage] = useState('Loading...');
  const [teamEmoji, setTeamEmoji] = useState('⏳');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FETCH: Call backend for cohort data on mount
  useEffect(() => {
    const fetchCohortData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/cohort');
        
        if (!response.ok) throw new Error('Failed to load cohort');

        const data = await response.json();
        console.log('Cohort data:', data);

        setMembers(data.members || []);
        setTeamMessage(data.team_message || 'Team is doing great!');
        setTeamEmoji(data.team_emoji || '💪');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCohortData();
  }, []);  // Run once on mount

  // NAVIGATE: Go back to reset/checkin
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1>🏘️ Your Cohort</h1>
        
        {loading ? (
          <div className="cohort-loading">
            <div className="spinner">⏳</div>
            <p>Loading team data...</p>
          </div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {/* COHORT SUBTITLE */}
            <div className="cohort-subtitle">
              {members.length} members • Active Bhidus
            </div>

            {/* MEMBER COMPLETION BARS */}
            <div className="cohort-members">
              {members.map((member, index) => (
                <div key={index} className="cohort-member">
                  <div className="member-header">
                    <span className="member-name">{member.name}</span>
                    <span className="member-percent">{member.completion_pct}%</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${member.completion_pct}%`,
                        background: `linear-gradient(90deg, #10b981 0%, #06b6d4 100%)`
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* TEAM MESSAGE */}
            <div className="team-message-box">
              <div className="team-message-emoji">{teamEmoji}</div>
              <div className="team-message-text">
                {teamMessage}
              </div>
            </div>

            {/* BACK BUTTON */}
            <button
              onClick={handleBack}
              className="btn-back"
            >
              ← Back to My Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}