import React, { useState, useEffect } from 'react';
import './index.css';
import CheckinForm from './screens/Checkin';
import ResetScreen from './screens/Reset';
import CompleteScreen from './screens/Complete';
import CohortScreen from './screens/Cohort';
import SummaryScreen from './screens/Summary';
import LoginScreen from './screens/Login';


/**
 * App Component (Main Screen Router)
 * 
 * WHAT: Manages navigation between all screens + login state
 * 
 * WHY: Single source of truth for:
 * - Who is logged in (userId)
 * - Which screen to show
 * - Reset plan data
 * - Navigation between screens
 * 
 * HOW:
 * 1. On mount: Check localStorage for userId
 * 2. If userId exists: Show checkin (logged in)
 * 3. If NO userId: Show login (logged out)
 * 4. When user logs in: Reset all state, go to checkin
 * 5. When user logs out: Reset all state, go to login
 */

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(localStorage.getItem('user_id') ? 'checkin' : 'login');
  const [userId, setUserId] = useState(localStorage.getItem('user_id'));
  const [resetPlan, setResetPlan] = useState(null);
  const [checkinData, setCheckinData] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [showCohort, setShowCohort] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // RESET STATE when user logs in/out
  useEffect(() => {
    if (!userId) {
      // User logged out: reset everything
      setCurrentScreen('login');
      setResetPlan(null);
      setCheckinData(null);
      setCompletionStatus(null);
      setShowCohort(false);
      setShowSummary(false);
    } else {
      // User logged in: reset to checkin
      setCurrentScreen('checkin');
      setResetPlan(null);
      setCheckinData(null);
      setCompletionStatus(null);
      setShowCohort(false);
      setShowSummary(false);
    }
  }, [userId]);

  // When /checkin form submitted successfully
  const handleCheckinSubmit = (apiResponse) => {
    console.log('Checkin submitted, moving to reset screen:', apiResponse);
    
    setCheckinData({
      user_id: apiResponse.user_id || localStorage.getItem('user_id'),
      stress_score: apiResponse.stress_score,
      energy_level: apiResponse.energy_level,
      time_available_mins: apiResponse.time_available_mins,
      stress_trigger: apiResponse.stress_trigger
    });
    
    setResetPlan({
      reset_plan_id: apiResponse.reset_plan_id,
      reset_title: apiResponse.reset_title,
      duration_mins: apiResponse.duration_mins,
      steps: apiResponse.steps,
      why_this_reset: apiResponse.why_this_reset,
      follow_up: apiResponse.follow_up
    });
    
    setCurrentScreen('reset');
  };

  const handleResetComplete = (actionData) => {
    console.log('Reset action:', actionData);
    
    if (actionData?.action === 'done' || actionData?.action === 'skip') {
      setCompletionStatus(actionData.action);
      setCurrentScreen('complete');
    }
  };

  const handleCompleteSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    setShowCohort(true);
    //setCurrentScreen('checkin');
    setResetPlan(null);
    setCheckinData(null);
    setCompletionStatus(null);
  };

  const handleCohortBack = () => {
    setShowCohort(false);
    setShowSummary(true);
  };
  
  const handleSummaryBack = () => {
    // Go back to Checkin (start a new cycle)
    setShowSummary(false);
    setShowCohort(true);
    setCurrentScreen('cohort');
    setResetPlan(null);
    setCheckinData(null);
    setCompletionStatus(null);
  };
    
  const handleLoginSuccess = (user_id) => {
    setUserId(user_id);
    // useEffect will handle resetting state
  };

  return (
    <>
      {!userId && (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      )}
      {userId && currentScreen === 'checkin' && (
        <CheckinForm onSubmit={handleCheckinSubmit} />
      )}
      {userId && currentScreen === 'reset' && resetPlan && (
        <ResetScreen 
          resetPlan={resetPlan} 
          checkinData={checkinData}
          onComplete={handleResetComplete} 
        />
      )}
      {userId && currentScreen === 'complete' && resetPlan && (
        <CompleteScreen 
          resetPlan={resetPlan}
          completionStatus={completionStatus}
          onComplete={handleCompleteSubmit}
        />
      )}
      {userId && showCohort && !showSummary && (
        <CohortScreen onNavigateBack={handleCohortBack} />
      )}
      {userId && showSummary && (
        <SummaryScreen onNavigateBack={handleSummaryBack} />
      )}
    </>
  );
}