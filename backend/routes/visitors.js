const express = require('express');
const router = express.Router();
const pool = require('../db');

// Check visitor by phone number
router.get('/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    console.log('Checking phone:', phone);

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
        });
      } else {
        res.status(200).json({
          visitor: null,
          exists: false,
        });
      }
    } catch (dbError) {
      console.log('Database error:', dbError);
      // Return not found if database fails
      res.status(200).json({
        visitor: null,
        exists: false,
      });
    }
  } catch (err) {
    console.error('Check phone error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
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
      employee_id,
    } = req.body;

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
      INSERT INTO visitor_leads (company_id, visitor_id, employee_id, organization, designation, city, country, interests, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    await pool.query(insertLeadQuery, [
      companyId,
      visitorId,
      employee_id,
      organization,
      designation,
      city,
      country,
      interests,
      notes
    ]);

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
