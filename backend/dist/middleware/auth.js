"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function auth(req, res, next) {
    const header = req.headers.authorization || "";
    const bearer = header.startsWith("Bearer ") ? header.slice(7) : null;
    const cookieToken = req.cookies?.token || null;
    const token = bearer || cookieToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    }
    catch {
        return res.status(401).json({ message: "Unauthorized" });
    }
}
