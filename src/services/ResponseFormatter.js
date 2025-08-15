/**
 * Response Formatter Service
 * Handles formatting and validation of LLM responses
 */

class ResponseFormatter {
    constructor() {
        this.isInitialized = false;
        this.responsePatterns = {
            greeting: /^(hello|hi|hey|good\s+(morning|afternoon|evening))/i,
            question: /\?$/,
            scheduling: /(schedule|calendar|meeting|appointment|event)/i,
            confirmation: /(yes|confirm|proceed|continue)/i,
            cancellation: /(no|cancel|stop|abort)/i
        };
    }

    /**
     * Initialize the response formatter
     */
    init() {
        this.isInitialized = true;
        console.log('Response Formatter initialized');
    }

    /**
     * Format LLM response for display
     * @param {string} rawResponse - Raw response from LLM
     * @returns {string} - Formatted response
     */
    formatResponse(rawResponse) {
        if (!this.isInitialized) {
            throw new Error('Response Formatter not initialized');
        }

        if (!rawResponse || typeof rawResponse !== 'string') {
            return 'I apologize, but I encountered an issue generating a response. Please try again.';
        }

        let formattedResponse = rawResponse.trim();

        // Clean up common LLM artifacts
        formattedResponse = this.cleanResponse(formattedResponse);

        // Apply formatting based on response type
        formattedResponse = this.applyResponseTypeFormatting(formattedResponse);

        // Ensure response doesn't exceed maximum length
        formattedResponse = this.truncateResponse(formattedResponse);

        return formattedResponse;
    }

    /**
     * Clean up common LLM response artifacts
     * @param {string} response - Raw response to clean
     * @returns {string} - Cleaned response
     */
    cleanResponse(response) {
        // Remove common prefixes that LLMs sometimes add
        let cleaned = response
            .replace(/^(Assistant:|AI:|Response:|Answer:)\s*/i, '')
            .replace(/^(I am an AI|As an AI|As a virtual assistant)[^.]*\.\s*/i, '')
            .trim();

        // Remove trailing patterns
        cleaned = cleaned.replace(/\s*\[END\]\s*$/i, '');

        // Clean up excessive whitespace
        cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
        cleaned = cleaned.replace(/\s+/g, ' ');

        // Ensure proper sentence ending
        if (cleaned && !cleaned.match(/[.!?]$/)) {
            cleaned += '.';
        }

        return cleaned;
    }

    /**
     * Apply formatting based on detected response type
     * @param {string} response - Response to format
     * @returns {string} - Formatted response
     */
    applyResponseTypeFormatting(response) {
        if (this.responsePatterns.greeting.test(response)) {
            return response.charAt(0).toUpperCase() + response.slice(1);
        }
        if (this.responsePatterns.question.test(response)) {
            return response.trim() + (response.endsWith('?') ? '' : '?');
        }
        return response;
    }

    /**
     * Truncate response if it exceeds maximum length
     * @param {string} response - Response to potentially truncate
     * @returns {string} - Truncated response if necessary
     */
    truncateResponse(response) {
        const maxLength = window.CONFIG?.UI?.MAX_MESSAGE_LENGTH || 2000;
        
        if (response.length <= maxLength) {
            return response;
        }

        // Find a good breaking point (end of sentence)
        const truncated = response.substring(0, maxLength - 20);
        const lastSentenceEnd = Math.max(
            truncated.lastIndexOf('.'),
            truncated.lastIndexOf('!'),
            truncated.lastIndexOf('?')
        );

        if (lastSentenceEnd > maxLength * 0.7) {
            return truncated.substring(0, lastSentenceEnd + 1);
        }

        return truncated + '...';
    }

    /**
     * Validate response quality
     * @param {string} response - Response to validate
     * @returns {boolean} - Whether response meets quality standards
     */
    validateResponse(response) {
        if (!response || typeof response !== 'string') {
            return false;
        }

        const trimmed = response.trim();

        // Check minimum length
        if (trimmed.length < 10) {
            return false;
        }

        // Check for obvious errors or inappropriate content
        const inappropriatePatterns = [
            /sorry.*can'?t.*help/i,
            /i don'?t know/i,
            /unable.*assist/i
        ];

        for (const pattern of inappropriatePatterns) {
            if (pattern.test(trimmed) && trimmed.length < 50) {
                return false;
            }
        }

        return true;
    }
}

export default ResponseFormatter;