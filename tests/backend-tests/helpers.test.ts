import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import {
    stripHtml,
    extractEmail,
    extractName,
    getFileExtension,
    isValidFileType,
    truncate,
    parseDate,
    getPaginationMeta,
} from '../../src/utils/helpers';

describe('helpers', () => {
    describe('stripHtml', () => {
        it('removes HTML tags', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            expect(stripHtml(html)).toBe('Hello World');
        });

        it('handles empty string', () => {
            expect(stripHtml('')).toBe('');
        });

        it('removes script tags with content', () => {
            const html = '<div>Hello<script>alert("xss")</script>World</div>';
            expect(stripHtml(html)).toContain('Hello');
            expect(stripHtml(html)).toContain('World');
            expect(stripHtml(html)).not.toContain('script');
        });

        it('converts block elements to newlines', () => {
            const html = '<div>Line1</div><div>Line2</div>';
            const result = stripHtml(html);
            expect(result).toContain('Line1');
            expect(result).toContain('Line2');
        });
    });

    describe('extractEmail', () => {
        it('extracts email from angle brackets', () => {
            expect(extractEmail('John Doe <john@example.com>')).toBe('john@example.com');
        });

        it('extracts plain email', () => {
            expect(extractEmail('john@example.com')).toBe('john@example.com');
        });

        it('handles empty string', () => {
            expect(extractEmail('')).toBe('');
        });
    });

    describe('extractName', () => {
        it('extracts name before angle brackets', () => {
            expect(extractName('John Doe <john@example.com>')).toBe('John Doe');
        });

        it('generates name from email when no name', () => {
            expect(extractName('john.doe@example.com')).toBe('John Doe');
        });

        it('handles empty string', () => {
            expect(extractName('')).toBe('');
        });
    });

    describe('getFileExtension', () => {
        it('returns file extension', () => {
            expect(getFileExtension('test.eml')).toBe('.eml');
            expect(getFileExtension('email.msg')).toBe('.msg');
        });

        it('handles uppercase extensions', () => {
            expect(getFileExtension('TEST.EML')).toBe('.eml');
        });
    });

    describe('isValidFileType', () => {
        it('validates allowed file types', () => {
            expect(isValidFileType('test.eml', ['.eml', '.msg'])).toBe(true);
            expect(isValidFileType('test.msg', ['.eml', '.msg'])).toBe(true);
        });

        it('rejects invalid file types', () => {
            expect(isValidFileType('test.txt', ['.eml', '.msg'])).toBe(false);
            expect(isValidFileType('test.pdf', ['.eml', '.msg'])).toBe(false);
        });
    });

    describe('truncate', () => {
        it('truncates long strings', () => {
            const result = truncate('This is a very long string', 15);
            expect(result).toBe('This is a ve...');
            expect(result.length).toBe(15);
        });

        it('returns original if shorter than max', () => {
            expect(truncate('Short', 100)).toBe('Short');
        });
    });

    describe('parseDate', () => {
        it('parses ISO string', () => {
            const date = parseDate('2024-12-06T10:00:00Z');
            expect(date).toBeInstanceOf(Date);
        });

        it('returns Date object unchanged', () => {
            const original = new Date();
            expect(parseDate(original)).toBe(original);
        });

        it('returns current date for undefined', () => {
            const result = parseDate(undefined);
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe('getPaginationMeta', () => {
        it('calculates pagination correctly', () => {
            const meta = getPaginationMeta(1, 20, 100);
            expect(meta.page).toBe(1);
            expect(meta.limit).toBe(20);
            expect(meta.total).toBe(100);
            expect(meta.totalPages).toBe(5);
            expect(meta.hasNextPage).toBe(true);
            expect(meta.hasPrevPage).toBe(false);
        });

        it('handles last page', () => {
            const meta = getPaginationMeta(5, 20, 100);
            expect(meta.hasNextPage).toBe(false);
            expect(meta.hasPrevPage).toBe(true);
        });
    });
});
