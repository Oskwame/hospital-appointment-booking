import express from "express"
import path from "path"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"

import authRoutes from "./routes/auth.route"
import postsRoutes from "./routes/posts.route"
import servicesRoutes from "./routes/services.route"
import doctorsRoutes from "./routes/doctors.route"
import appointmentsRoutes from "./routes/appointments.route"
// import datesRoutes from "./routes/dates.route" // Disabled - AvailableDate model removed
import reportsRoutes from "./routes/reports.route"
// blog feature temporarily disabled


dotenv.config()
const app = express()

// Serve static files - moved before CORS to allow public access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Dynamic CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
  'https://hospital-appointment-front-production.up.railway.app'
];

// CORS configuration with origin validation
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log and reject unauthorized origin
    console.warn(`[SECURITY] CORS rejected unauthorized origin: ${origin}`);
    return callback(new Error('CORS policy violation - unauthorized origin'));
  },
  credentials: true
}));

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }))


app.use(cookieParser())

// Request size limits to prevent large payload attacks
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))


app.get("/", (_req, res) => {
  const secretStatus = process.env.JWT_SECRET
    ? `Set (${process.env.JWT_SECRET.length} chars)`
    : "MISSING";
  res.send(`🚀 Backend is live! JWT_SECRET is: ${secretStatus}`)
})

app.use("/api/auth", authRoutes)
app.use("/api/posts", postsRoutes)
app.use("/api/services", servicesRoutes)
app.use("/api/doctors", doctorsRoutes)
app.use("/api/appointments", appointmentsRoutes)
// app.use("/api/dates", datesRoutes) // Disabled - AvailableDate model removed
app.use("/api/reports", reportsRoutes)

import uploadRoutes from "./routes/upload.route"

app.use("/api/upload", uploadRoutes)
// app.use("/api/blog", blogRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
  if (!process.env.JWT_SECRET) {
    console.error(" CRITICAL: JWT_SECRET is missing in environment variables!")
  } else {
    console.log(` JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`)
  }
})
