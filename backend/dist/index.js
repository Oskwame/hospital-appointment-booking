"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const posts_route_1 = __importDefault(require("./routes/posts.route"));
const services_route_1 = __importDefault(require("./routes/services.route"));
const doctors_route_1 = __importDefault(require("./routes/doctors.route"));
const appointments_route_1 = __importDefault(require("./routes/appointments.route"));
const dates_route_1 = __importDefault(require("./routes/dates.route"));
// blog feature temporarily disabled
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: ["http://localhost:3000", "http://localhost:3001"], credentials: true }));
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
app.use("/api/dates", dates_route_1.default);
// app.use("/api/blog", blogRoutes)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
