/**
 * auth.js
 * 
 * Authentication endpoint for /api/auth
 * 
 * WHAT: Identify users (create if new, retrieve if existing)
 * 
 * HOW:
 * 1. POST { email, name }
 * 2. Check: Does user with this email exist?
 * 3. If YES: Return user_id (= email)
 * 4. If NO: Create user in AirTable, return user_id
 * 5. Frontend saves user_id to localStorage
 * 
 * NOTE: No password. Trust-based identification.
 * Post-capstone: Add OAuth if needed.
 */

import Airtable from 'airtable';

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID);
const usersTable = base('Users');

export default async function authHandler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name } = req.body;

  try {
    console.log('Auth request:', { email, name });

    // VALIDATE INPUT
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name required' });
    }

    // QUERY: Find user by email
    const records = await usersTable
      .select({
        filterByFormula: `{email_id} = '${email}'`
      })
      .firstPage();

    if (records.length > 0) {
      // USER EXISTS: Return existing user
      const user = records[0];
      console.log('User exists:', user.fields.email);

      return res.status(200).json({
        success: true,
        user_id: user.fields.email_id,
        email: user.fields.email_id,
        name: user.fields.user_name,
        is_new: false
      });
    }

    // USER DOESN'T EXIST: Create new user
    console.log('Creating new user:', email);

    const newRecord = await usersTable.create([
      {
        fields: {
          user_id: email,
          email_id: email,
          user_name: name,
          cohort_id: 'active-bhidus',  // Default cohort
          created_at: new Date().toISOString().split('T')[0]
        }
      }
    ]);

    const createdUser = newRecord[0];
    console.log('User created:', createdUser.fields.email_id);

    return res.status(201).json({
      success: true,
      user_id: createdUser.fields.email_id,
      email: createdUser.fields.email_id,
      name: createdUser.fields.user_name,
      is_new: true
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({
      error: err.message,
      success: false
    });
  }
}