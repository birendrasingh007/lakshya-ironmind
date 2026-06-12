import React, { useState } from 'react';
import '../index.css';

/**
 * CompleteScreen Component
 * 
 * WHAT: Capture user feedback on whether reset helped
 * 
 * WHY: Feedback trains reset-plan-agent on what works
 * 
 * HOW:
 * 1. Show: "Did the reset help?"
 * 2. User clicks: Yes / No / Not sure
 * 3. POST to /api/reset-feedback with feedback
 * 4. Show success message
 * 5. Navigate back to /checkin
 */

export default function CompleteScreen({ resetPlan, completionStatus, onComplete }) {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFeedback = async (feedback) => {
    setSelectedFeedback(feedback);
    setLoading(true);
    setError(null);

    try {
      // POST to /api/reset-feedback
      const response = await fetch('/api/reset-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'birendra-001',
          reset_plan_id: resetPlan?.reset_plan_id,
          completion_status: completionStatus, // "done" or "skipped"
          was_helpful: feedback // "yes", "no", "not_sure"
        })
      });

      if (!response.ok) throw new Error('Failed to save feedback');

      const data = await response.json();
      console.log('Feedback saved:', data);
      setSuccess(true);

      // Navigate back after 1.5 seconds
      setTimeout(() => {
        if (onComplete) {
          onComplete({ feedback, completionStatus });
        }
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1>💭 How Did It Go?</h1>

        {!success ? (
          <>
            <div className="form-group">
              <label>Did the reset help?</label>
              <p className="complete-subtitle">
                Your feedback helps us personalize future resets for you.
              </p>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="feedback-buttons">
              <button
                onClick={() => handleFeedback('yes')}
                disabled={loading}
                className={`btn-feedback btn-yes ${selectedFeedback === 'yes' ? 'selected' : ''}`}
              >
                👍 Yes, it helped
              </button>
              <button
                onClick={() => handleFeedback('no')}
                disabled={loading}
                className={`btn-feedback btn-no ${selectedFeedback === 'no' ? 'selected' : ''}`}
              >
                👎 No, didn't help
              </button>
              <button
                onClick={() => handleFeedback('not_sure')}
                disabled={loading}
                className={`btn-feedback btn-neutral ${selectedFeedback === 'not_sure' ? 'selected' : ''}`}
              >
                🤔 Not sure
              </button>
            </div>
          </>
        ) : (
          <div className="success complete-success">
            ✅ Thanks for the feedback!
            <div className="complete-message">
              Your insight helps us learn what works for you. Returning to check-in...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}