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

// Test endpoint
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Backend is working!" });
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
