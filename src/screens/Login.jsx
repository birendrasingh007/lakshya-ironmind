import React, { useState } from 'react';
import '../index.css';

/**
 * LoginScreen Component
 * 
 * WHAT: Simple identification screen (email + name)
 * 
 * WHY: Identify which user this is, so we track their data
 * 
 * HOW:
 * 1. User enters email + name
 * 2. POST to /api/auth
 * 3. Backend: creates user if new, returns user_id (= email)
 * 4. Frontend: saves user_id to localStorage
 * 5. Navigate to /checkin
 * 
 * NOTE: No password. Trust-based (Active Bhidus are friends).
 * Post-capstone: Add auth if needed.
 */

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CLIENT VALIDATION
    if (!email || !name) {
      setError('Email and name are required');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // CALL BACKEND: /api/auth
      //const response = await fetch('/api/auth', {
      const response = await fetch('https://lakshya-ironmind-production.up.railway.app/api/auth', {  
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name
        })
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      console.log('Auth response:', data);

      // SAVE TO LOCALSTORAGE
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('user_email', data.email_id);
      localStorage.setItem('user_name', data.user_name);

      console.log('User logged in:', data.user_id);

      // CALLBACK TO PARENT
      if (onLoginSuccess) {
        onLoginSuccess(data.user_id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkin-container">
      <div className="login-card">
        <h1>🧠 IronMind</h1>
        <p className="login-subtitle">Personalized Wellness Companion</p>

        <form onSubmit={handleSubmit}>
          {/* EMAIL INPUT */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="birendra@example.com"
              className="login-input"
              disabled={loading}
            />
          </div>

          {/* NAME INPUT */}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Birendra Singh"
              className="login-input"
              disabled={loading}
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && <div className="error">{error}</div>}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* FOOTER NOTE */}
        <div className="login-footer">
          <p>Part of Active Bhidus cohort</p>
        </div>
      </div>
    </div>
  );
}