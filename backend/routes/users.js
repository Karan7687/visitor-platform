const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db');

// Register new user
router.post('/register', async (req, res) => {
  try {
    console.log('=== USER REGISTRATION DEBUG ===');
    console.log('Request body:', req.body);
    
    const { full_name, email, phone, password, company_code, role = 'employee' } = req.body;
    
    console.log('Extracted company_code:', company_code);

    // Validate required fields
    if (!full_name || !email || !password || !company_code) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Full name, email, password, and company code are required' });
    }

    // Check if user already exists
    const existingUserQuery = `
      SELECT id FROM users WHERE email = $1
    `;
    const existingUser = await pool.query(existingUserQuery, [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate company code and get company ID
    console.log('Validating company code:', company_code);
    const companyQuery = `
      SELECT id, name FROM companies WHERE company_code = $1 AND status = 'active'
    `;
    const companyResult = await pool.query(companyQuery, [company_code]);
    console.log('Company query result:', companyResult.rows);

    if (companyResult.rows.length === 0) {
      console.log('Company code validation failed - no matching company found');
      return res.status(400).json({ error: 'Invalid company code' });
    }

    const company_id = companyResult.rows[0].id;
    const company_name = companyResult.rows[0].name;
    console.log('Company validation passed - Company ID:', company_id, 'Company Name:', company_name);

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user with company_id
    const insertUserQuery = `
      INSERT INTO users (full_name, email, phone, password_hash, role, company_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, full_name, email, phone, role, is_active, company_id, created_at
    `;
    const newUser = await pool.query(insertUserQuery, [
      full_name,
      email,
      phone || null,
      password_hash,
      role,
      company_id
    ]);

    const user = newUser.rows[0];
    console.log('User created successfully with company_id:', user.company_id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        company_id: user.company_id,
        company_name: company_name,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const userQuery = `
      SELECT id, full_name, email, phone, password_hash, role, is_active, company_id, created_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `;
    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data (without password hash)
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        is_active: user.is_active,
        company_id: user.company_id,
        created_at: user.created_at
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const userQuery = `
      SELECT id, full_name, email, phone, role, is_active, company_id, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      user: userResult.rows[0]
    });

  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
