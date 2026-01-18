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

    // Basic validation
    if (!full_name || !phone) {
      return res.status(400).json({
        error: 'Full name and phone are required',
      });
    }

    // Check if visitor already exists by phone
    const existingVisitor = await pool.query(
      'SELECT id FROM visitors WHERE phone = $1',
      [phone]
    );

    let result;
    
    if (existingVisitor.rows.length > 0) {
      // Update existing visitor
      const updateQuery = `
        UPDATE visitors SET
          full_name = COALESCE($1, full_name),
          email = COALESCE($2, email),
          organization = COALESCE($3, organization),
          designation = COALESCE($4, designation),
          city = COALESCE($5, city),
          country = COALESCE($6, country),
          updated_at = NOW()
        WHERE phone = $7
        RETURNING id, full_name, email, phone
      `;

      const updateValues = [
        full_name,
        email,
        organization,
        designation,
        city,
        country,
        phone
      ];

      result = await pool.query(updateQuery, updateValues);
      
      // Create visitor lead
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
      
      res.status(200).json({
        message: 'Visitor profile updated successfully',
        visitor: result.rows[0],
        action: 'updated'
      });
    } else {
      // Create new visitor
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
        country
      ];

      result = await pool.query(insertQuery, insertValues);

      // Create visitor lead
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

      res.status(201).json({
        message: 'Visitor created successfully',
        visitor: result.rows[0],
        action: 'created'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to create visitor lead
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
      notes
    ];

    await pool.query(leadQuery, leadValues);
  } catch (err) {
    console.error('Error creating visitor lead:', err);
    // Don't throw error here as visitor creation is more important
  }
}

module.exports = router;
