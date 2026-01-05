const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const {
      company_id,
      full_name,
      email,
      phone,
      organization,
      designation,
      city,
      country,
      interests,
      consent_flag,
    } = req.body;

    // Basic validation (PRD-aligned)
    if (!company_id || !full_name || consent_flag !== true) {
      return res.status(400).json({
        error: 'company_id, full_name and consent_flag are required',
      });
    }

    const query = `
      INSERT INTO visitors (
        company_id,
        full_name,
        email,
        phone,
        organization,
        designation,
        city,
        country,
        interests,
        consent_flag
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
    `;

    const values = [
      company_id,
      full_name,
      email,
      phone,
      organization,
      designation,
      city,
      country,
      interests,
      consent_flag,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'Visitor created successfully',
      visitor_id: result.rows[0].id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
