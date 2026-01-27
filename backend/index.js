const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const visitorRoutes = require('./routes/visitors');
app.use('/api/visitors', visitorRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).send(`
╔══════════════════════════════════════════════════════════════╗
║                    VISITOR PLATFORM API                      ║
╠══════════════════════════════════════════════════════════════╣
║  🚀 Welcome to Visitor Platform Backend API                  ║
║  📋 Version: 1.0.0                                           ║
║  ✅ Status: Active                                           ║
║                                                              ║
║  📚 Available Endpoints:                                     ║
║     • /health - Health check                                ║
║     • /api/users - User management                          ║
║     • /api/visitors - Visitor registration                  ║
║     • /companies - Company information                      ║
║                                                              ║
║  📖 Full API Documentation: See API_DOCUMENTATION.md        ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Backend is working!" });
});

// Check companies endpoint
app.get("/companies", async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, company_code, status FROM companies');
    res.status(200).json({ companies: result.rows });
  } catch (err) {
    console.error('Error fetching companies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create test company endpoint
app.post("/create-test-company", async (req, res) => {
  try {
    const result = await pool.query(`
      INSERT INTO companies (name, contact_email, contact_phone, company_code, status)
      VALUES ('Test Company', 'test@company.com', '1234567890', 'TEST123', 'active')
      RETURNING id, name, company_code, status
    `);
    res.status(201).json({ company: result.rows[0] });
  } catch (err) {
    console.error('Error creating test company:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Connectivity test endpoint
app.get("/ping", (req, res) => {
  res.status(200).json({ 
    message: "Pong! Backend is accessible from mobile app",
    timestamp: new Date().toISOString()
  });
});

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Backend accessible at: http://10.0.2.2:${PORT}`);
});
