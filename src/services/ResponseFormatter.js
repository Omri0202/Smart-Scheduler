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
    async formatResponse(rawResponse) {
        if (!this.isInitialized) {
            throw new Error('Response Formatter not initialized');
        }

        if (!rawResponse || typeof rawResponse !== 'string') {
            return 'I apologize, but I encountered an issue generating a response. Please try again.';
        }

        let formattedResponse = rawResponse.trim();

        // Process calendar actions first
        formattedResponse = await this.processCalendarActions(formattedResponse);

        // Clean up common LLM artifacts
        formattedResponse = this.cleanResponse(formattedResponse);

        // Apply formatting based on response type
        formattedResponse = this.applyResponseTypeFormatting(formattedResponse);

        // Ensure response doesn't exceed maximum length
        formattedResponse = this.truncateResponse(formattedResponse);

        return formattedResponse;
    }

    /**
     * Process calendar actions in the response
     * @param {string} response - Response that may contain calendar actions
     * @returns {Promise<string>} - Response with calendar actions processed
     */
    async processCalendarActions(response) {
        const createEventPattern = /\[CREATE_EVENT\]([\s\S]*?)\[\/CREATE_EVENT\]/g;
        const updateEventPattern = /\[UPDATE_EVENT:([^\]]+)\]([\s\S]*?)\[\/UPDATE_EVENT\]/g;

        let processedResponse = response;
        
        // Process CREATE_EVENT actions
        const createMatches = [...response.matchAll(createEventPattern)];
        for (const match of createMatches) {
            const eventData = this.parseEventData(match[1]);
            const result = await this.createCalendarEvent(eventData);
            processedResponse = processedResponse.replace(match[0], result);
        }

        // Process UPDATE_EVENT actions
        const updateMatches = [...response.matchAll(updateEventPattern)];
        for (const match of updateMatches) {
            const eventId = match[1];
            const updateData = this.parseEventData(match[2]);
            const result = await this.updateCalendarEvent(eventId, updateData);
            processedResponse = processedResponse.replace(match[0], result);
        }

        return processedResponse;
    }

    /**
     * Parse event data from calendar action text
     * @param {string} eventText - Text containing event data
     * @returns {Object} - Parsed event data
     */
    parseEventData(eventText) {
        const lines = eventText.trim().split('\n');
        const eventData = {};

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(':')) {
                const [key, ...valueParts] = trimmedLine.split(':');
                const value = valueParts.join(':').trim();
                
                switch (key.toLowerCase().trim()) {
                    case 'title':
                        eventData.summary = value;
                        break;
                    case 'date':
                        eventData.date = value;
                        break;
                    case 'start':
                        eventData.startTime = value;
                        break;
                    case 'end':
                        eventData.endTime = value;
                        break;
                    case 'location':
                        eventData.location = value;
                        break;
                    case 'description':
                        eventData.description = value;
                        break;
                    case 'attendees':
                        eventData.attendees = value.split(',').map(email => email.trim());
                        break;
                }
            }
        }

        return eventData;
    }

    /**
     * Create a calendar event using the calendar API
     * @param {Object} eventData - Event data to create
     * @returns {Promise<string>} - Result message
     */
    async createCalendarEvent(eventData) {
        try {
            if (!window.calendarAPI || !window.auth?.isAuthenticated()) {
                return "⚠️ Calendar access not available. Please ensure you're signed in with Google Calendar access.";
            }

            // Format the event data for the API
            const formattedEvent = {
                summary: eventData.summary,
                start: this.formatDateTime(eventData.date, eventData.startTime),
                end: this.formatDateTime(eventData.date, eventData.endTime),
                location: eventData.location || '',
                description: eventData.description || '',
                attendees: eventData.attendees || []
            };

            console.log('Creating calendar event:', formattedEvent);
            const createdEvent = await window.calendarAPI.createEvent(formattedEvent);
            
            return `✅ Successfully created: "${eventData.summary}" on ${eventData.date} from ${eventData.startTime} to ${eventData.endTime}`;
        } catch (error) {
            console.error('Failed to create calendar event:', error);
            return `❌ Failed to create calendar event: ${error.message}`;
        }
    }

    /**
     * Update a calendar event
     * @param {string} eventId - Event ID to update
     * @param {Object} updateData - Data to update
     * @returns {Promise<string>} - Result message
     */
    async updateCalendarEvent(eventId, updateData) {
        try {
            if (!window.calendarAPI || !window.auth?.isAuthenticated()) {
                return "⚠️ Calendar access not available. Please ensure you're signed in with Google Calendar access.";
            }

            console.log('Updating calendar event:', eventId, updateData);
            const updatedEvent = await window.calendarAPI.updateEvent(eventId, updateData);
            
            return `✅ Successfully updated the event.`;
        } catch (error) {
            console.error('Failed to update calendar event:', error);
            return `❌ Failed to update calendar event: ${error.message}`;
        }
    }

    /**
     * Format date and time for calendar API
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @returns {string} - ISO datetime string
     */
    formatDateTime(date, time) {
        if (!date || !time) return new Date().toISOString();
        
        const dateTime = new Date(`${date}T${time}:00`);
        return dateTime.toISOString();
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