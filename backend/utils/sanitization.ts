import DOMPurify from 'isomorphic-dompurify'

// isomorphic-dompurify automatically handles Node.js environment
const purify = DOMPurify

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - Untrusted HTML string
 * @param allowedTags - Optional array of allowed HTML tags
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
    if (!dirty || typeof dirty !== 'string') {
        return ''
    }

    const config: any = {
        ALLOWED_TAGS: allowedTags || [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div'
        ],
        ALLOWED_ATTR: ['href', 'title', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
        RETURN_TRUSTED_TYPE: false
    }

    return String(purify.sanitize(dirty, config))
}

/**
 * Sanitizes plain text by removing all HTML tags
 * @param dirty - Untrusted text that may contain HTML
 * @returns Plain text with all HTML removed
 */
export function sanitizeText(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return ''
    }

    // Remove all HTML tags
    return String(purify.sanitize(dirty, { ALLOWED_TAGS: [], RETURN_TRUSTED_TYPE: false }))
}

/**
 * Sanitizes blog post content (allows more HTML for rich text)
 * @param dirty - Untrusted blog content
 * @returns Sanitized HTML suitable for blog posts
 */
export function sanitizeBlogContent(dirty: string): string {
    if (!dirty || typeof dirty !== 'string') {
        return ''
    }

    const config: any = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'span', 'div',
            'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody'
        ],
        ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'src', 'alt', 'width', 'height'],
        ALLOW_DATA_ATTR: false,
        RETURN_TRUSTED_TYPE: false
    }

    return String(purify.sanitize(dirty, config))
}
