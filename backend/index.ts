import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

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

// Security Middleware
app.use(helmet())

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Dynamic CORS
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"]
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL)
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.get("/", (_req, res) => {
  res.send("🚀 Backend is live!")
})

app.use("/api/auth", authRoutes)
app.use("/api/posts", postsRoutes)
app.use("/api/services", servicesRoutes)
app.use("/api/doctors", doctorsRoutes)
app.use("/api/appointments", appointmentsRoutes)
// app.use("/api/dates", datesRoutes) // Disabled - AvailableDate model removed
app.use("/api/reports", reportsRoutes)
// app.use("/api/blog", blogRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
