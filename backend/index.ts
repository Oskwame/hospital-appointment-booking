import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";

// Import routes
import authRoutes from "./routes/auth.route";
import postsRoutes from "./routes/posts.route";
import servicesRoutes from "./routes/services.route";
import doctorsRoutes from "./routes/doctors.route";
import appointmentsRoutes from "./routes/appointments.route";
import reportsRoutes from "./routes/reports.route";
import uploadRoutes from "./routes/upload.route";

// Load environment variables
dotenv.config();

const app = express();

// --------------------
// Middleware
// --------------------

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// Parse cookies
app.use(cookieParser());

// Parse JSON and URL-encoded payloads
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --------------------
// CORS configuration
// --------------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL // Railway frontend domain
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman, mobile apps
    if (allowedOrigins.includes(origin) || origin.endsWith('.up.railway.app')) {
      return callback(null, true);
    }
    console.warn(`[SECURITY] CORS blocked for: ${origin}`);
    return callback(new Error('CORS policy violation - unauthorized origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  optionsSuccessStatus: 200
}));

// Handle preflight globally
app.options('*', cors());

// --------------------
// Routes
// --------------------
app.get("/", (_req, res) => {
  const secretStatus = process.env.JWT_SECRET
    ? `Set (${process.env.JWT_SECRET.length} chars)`
    : "MISSING";
  res.send(`🚀 Backend is live! JWT_SECRET is: ${secretStatus}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/upload", uploadRoutes);

// --------------------
// Server start
// --------------------
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0'; // bind to all network interfaces on Railway

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT}`);
  if (!process.env.JWT_SECRET) {
    console.error("❌ CRITICAL: JWT_SECRET is missing!");
  } else {
    console.log(`🔑 JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`);
  }
});
