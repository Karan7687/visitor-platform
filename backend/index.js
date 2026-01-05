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


// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
