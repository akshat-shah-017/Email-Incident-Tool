import config from '../config';
import { SummarizationRequest, SummarizationResponse } from '../models/types';
import { logger, AIServiceError } from '../utils';

/**
 * AI Summarization Service
 * Handles AI-based email summarization using OpenRouter and Gemini APIs
 */
export class AISummarizationService {
    private readonly systemPrompt = `You are an expert email summarizer. Your task is to provide a concise, professional summary of the email content provided.

Guidelines:
- Keep the summary to 3-6 lines maximum
- Capture the main purpose of the email
- Identify key actions or requests
- Note any important dates, deadlines, or details
- Use professional, clear language
- Do not include greetings or sign-offs in the summary

Respond with ONLY the summary, no additional text or formatting.`;

    /**
     * Generate a summary of the email content
     * Tries OpenRouter first, falls back to Gemini
     */
    async summarize(request: SummarizationRequest): Promise<SummarizationResponse> {
        const { content, maxLength = 500 } = request;

        if (!content || content.trim().length === 0) {
            return {
                success: false,
                error: 'No content provided for summarization',
            };
        }

        // Try OpenRouter first
        if (config.openRouter.apiKey) {
            try {
                const result = await this.summarizeWithOpenRouter(content, maxLength);
                if (result.success) {
                    return result;
                }
                logger.warn('OpenRouter summarization failed, trying Gemini fallback');
            } catch (error) {
                logger.warn('OpenRouter error, trying Gemini fallback:', error);
            }
        }

        // Fallback to Gemini
        if (config.gemini.apiKey) {
            try {
                return await this.summarizeWithGemini(content, maxLength);
            } catch (error) {
                logger.error('Gemini summarization failed:', error);
            }
        }

        // Both services failed
        return {
            success: false,
            error: 'Summary unavailable — AI service error.',
        };
    }

    /**
     * Summarize using OpenRouter API
     */
    private async summarizeWithOpenRouter(
        content: string,
        maxLength: number
    ): Promise<SummarizationResponse> {
        const url = `${config.openRouter.baseUrl}/chat/completions`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.openRouter.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://email-incident-tool.local',
                'X-Title': 'Email Incident Tool',
            },
            body: JSON.stringify({
                model: config.openRouter.model,
                messages: [
                    { role: 'system', content: this.systemPrompt },
                    { role: 'user', content: `Please summarize this email:\n\n${content}` },
                ],
                max_tokens: maxLength,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new AIServiceError(`OpenRouter API error: ${response.status} ${errorText}`, 'OpenRouter');
        }

        const data = await response.json() as {
            choices?: Array<{
                message?: {
                    content?: string;
                };
            }>;
        };

        const summary = data?.choices?.[0]?.message?.content?.trim();

        if (!summary) {
            throw new AIServiceError('OpenRouter returned empty response', 'OpenRouter');
        }

        logger.info('Successfully generated summary via OpenRouter');

        return {
            success: true,
            summary,
            provider: 'openrouter',
        };
    }

    /**
     * Summarize using Google Gemini API
     */
    private async summarizeWithGemini(
        content: string,
        maxLength: number
    ): Promise<SummarizationResponse> {
        const url = `${config.gemini.baseUrl}/models/${config.gemini.model}:generateContent?key=${config.gemini.apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `${this.systemPrompt}\n\nEmail to summarize:\n\n${content}` },
                        ],
                    },
                ],
                generationConfig: {
                    maxOutputTokens: maxLength,
                    temperature: 0.3,
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new AIServiceError(`Gemini API error: ${response.status} ${errorText}`, 'Gemini');
        }

        const data = await response.json() as {
            candidates?: Array<{
                content?: {
                    parts?: Array<{
                        text?: string;
                    }>;
                };
            }>;
        };

        const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!summary) {
            throw new AIServiceError('Gemini returned empty response', 'Gemini');
        }

        logger.info('Successfully generated summary via Gemini');

        return {
            success: true,
            summary,
            provider: 'gemini',
        };
    }

    /**
     * Check if AI services are available
     */
    isAvailable(): boolean {
        return !!(config.openRouter.apiKey || config.gemini.apiKey);
    }

    /**
     * Get available AI providers
     */
    getAvailableProviders(): string[] {
        const providers: string[] = [];
        if (config.openRouter.apiKey) providers.push('openrouter');
        if (config.gemini.apiKey) providers.push('gemini');
        return providers;
    }
}

// Export singleton instance
export const aiSummarizationService = new AISummarizationService();
