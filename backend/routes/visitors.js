const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get phone number suggestions
router.get('/phone-suggestions/:query', async (req, res) => {
  try {
    const { query } = req.params;

    console.log('Getting phone suggestions for:', query);

    if (!query || query.length < 1) {
      return res.status(400).json({
        error: 'Query must be at least 1 character',
      });
    }

    // Try database query
    try {
      const searchQuery = `
        SELECT phone, full_name 
        FROM visitors 
        WHERE phone ILIKE $1
        ORDER BY 
          CASE 
            WHEN phone = $2 THEN 1
            WHEN phone LIKE $3 THEN 2
            ELSE 3
          END,
          phone
        LIMIT 10
      `;

      const result = await pool.query(searchQuery, [
        `${query}%`,  // Starts with query
        query,        // Exact match
        `${query}%`   // Starts with query again for ordering
      ]);

      console.log('Database query result:', result.rows);

      const suggestions = result.rows.map(row => `${row.phone}(${row.full_name || 'Unknown'})`);

      console.log('Formatted suggestions:', suggestions);

      res.status(200).json({
        suggestions: suggestions,
        count: suggestions.length,
        query: query
      });
    } catch (dbError) {
      console.log('Database error:', dbError);
      res.status(500).json({
        error: 'Database error',
        suggestions: []
      });
    }
  } catch (err) {
    console.error('Phone suggestions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced check-phone endpoint to also test date storage
router.get('/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { test_date } = req.query; // Allow passing date for testing

    console.log('Checking phone:', phone);
    console.log('🔍 Full query parameters:', req.query);
    console.log('🔍 Raw test_date:', test_date);
    console.log('🔍 test_date type:', typeof test_date);
    
    if (test_date) {
      console.log('🧪 TEST DATE FROM QUERY:', test_date);
      console.log('🧪 TEST DATE TYPE:', typeof test_date);
    } else {
      console.log('❌ test_date is undefined or missing');
    }

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required',
      });
    }

    // For testing, return mock data
    if (phone === '1234567890') {
      return res.status(200).json({
        visitor: {
          id: 'test-id',
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          organization: 'Test Company',
          designation: 'Test Manager',
          city: 'Test City',
          country: 'Test Country'
        },
        exists: true,
        test_date_received: test_date || null
      });
    }

    // Try database query if not test phone
    try {
      const query = `
        SELECT id, full_name, email, phone, organization, designation, city, country
        FROM visitors 
        WHERE phone = $1
      `;

      const result = await pool.query(query, [phone]);

      if (result.rows.length > 0) {
        res.status(200).json({
          visitor: result.rows[0],
          exists: true,
          test_date_received: test_date || null
        });
      } else {
        res.status(200).json({
          visitor: null,
          exists: false,
          test_date_received: test_date || null
        });
      }
    } catch (dbError) {
      console.log('Database error:', dbError);
      // Return not found if database fails
      res.status(200).json({
        visitor: null,
        exists: false,
        test_date_received: test_date || null
      });
    }
  } catch (err) {
    console.error('Check phone error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint for follow-up date
router.post('/test-date', async (req, res) => {
  try {
    const { follow_up_date } = req.body;
    
    console.log('🧪 TEST DATE ENDPOINT');
    console.log('Follow-up date received:', follow_up_date);
    console.log('Follow-up date type:', typeof follow_up_date);
    
    // Simple test response
    res.status(200).json({
      message: 'Test endpoint received date',
      follow_up_date: follow_up_date,
      type: typeof follow_up_date,
      success: true
    });
    
  } catch (err) {
    console.error('Test date endpoint error:', err);
    res.status(500).json({ error: 'Test endpoint failed' });
  }
});

router.post('/', async (req, res) => {
  console.log('🚀 POST /api/visitors endpoint HIT!');
  console.log('🚀 Request method:', req.method);
  console.log('🚀 Request headers:', req.headers);
  
  try {
    const {
      full_name,
      email,
      phone,
      organization,
      designation,
      city,
      country,
      interests,
      notes,
      follow_up_date,
      employee_id,
    } = req.body;

    console.log('Request body received:', req.body);
    console.log('Follow-up date received:', follow_up_date);
    console.log('Follow-up date type:', typeof follow_up_date);
    
    // Store the date exactly as received, no conversion
    const finalFollowUpDate = follow_up_date || null; // Only use null if actually undefined/null
    
    console.log('🎯 FINAL DATE TO STORE:', finalFollowUpDate);

    // Check if visitor already exists
    const existingVisitorQuery = `
      SELECT id FROM visitors WHERE phone = $1
    `;
    const existingVisitor = await pool.query(existingVisitorQuery, [phone]);

    let visitorId;
    if (existingVisitor.rows.length > 0) {
      // Update existing visitor
      visitorId = existingVisitor.rows[0].id;
      const updateVisitorQuery = `
        UPDATE visitors 
        SET full_name = COALESCE($1, full_name),
            email = COALESCE($2, email),
            organization = COALESCE($3, organization),
            designation = COALESCE($4, designation),
            city = COALESCE($5, city),
            country = COALESCE($6, country),
            updated_at = NOW()
        WHERE id = $7
      `;
      await pool.query(updateVisitorQuery, [
        full_name,
        email,
        organization,
        designation,
        city,
        country,
        visitorId
      ]);
    } else {
      // Create new visitor
      const insertVisitorQuery = `
        INSERT INTO visitors (full_name, email, phone, organization, designation, city, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const newVisitor = await pool.query(insertVisitorQuery, [
        full_name,
        email,
        phone,
        organization,
        designation,
        city,
        country
      ]);
      visitorId = newVisitor.rows[0].id;
    }

    // Get employee's company_id
    const employeeQuery = `
      SELECT company_id FROM users WHERE id = $1
    `;
    const employeeResult = await pool.query(employeeQuery, [employee_id]);
    const companyId = employeeResult.rows[0]?.company_id;

    // Create visitor lead
    const insertLeadQuery = `
      INSERT INTO visitor_leads (company_id, visitor_id, employee_id, organization, designation, city, country, interests, notes, follow_up_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `;
    
    const leadParams = [
      companyId,
      visitorId,
      employee_id,
      organization,
      designation,
      city,
      country,
      interests,
      notes,
      finalFollowUpDate
    ];
    
    console.log('Lead query parameters:', leadParams);
    console.log('Final follow-up date being inserted:', finalFollowUpDate);
    console.log('Follow-up date parameter type:', typeof finalFollowUpDate);
    console.log('Follow-up date parameter length:', finalFollowUpDate ? finalFollowUpDate.length : 'N/A');
    
    try {
      const result = await pool.query(insertLeadQuery, leadParams);
      console.log('✅ Lead insertion successful. Inserted ID:', result.rows[0].id);
      console.log('✅ All lead parameters stored successfully');
    } catch (dbError) {
      console.error('❌ Database insertion error:', dbError);
      console.error('❌ Error details:', dbError.message);
      throw dbError;
    }

    res.status(201).json({
      message: 'Visitor registered successfully',
      visitor_id: visitorId,
    });

  } catch (err) {
    console.error('Visitor registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ================= HELPER =================

async function createVisitorLead(
  visitor_id,
  employee_id,
  organization,
  designation,
  city,
  country,
  interests,
  notes
) {
  try {
    // Get company_id from employee
    const employeeResult = await pool.query(
      'SELECT company_id FROM users WHERE id = $1',
      [employee_id]
    );

    const company_id = employeeResult.rows[0]?.company_id;

    const leadQuery = `
      INSERT INTO visitor_leads (
        company_id,
        visitor_id,
        employee_id,
        organization,
        designation,
        city,
        country,
        interests,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `;

    const leadValues = [
      company_id,
      visitor_id,
      employee_id,
      organization,
      designation,
      city,
      country,
      interests,
      notes,
    ];

    await pool.query(leadQuery, leadValues);
  } catch (err) {
    console.error('Error creating visitor lead:', err);
    // Visitor creation must not fail because of lead failure
  }
}

module.exports = router;
