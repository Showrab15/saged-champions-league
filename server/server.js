const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Import routes
const tournamentRoutes = require("./routes/tournament.routes");
const teamRoutes = require("./routes/team.routes");
const matchRoutes = require("./routes/match.routes");
const adminRoutes = require("./routes/admin.routes");

// Database connection
const connectDB = require("./config/db");
connectDB();

console.log("🚀 Mounting routes...");

// Routes
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/admin", adminRoutes);

console.log("✅ Routes mounted");

// Health check
app.get("/", (req, res) => {
  res.json({ message: "SAGED Champions League API is running" });
});

// 404 handler - add this to debug
app.use((req, res, next) => {
  console.log(`❌ 404: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`🎯 SAGED Champions League API running on port ${port}`);
});
