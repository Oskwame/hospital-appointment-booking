"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const posts_route_1 = __importDefault(require("./routes/posts.route"));
const services_route_1 = __importDefault(require("./routes/services.route"));
const doctors_route_1 = __importDefault(require("./routes/doctors.route"));
const appointments_route_1 = __importDefault(require("./routes/appointments.route"));
const reports_route_1 = __importDefault(require("./routes/reports.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Serve static files - moved before CORS to allow public access
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// Dynamic CORS - production-ready
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://165.22.151.170', // your server IP
    process.env.CLIENT_URL, // optional: your domain, e.g., https://kasa.example.com
].filter(Boolean); // removes undefined if CLIENT_URL is not set
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g., Postman, mobile apps)
        if (!origin)
            return callback(null, true);
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
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use((0, cookie_parser_1.default)());
// Request size limits to prevent large payload attacks
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
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
app.use("/api/reports", reports_route_1.default);
const upload_route_1 = __importDefault(require("./routes/upload.route"));
app.use("/api/upload", upload_route_1.default);
const PORT = parseInt(process.env.PORT || '5000', 10);
const HOST = '0.0.0.0'; // Bind to all network interfaces for Railway
app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on port ${PORT}`);
    if (!process.env.JWT_SECRET) {
        console.error(" CRITICAL: JWT_SECRET is missing in environment variables!");
    }
    else {
        console.log(` JWT_SECRET loaded (${process.env.JWT_SECRET.length} chars)`);
    }
});
