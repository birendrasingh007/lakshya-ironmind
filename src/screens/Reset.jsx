import React, { useState } from 'react';
import '../index.css';

/**
 * ResetScreen Component
 * 
 * WHAT: Display AI-generated reset plan with action buttons
 * (Done, Skip, Regenerate)
 * 
 * WHY: User needs to READ the plan, understand steps, then act.
 * Separate screen reduces cognitive load vs inline display.
 * 
 * HOW:
 * 1. Receive resetPlan from props or URL params
 * 2. Display: title, duration, why_this_reset, steps[], follow_up
 * 3. User clicks button:
 *    - Done: set action="done", navigate to /complete
 *    - Skip: set action="skip", navigate to /complete
 *    - Regenerate: call /api/checkin again, show new plan
 * 4. Regenerate shows spinner while loading
 * 
 * KEY PARTS:
 * - Steps rendered as numbered list
 * - Regenerate button disabled while loading
 * - Error handling if regenerate fails
 */

export default function ResetScreen({ resetPlan: initialPlan, checkinData, onComplete }) {
  const [resetPlan, setResetPlan] = useState(initialPlan || {
    reset_title: 'Loading...',
    duration_mins: 0,
    steps: [],
    why_this_reset: '',
    follow_up: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Use actual checkin data from props
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: checkinData?.user_id || 'birendra-001',
          stress_score: checkinData?.stress_score,
          energy_level: checkinData?.energy_level,
          time_available_mins: checkinData?.time_available_mins,
          stress_trigger: checkinData?.stress_trigger
        })
      });
  
      if (!response.ok) throw new Error('Failed to regenerate');
  
      const data = await response.json();
      setResetPlan({
        reset_title: data.reset_title,
        duration_mins: data.duration_mins,
        steps: data.steps,
        why_this_reset: data.why_this_reset,
        follow_up: data.follow_up
      });
    } catch (err) {
      setError('Could not generate new reset. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // DONE: Mark reset as completed
  const handleDone = () => {
    if (onComplete) {
      onComplete({ action: 'done', resetPlan });
    }
    // TODO: Navigate to /complete screen
  };

  // SKIP: Mark reset as skipped
  const handleSkip = () => {
    if (onComplete) {
      onComplete({ action: 'skip', resetPlan });
    }
    // TODO: Navigate to /complete screen
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1>🎯 Your Reset Plan</h1>

        {/* RESET TITLE + DURATION */}
        <div className="reset-header">
          <h2>{resetPlan.reset_title}</h2>
          <div className="reset-duration">
            ⏱️ {resetPlan.duration_mins} minutes
          </div>
        </div>

        {/* WHY THIS RESET */}
        <div className="form-group">
          <label>Why This Reset:</label>
          <div className="reset-reasoning">
            "{resetPlan.why_this_reset}"
          </div>
        </div>

        {/* STEPS */}
        <div className="form-group">
          <label>Steps:</label>
          <ol className="reset-steps">
            {resetPlan.steps && resetPlan.steps.map((step, index) => (
              <li key={index} className="reset-step">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* FOLLOW-UP MESSAGE */}
        <div className="form-group">
          <div className="reset-followup">
            💭 {resetPlan.follow_up}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && <div className="error">{error}</div>}

        {/* ACTION BUTTONS */}
        <div className="reset-actions">
          <button
            onClick={handleDone}
            className="btn-action btn-done"
            disabled={loading}
          >
            ✓ Done
          </button>
          <button
            onClick={handleRegenerate}
            className="btn-action btn-regenerate"
            disabled={loading}
          >
            {loading ? '⟳ Generating...' : '⟳ Regenerate'}
          </button>
          <button
            onClick={handleSkip}
            className="btn-action btn-skip"
            disabled={loading}
          >
            ← Skip
          </button>
        </div>
      </div>
    </div>
  );
}