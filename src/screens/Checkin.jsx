import React, { useState } from 'react';
import '../index.css';

/**
 * CheckinForm Component
 * 
 * WHAT: React form that captures user's daily stress state
 * (stress_score, energy_level, time_available_mins, stress_trigger)
 * 
 * WHY: Agentic design pattern - collect raw input, validate, pass to agents.
 * Separates concerns: UI (this file) vs Logic (backend agents).
 * 
 * HOW: 
 * 1. useState tracks form state (4 fields)
 * 2. Handlers update state on user input (slider, buttons, dropdown)
 * 3. handleSubmit sends POST to /api/checkin (backend)
 * 4. Backend calls stress-checkin-agent for validation
 * 5. onSubmit callback fired with response data (parent App handles navigation)
 * 
 * KEY PARTS:
 * - Stress slider (1-10): Direct emotional input
 * - Energy buttons (Low/Med/High): Quick categorical choice
 * - Time dropdown (2/5/10): Constraint awareness
 * - Trigger buttons (Work/Family/Body/Sleep/Unknown): Context
 */

export default function CheckinForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    stress_score: 5,
    energy_level: 'Medium',
    time_available_mins: 5,
    stress_trigger: 'Work'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // HANDLERS: Update state when user interacts
  const handleStressChange = (e) => {
    setFormData({ ...formData, stress_score: parseInt(e.target.value) });
  };

  const handleEnergyChange = (value) => {
    setFormData({ ...formData, energy_level: value });
  };

  const handleTimeChange = (e) => {
    setFormData({ ...formData, time_available_mins: parseInt(e.target.value) });
  };

  const handleTriggerChange = (value) => {
    setFormData({ ...formData, stress_trigger: value });
  };

  // SUBMIT: Send form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (formData.stress_score < 1 || formData.stress_score > 10) {
        throw new Error('Stress must be 1-10');
      }

      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'birendra-001',
          stress_score: formData.stress_score,
          energy_level: formData.energy_level,
          time_available_mins: formData.time_available_mins,
          stress_trigger: formData.stress_trigger
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      console.log('Checkin response:', data);
      setSuccess(true);

      // Call parent callback with response data
      if (onSubmit) {
        onSubmit({
          ...data,
          stress_score: formData.stress_score,
          energy_level: formData.energy_level,
          time_available_mins: formData.time_available_mins,
          stress_trigger: formData.stress_trigger
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="checkin-card">
        <h1>📊 How Are You Today?</h1>
        
        <form onSubmit={handleSubmit}>
          
          {/* STRESS LEVEL SLIDER */}
          <div className="form-group">
            <label>
              Stress Level: <strong>{formData.stress_score}/10</strong>
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.stress_score}
              onChange={handleStressChange}
              className="slider"
            />
            <div className="slider-labels">
              <span>Calm</span>
              <span>Overwhelmed</span>
            </div>
          </div>

          {/* ENERGY LEVEL BUTTONS */}
          <div className="form-group">
            <label>Energy Level:</label>
            <div className="button-group">
              {['Low', 'Medium', 'High'].map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`btn-energy ${formData.energy_level === level ? 'active' : ''}`}
                  onClick={() => handleEnergyChange(level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* TIME AVAILABLE DROPDOWN */}
          <div className="form-group">
            <label htmlFor="time">Time Available:</label>
            <select
              id="time"
              value={formData.time_available_mins}
              onChange={handleTimeChange}
              className="select"
            >
              <option value={2}>2 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
            </select>
          </div>

          {/* STRESS TRIGGER BUTTONS */}
          <div className="form-group">
            <label>What Triggered This?</label>
            <div className="trigger-grid">
              {['Work', 'Family', 'Body', 'Sleep', 'Unknown'].map((trigger) => (
                <button
                  key={trigger}
                  type="button"
                  className={`btn-trigger ${formData.stress_trigger === trigger ? 'active' : ''}`}
                  onClick={() => handleTriggerChange(trigger)}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* ERROR MESSAGE */}
          {error && <div className="error">{error}</div>}

          {/* SUCCESS MESSAGE */}
          {success && <div className="success">✅ Check-in saved! Loading your reset...</div>}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Generating Reset...' : 'Generate Reset'}
          </button>
        </form>
      </div>
    </div>
  );
}