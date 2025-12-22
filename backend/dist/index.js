"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentLimiter = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const posts_route_1 = __importDefault(require("./routes/posts.route"));
const services_route_1 = __importDefault(require("./routes/services.route"));
const doctors_route_1 = __importDefault(require("./routes/doctors.route"));
const appointments_route_1 = __importDefault(require("./routes/appointments.route"));
// import datesRoutes from "./routes/dates.route" // Disabled - AvailableDate model removed
const reports_route_1 = __importDefault(require("./routes/reports.route"));
// blog feature temporarily disabled
dotenv_1.default.config();
const app = (0, express_1.default)();
// Serve static files - moved before CORS to allow public access
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Dynamic CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.CLIENT_URL,
    'https://hospital-appointment-front-production.up.railway.app'
];
// CORS configuration with origin validation
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, Postman)
        if (!origin)
            return callback(null, true);
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
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, cookie_parser_1.default)());
// Request size limits to prevent large payload attacks
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Rate limiter for public appointment endpoint
const appointmentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 5 appointments per hour per IP
    message: { message: 'Too many appointment requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use forwarded IP for proxy/load balancer scenarios
        return req.headers['x-forwarded-for'] || req.ip || 'unknown';
    },
    handler: (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.ip;
        console.warn(`[SECURITY] Rate limit exceeded for appointments - IP: ${ip}`);
        res.status(429).json({
            message: 'Too many appointment requests from this IP. Please try again in 1 hour.'
        });
    }
});
exports.appointmentLimiter = appointmentLimiter;
app.get("/", (_req, res) => {
    const secretStatus = process.env.JWT_SECRET
        ? `Set (${process.env.JWT_SECRET.length} chars)`
        : "MISSING";
    res.send(`🚀 Backend is live! JWT_SECRET is: ${secretStatus}`);
});
app.use("/api/auth", auth_route_1.default);
app.use("/api/posts", posts_route_1.default);
app.use("/api/services", services_route_1.default);
app.use("/api/doctors", doctors_route_1.default);
app.use("/api/appointments", appointments_route_1.default);
// app.use("/api/dates", datesRoutes) // Disabled - AvailableDate model removed
app.use("/api/reports", reports_route_1.default);
const upload_route_1 = __importDefault(require("./routes/upload.route"));
app.use("/api/upload", upload_route_1.default);
// app.use("/api/blog", blogRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    if (!process.env.JWT_SECRET) {
        console.error(" CRITICAL: JWT_SECRET is missing in environment variables!");
    }
    else {
        console.log(` JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`);
    }
});
