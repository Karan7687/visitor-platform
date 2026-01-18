const express = require('express');
const router = express.Router();
const pool = require('../db');

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

    // ✅ Basic validation
    if (!full_name || !phone) {
      return res.status(400).json({
        error: 'Full name and phone are required',
      });
    }

    // ✅ HARD BLOCK: check duplicate phone OR email
    const duplicateCheckQuery = `
      SELECT id FROM visitors
      WHERE phone = $1
         OR (email IS NOT NULL AND email = $2)
      LIMIT 1
    `;

    const duplicateResult = await pool.query(duplicateCheckQuery, [
      phone,
      email,
    ]);

    if (duplicateResult.rows.length > 0) {
      return res.status(409).json({
        error: 'Visitor with this phone or email already exists',
      });
    }

    // ✅ CREATE NEW VISITOR ONLY (NO UPDATE ANYWHERE)
    const insertQuery = `
      INSERT INTO visitors (
        full_name,
        email,
        phone,
        organization,
        designation,
        city,
        country
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id, full_name, email, phone
    `;

    const insertValues = [
      full_name,
      email,
      phone,
      organization,
      designation,
      city,
      country,
    ];

    const result = await pool.query(insertQuery, insertValues);

    // ✅ Create visitor lead ONLY after successful creation
    await createVisitorLead(
      result.rows[0].id,
      employee_id,
      organization,
      designation,
      city,
      country,
      interests,
      notes
    );

    return res.status(201).json({
      message: 'Visitor created successfully',
      visitor: result.rows[0],
      action: 'created',
    });

  } catch (err) {
    console.error(err);

    // ✅ DB-level safety net (unique constraint)
    if (err.code === '23505') {
      return res.status(409).json({
        error: 'Duplicate phone or email not allowed',
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
    });
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
