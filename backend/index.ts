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
import reportsRoutes from "./routes/reports.route"



dotenv.config()
const app = express()

// Serve static files - moved before CORS to allow public access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Dynamic CORS - production-ready
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://165.22.151.170', // your server IP
  process.env.CLIENT_URL,   // optional: your domain, e.g., https://kasa.example.com
].filter(Boolean); // removes undefined if CLIENT_URL is not set

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject unauthorized origins
    console.warn(`[SECURITY] CORS rejected unauthorized origin: ${origin}`);
    return callback(new Error('CORS policy violation - unauthorized origin'));
  },
  credentials: true, // allow cookies and auth headers
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
app.use("/api/reports", reportsRoutes)

import uploadRoutes from "./routes/upload.route"

app.use("/api/upload", uploadRoutes)


const PORT = parseInt(process.env.PORT || '5000', 10)
const HOST = '0.0.0.0' // Bind to all network interfaces for Railway

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on port ${PORT}`)
  if (!process.env.JWT_SECRET) {
    console.error(" CRITICAL: JWT_SECRET is missing in environment variables!")
  } else {
    console.log(` JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`)
  }
})
