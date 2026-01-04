"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appointmentLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiter for public appointment endpoint
exports.appointmentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 appointments per hour per IP
    message: { message: 'Too many appointment requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default keyGenerator which properly handles IPv6 addresses
    // If behind a proxy, ensure 'trust proxy' is set in Express
    handler: (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.ip;
        console.warn(`[SECURITY] Rate limit exceeded for appointments - IP: ${ip}`);
        res.status(429).json({
            message: 'Too many appointment requests from this IP. Please try again in 1 hour.'
        });
    }
});
