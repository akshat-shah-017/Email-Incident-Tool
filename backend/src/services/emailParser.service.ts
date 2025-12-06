import fs from 'fs/promises';
import MsgReader from '@kenjiuno/msgreader';
import { ParsedEmail, EmailParseResult } from '../models/types';
import {
    stripHtml,
    extractEmail,
    extractName,
    getFileExtension,
    parseDate
} from '../utils/helpers';
import { logger, FileProcessingError } from '../utils';
import config from '../config';

/**
 * Email Parsing Service
 * Handles parsing of .eml and .msg email files
 */
export class EmailParserService {
    /**
     * Parse an email file (supports .eml and .msg formats)
     */
    async parseEmailFile(filePath: string): Promise<EmailParseResult> {
        const ext = getFileExtension(filePath);

        try {
            let parsed: ParsedEmail;

            if (ext === '.eml') {
                parsed = await this.parseEmlFile(filePath);
            } else if (ext === '.msg') {
                parsed = await this.parseMsgFile(filePath);
            } else {
                throw new FileProcessingError(`Unsupported file type: ${ext}`);
            }

            logger.info(`Successfully parsed email: ${parsed.subject}`);

            return {
                success: true,
                email: parsed,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown parsing error';
            logger.error(`Failed to parse email file: ${message}`, { filePath });

            return {
                success: false,
                error: message,
            };
        }
    }

    /**
     * Parse email from buffer (supports .eml and .msg formats)
     */
    async parseEmailBuffer(
        buffer: Buffer,
        filename: string
    ): Promise<EmailParseResult> {
        const ext = getFileExtension(filename);

        try {
            let parsed: ParsedEmail;

            if (ext === '.eml') {
                parsed = await this.parseEmlBuffer(buffer);
            } else if (ext === '.msg') {
                parsed = await this.parseMsgBuffer(buffer);
            } else {
                throw new FileProcessingError(`Unsupported file type: ${ext}`);
            }

            logger.info(`Successfully parsed email: ${parsed.subject}`);

            return {
                success: true,
                email: parsed,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown parsing error';
            logger.error(`Failed to parse email buffer: ${message}`, { filename });

            return {
                success: false,
                error: message,
            };
        }
    }

    /**
     * Parse .eml file
     */
    private async parseEmlFile(filePath: string): Promise<ParsedEmail> {
        const buffer = await fs.readFile(filePath);
        return this.parseEmlBuffer(buffer);
    }

    /**
     * Parse .eml buffer
     */
    private async parseEmlBuffer(buffer: Buffer): Promise<ParsedEmail> {
        try {
            // eml-parser requires creating an instance with the buffer, then calling parseEml()
            const EmlParser = require('eml-parser');
            const emlParser = new EmlParser(buffer);
            const result = await emlParser.parseEml();

            // Handle from field
            let fromString = '';
            let fromEmail = '';
            let fromName = '';

            if (result.from && result.from.value && result.from.value.length > 0) {
                const from = result.from.value[0];
                fromEmail = from.address || '';
                fromName = from.name || '';
                fromString = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
            }

            const parsed: ParsedEmail = {
                subject: result.subject || 'No Subject',
                senderName: fromName || extractName(fromString),
                senderEmail: fromEmail || extractEmail(fromString),
                receivedAt: parseDate(result.date),
                bodyText: result.text || stripHtml(result.html || ''),
                bodyHtml: result.html || null,
                rawContent: buffer.toString('utf-8'),
            };

            return parsed;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new FileProcessingError(`EML parsing failed: ${message}`);
        }
    }

    /**
     * Parse .msg file
     */
    private async parseMsgFile(filePath: string): Promise<ParsedEmail> {
        const buffer = await fs.readFile(filePath);
        return this.parseMsgBuffer(buffer);
    }

    /**
     * Parse .msg buffer
     */
    private async parseMsgBuffer(buffer: Buffer): Promise<ParsedEmail> {
        try {
            const msgReader = new MsgReader(buffer.buffer as ArrayBuffer);
            const fileData = msgReader.getFileData();

            // Extract sender information
            const senderEmail = fileData.senderEmail || fileData.senderSmtpAddress || '';
            const senderName = fileData.senderName || extractName(senderEmail);

            // Get email body (prefer text, fall back to HTML)
            let bodyText = fileData.body || '';
            if (!bodyText && fileData.bodyHtml) {
                bodyText = stripHtml(fileData.bodyHtml);
            }

            const parsed: ParsedEmail = {
                subject: fileData.subject || 'No Subject',
                senderName: senderName || null,
                senderEmail: senderEmail,
                receivedAt: parseDate(fileData.messageDeliveryTime || fileData.creationTime),
                bodyText: bodyText,
                bodyHtml: fileData.bodyHtml || null,
                rawContent: undefined, // MSG files are binary
            };

            return parsed;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new FileProcessingError(`MSG parsing failed: ${message}`);
        }
    }

    /**
     * Validate file type
     */
    isValidFileType(filename: string): boolean {
        const ext = getFileExtension(filename);
        return config.allowedFileTypes.includes(ext);
    }

    /**
     * Get supported file types
     */
    getSupportedTypes(): string[] {
        return config.allowedFileTypes;
    }
}

// Export singleton instance
export const emailParserService = new EmailParserService();
