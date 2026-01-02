import rateLimit, { Options } from 'express-rate-limit'

// Rate limiter for public appointment endpoint
export const appointmentLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 appointments per hour per IP
    message: { message: 'Too many appointment requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default keyGenerator which properly handles IPv6 addresses
    // If behind a proxy, ensure 'trust proxy' is set in Express
    handler: (req, res) => {
        const ip = req.headers['x-forwarded-for'] || req.ip
        console.warn(`[SECURITY] Rate limit exceeded for appointments - IP: ${ip}`)
        res.status(429).json({
            message: 'Too many appointment requests from this IP. Please try again in 1 hour.'
        })
    }
})
