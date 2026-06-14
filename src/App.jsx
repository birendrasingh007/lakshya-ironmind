import React, { useState } from 'react';
import './index.css';
import CheckinForm from './screens/Checkin';
import ResetScreen from './screens/Reset';
import CompleteScreen from './screens/Complete';
import CohortScreen from './screens/Cohort';
import SummaryScreen from './screens/Summary';


/**
 * App Component (Main Screen Router)
 * 
 * WHAT: Manages navigation between /checkin and /reset screens
 * 
 * WHY: Single source of truth for:
 * - Which screen to show (checkin vs reset)
 * - Reset plan data (passes to /reset)
 * - Navigation between screens
 * 
 * HOW:
 * 1. State: currentScreen ('checkin' or 'reset'), resetPlan (data from API)
 * 2. User submits /checkin form
 * 3. handleCheckinSubmit stores reset data + switches to /reset screen
 * 4. User clicks button on /reset
 * 5. handleResetComplete handles action (Done/Skip/Regenerate)
 * 6. Navigate accordingly (back to checkin or to complete screen TODO)
 */

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('checkin');
  const [resetPlan, setResetPlan] = useState(null);
  const [checkinData, setCheckinData] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null); // "done" or "skipped"
  const [showCohort, setShowCohort] = useState(false);  
  const [showSummary, setShowSummary] = useState(false);


  // When /checkin form submitted successfully
  const handleCheckinSubmit = (apiResponse) => {
    console.log('Checkin submitted, moving to reset screen:', apiResponse);
    
    setCheckinData({
      user_id: apiResponse.user_id || 'birendra-001',
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
      setCompletionStatus(actionData.action); // Store action type
      setCurrentScreen('complete'); // Navigate to complete screen
    }
  };

  const handleCompleteSubmit = (feedbackData) => {
    console.log('Feedback submitted:', feedbackData);
    // Navigate to /cohort instead of /checkin
    setShowCohort(true);

    // Reset everything, go back to checkin
    setCurrentScreen('checkin');
    setResetPlan(null);
    setCheckinData(null);
    setCompletionStatus(null);
  };

  const handleCohortBack = () => {
    // Instead of going back to checkin, show options:
    // For now, just go back to checkin
    setShowCohort(false);
    setShowSummary(true);
    setCurrentScreen('checkin');
    setResetPlan(null);
    setCheckinData(null);
    setCompletionStatus(null);
  };
  
  const handleSummaryBack = () => {
    setShowSummary(false);
    setShowCohort(true);
  };
  
  return (
    <>
      {!showCohort && !showSummary && currentScreen === 'checkin' && (
        <CheckinForm onSubmit={handleCheckinSubmit} />
      )}
      {!showCohort && !showSummary && currentScreen === 'reset' && resetPlan && (
        <ResetScreen 
          resetPlan={resetPlan} 
          checkinData={checkinData}
          onComplete={handleResetComplete} 
        />
      )}
      {!showCohort && !showSummary && currentScreen === 'complete' && resetPlan && (
        <CompleteScreen 
          resetPlan={resetPlan}
          completionStatus={completionStatus}
          onComplete={handleCompleteSubmit}
        />
      )}
      {showCohort && !showSummary && (
        <CohortScreen onNavigateBack={handleCohortBack} />
      )}
      {showSummary && (
        <SummaryScreen onNavigateBack={handleSummaryBack} />
      )}
    </>
  );

}