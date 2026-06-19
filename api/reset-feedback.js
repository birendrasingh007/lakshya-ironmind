/**
 * reset-feedback.js
 * 
 * POST /api/reset-feedback endpoint
 * 
 * WHAT: Save user feedback after they complete a reset
 * 
 * HOW:
 * 1. Receive: user_id, reset_plan_id, completion_status, was_helpful
 * 2. Fetch reset_title from ResetPlans (to store in ResetLogs)
 * 3. Insert into AirTable ResetLogs table
 * 4. Return success
 */

import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);
const resetLogsTable = base('ResetLogs');
const resetPlansTable = base('ResetPlans');

export default async function resetFeedbackHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, reset_plan_id, completion_status, was_helpful } = req.body;

  try {
    console.log('Reset feedback:', { user_id, reset_plan_id, completion_status, was_helpful });

    // VALIDATE INPUT
    if (!user_id || !reset_plan_id || !completion_status || !was_helpful) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, reset_plan_id, completion_status, was_helpful' 
      });
    }

    // ← ADD THIS: Generate unique reset_log_id
    const reset_log_id = `rl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // FETCH reset_title from ResetPlans
    let reset_title = 'Unknown Reset';
    try {
      const resetPlanRecord = await resetPlansTable.find(reset_plan_id);
      reset_title = resetPlanRecord.fields.reset_title || 'Unknown Reset';
      console.log('Fetched reset_title from ResetPlans:', reset_title);
    } catch (err) {
      console.warn('Could not fetch reset_title, using default:', err.message);
    }

    // INSERT INTO AIRTABLE
    const newRecord = await resetLogsTable.create([
      {
        fields: {
          reset_log_id: reset_log_id,
          user_id,
          reset_plan_id: reset_plan_id,
          log_date: new Date().toISOString().split('T')[0],
          completion_status,                // "done" or "skip"
          was_helpful,                      // "yes", "no", "not_sure"
          created_at: new Date().toISOString().split('T')[0]
        }
      }
    ]);

    const createdLog = newRecord[0];
    console.log('ResetLog created:', createdLog.id);

    return res.status(201).json({
      success: true,
      reset_log_id: createdLog.id,
      message: 'Feedback saved successfully'
    });
  } catch (err) {
    console.error('Reset feedback error:', err);
    return res.status(500).json({
      error: err.message,
      success: false
    });
  }
}