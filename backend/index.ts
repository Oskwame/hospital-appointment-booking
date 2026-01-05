import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import authRoutes from "./routes/auth.route";
import postsRoutes from "./routes/posts.route";
import servicesRoutes from "./routes/services.route";
import doctorsRoutes from "./routes/doctors.route";
import appointmentsRoutes from "./routes/appointments.route";
import reportsRoutes from "./routes/reports.route";
import uploadRoutes from "./routes/upload.route";

dotenv.config();
const app = express();

// ---------------------------
// Security Middleware
// ---------------------------
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// CORS Configuration
// ---------------------------
// Only allow your frontend domain (production) or localhost (dev)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CLIENT_URL, // e.g., "https://kfhappointment.up.railway.app"
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, mobile apps
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any Railway subdomain for preview deployments
      if (origin.endsWith(".up.railway.app")) return callback(null, true);
      console.warn(`[SECURITY] CORS rejected unauthorized origin: ${origin}`);
      return callback(new Error("CORS policy violation - unauthorized origin"));
    },
  })
);

// ---------------------------
// Body Parsing
// ---------------------------
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ---------------------------
// Health Check
// ---------------------------
app.get("/", (_req, res) => {
  const secretStatus = process.env.JWT_SECRET
    ? `Set (${process.env.JWT_SECRET.length} chars)`
    : "MISSING";
  res.send(`🚀 Backend is live! JWT_SECRET is: ${secretStatus}`);
});

// ---------------------------
// API Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/upload", uploadRoutes);

// ---------------------------
// Start Server
// ---------------------------
const PORT = parseInt(process.env.PORT || "5000", 10);
const HOST = "0.0.0.0"; // Required for Railway

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.error(
      "CRITICAL: JWT_SECRET is missing in environment variables!"
    );
  } else {
    console.log(`JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`);
  }
});
