"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEmail = isValidEmail;
exports.isValidPhone = isValidPhone;
exports.isValidId = isValidId;
exports.isFutureDate = isFutureDate;
exports.isValidSession = isValidSession;
const validator_1 = __importDefault(require("validator"));
/**
 * Validates email format using industry-standard validation
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    return validator_1.default.isEmail(email);
}
/**
 * Validates phone number format (basic validation)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    // Basic phone validation: 10-15 digits, optional + prefix, spaces, dashes, parentheses
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
    return phoneRegex.test(phone);
}
/**
 * Validates if a string is a valid integer ID
 * @param id - ID to validate
 * @returns true if valid integer, false otherwise
 */
function isValidId(id) {
    const numId = Number(id);
    return Number.isInteger(numId) && numId > 0;
}
/**
 * Validates if a date string represents a future date
 * @param dateString - ISO date string
 * @returns true if date is in the future, false otherwise
 */
function isFutureDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        return date.getTime() > now.getTime();
    }
    catch {
        return false;
    }
}
/**
 * Validates session type
 * @param session - Session string
 * @returns true if valid session, false otherwise
 */
function isValidSession(session) {
    const validSessions = ['morning', 'afternoon', 'evening'];
    return validSessions.includes(session.toLowerCase());
}
