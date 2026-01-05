const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection verified");
  } catch (err) {
    console.error("Database connection failed", err);
  }
})();

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
