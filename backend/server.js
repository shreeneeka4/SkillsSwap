require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const usersRouter = require("./routes/users");
const skillsRouter = require("./routes/skills");
const requestsRouter = require("./routes/requests");

const app = express();

// --- Middleware ---
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");
app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "skillswap-backend" });
});
app.get("/", (req, res) => {
  res.json({
    message: "SkillSwap API is running",
    status: "success"
  });
});
// --- Routes ---
app.use("/api/users", usersRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/requests", requestsRouter);

// --- 404 handler ---
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// --- Central error handler (catches anything thrown synchronously) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Something went wrong" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`SkillSwap API running on http://localhost:${PORT}`);
  });
});
