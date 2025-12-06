import path from 'path';
import fs from 'fs/promises';

/**
 * Strip HTML tags from a string and clean up whitespace
 */
export function stripHtml(html: string): string {
    if (!html) return '';

    return html
        // Remove script and style tags with content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // Replace common block elements with newlines
        .replace(/<\/(div|p|br|li|tr|h[1-6])>/gi, '\n')
        .replace(/<(br|hr)\s*\/?>/gi, '\n')
        // Remove all remaining HTML tags
        .replace(/<[^>]+>/g, '')
        // Decode common HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // Clean up whitespace
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
}

/**
 * Extract email address from various formats
 */
export function extractEmail(emailString: string): string {
    if (!emailString) return '';

    // Match email in angle brackets: "Name <email@example.com>"
    const angleMatch = emailString.match(/<([^>]+)>/);
    if (angleMatch) return angleMatch[1].trim();

    // Match plain email format
    const emailMatch = emailString.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) return emailMatch[0];

    return emailString.trim();
}

/**
 * Extract name from email string
 */
export function extractName(emailString: string): string {
    if (!emailString) return '';

    // Extract name before angle brackets: "Name <email@example.com>"
    const angleMatch = emailString.match(/^([^<]+)</);
    if (angleMatch) return angleMatch[1].trim().replace(/["']/g, '');

    // If no angle brackets, try to extract from email
    const email = extractEmail(emailString);
    if (email) {
        const localPart = email.split('@')[0];
        return localPart
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    return emailString.trim();
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    return ext;
}

/**
 * Validate file type
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
    const ext = getFileExtension(filename);
    return allowedTypes.includes(ext);
}

/**
 * Ensure directory exists
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
        // Directory already exists
    }
}

/**
 * Delete file safely
 */
export async function deleteFile(filePath: string): Promise<void> {
    try {
        await fs.unlink(filePath);
    } catch (error) {
        // File doesn't exist or already deleted
    }
}

/**
 * Truncate string to maximum length
 */
export function truncate(str: string, maxLength: number): string {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
}

/**
 * Parse date from various formats
 */
export function parseDate(dateString: string | Date | undefined): Date {
    if (!dateString) return new Date();
    if (dateString instanceof Date) return dateString;

    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Generate pagination metadata
 */
export function getPaginationMeta(
    page: number,
    limit: number,
    total: number
) {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
