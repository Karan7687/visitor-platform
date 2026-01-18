const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');

// Register user
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone, password, role = 'employee' } = req.body;

    // Validation
    if (!full_name || !email || !password) {
      return res.status(400).json({
        error: 'Full name, email, and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const query = `
      INSERT INTO users (full_name, email, phone, password_hash, role, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, full_name, email, role
    `;

    const values = [full_name, email, phone, hashedPassword, role];
    const result = await pool.query(query, values);

    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user
    const query = `
      SELECT id, full_name, email, password_hash, role, company_id 
      FROM users 
      WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Remove password from response
    delete user.password_hash;

    res.status(200).json({
      message: 'Login successful',
      user: user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
