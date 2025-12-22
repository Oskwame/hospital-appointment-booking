import validator from 'validator'

/**
 * Validates email format using industry-standard validation
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
        return false
    }
    return validator.isEmail(email)
}

/**
 * Validates phone number format (basic validation)
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
    if (!phone || typeof phone !== 'string') {
        return false
    }
    // Basic phone validation: 10-15 digits, optional + prefix, spaces, dashes, parentheses
    const phoneRegex = /^\+?[\d\s\-()]{10,15}$/
    return phoneRegex.test(phone)
}

/**
 * Validates if a string is a valid integer ID
 * @param id - ID to validate
 * @returns true if valid integer, false otherwise
 */
export function isValidId(id: any): boolean {
    const numId = Number(id)
    return Number.isInteger(numId) && numId > 0
}

/**
 * Validates if a date string represents a future date
 * @param dateString - ISO date string
 * @returns true if date is in the future, false otherwise
 */
export function isFutureDate(dateString: string): boolean {
    try {
        const date = new Date(dateString)
        const now = new Date()
        return date.getTime() > now.getTime()
    } catch {
        return false
    }
}

/**
 * Validates session type
 * @param session - Session string
 * @returns true if valid session, false otherwise
 */
export function isValidSession(session: string): boolean {
    const validSessions = ['morning', 'afternoon', 'evening']
    return validSessions.includes(session.toLowerCase())
}
