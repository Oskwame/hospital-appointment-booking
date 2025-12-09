"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
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
// Security Middleware
app.use((0, helmet_1.default)());
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Dynamic CORS
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.send("🚀 Backend is live!");
});
app.use("/api/auth", auth_route_1.default);
app.use("/api/posts", posts_route_1.default);
app.use("/api/services", services_route_1.default);
app.use("/api/doctors", doctors_route_1.default);
app.use("/api/appointments", appointments_route_1.default);
// app.use("/api/dates", datesRoutes) // Disabled - AvailableDate model removed
app.use("/api/reports", reports_route_1.default);
// app.use("/api/blog", blogRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
