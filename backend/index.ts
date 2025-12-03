import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.route"
import postsRoutes from "./routes/posts.route"
import servicesRoutes from "./routes/services.route"
import doctorsRoutes from "./routes/doctors.route"
import appointmentsRoutes from "./routes/appointments.route"
import datesRoutes from "./routes/dates.route"
import reportsRoutes from "./routes/reports.route"
// blog feature temporarily disabled


dotenv.config()
const app = express()

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }))
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
app.use("/api/dates", datesRoutes)
app.use("/api/reports", reportsRoutes)
// app.use("/api/blog", blogRoutes)


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})
