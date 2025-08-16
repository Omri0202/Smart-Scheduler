/**
 * Message Processor Service
 * Handles message processing logic and coordination between components
 */

import LLMClient from './LLMClient.js';
import PromptTemplates from '../utils/PromptTemplates.js';
import ResponseFormatter from './ResponseFormatter.js';

class MessageProcessor {
    constructor() {
        this.llmClient = new LLMClient();
        this.promptTemplates = new PromptTemplates();
        this.responseFormatter = new ResponseFormatter();
        this.isInitialized = false;
    }

    /**
     * Initialize the message processor
     */
    async init() {
        try {
            await this.llmClient.init();
            this.promptTemplates.init();
            this.responseFormatter.init();
            this.isInitialized = true;

            if (window.utils && window.utils.logger) {
                window.utils.logger.log('Message Processor initialized');
            } else {
                console.log('Message Processor initialized');
            }
        } catch (error) {
            console.error('Failed to initialize Message Processor:', error);
            throw error;
        }
    }

    /**
     * Process user input and generate a response
     * @param {string} input - User input message
     * @param {Object} context - Additional context (calendar data, user preferences, etc.)
     * @returns {Promise<string>} - Formatted response
     */
    async processInput(input, context = {}) {
        if (!this.isInitialized) {
            throw new Error('Message Processor not initialized');
        }

        try {
            // Validate input
            const validatedInput = this.validateInput(input);
            if (!validatedInput) {
                throw new Error('Invalid input message');
            }

            // Add user message to conversation history
            this.promptTemplates.addToHistory('user', validatedInput);

            // Get real user and calendar context
            const enrichedContext = await this.enrichContext(context);
            console.log('Final enriched context for LLM:', enrichedContext);

            // Prepare the prompt with context and history
            const messages = this.promptTemplates.preparePrompt(validatedInput, enrichedContext);

            // Call LLM API
            const rawResponse = await this.llmClient.callAPI(messages);

            // Format the response (now async to handle calendar actions)
            const formattedResponse = await this.responseFormatter.formatResponse(rawResponse);

            // Add assistant response to history
            this.promptTemplates.addToHistory('assistant', formattedResponse);

            return formattedResponse;

        } catch (error) {
            if (window.utils && window.utils.logger) {
                window.utils.logger.error('Error processing input:', error);
            } else {
                console.error('Error processing input:', error);
            }
            throw error;
        }
    }

    /**
     * Enrich context with real user and calendar data
     * @param {Object} baseContext - Base context provided
     * @returns {Promise<Object>} - Enriched context
     */
    async enrichContext(baseContext = {}) {
        const enrichedContext = { ...baseContext };

        try {
            // Get user profile from auth
            if (window.auth && window.auth.isAuthenticated()) {
                const userProfile = window.auth.getUserProfile();
                if (userProfile && userProfile.name !== 'Unknown User') {
                    enrichedContext.userProfile = userProfile;
                }
            }

            // Get upcoming calendar events if calendar API is available
            if (window.calendarAPI && window.auth && window.auth.isAuthenticated()) {
                try {
                    const now = new Date();
                    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    
                    const eventsResponse = await window.calendarAPI.getEvents(now, nextWeek, 10);
                    console.log('Calendar API response:', eventsResponse);
                    if (eventsResponse && eventsResponse.items) {
                        enrichedContext.calendarEvents = eventsResponse.items.map(event => ({
                            summary: event.summary || 'Untitled Event',
                            start: event.start?.dateTime || event.start?.date,
                            end: event.end?.dateTime || event.end?.date,
                            id: event.id
                        }));
                        console.log('Mapped calendar events for LLM context:', enrichedContext.calendarEvents);
                    } else {
                        console.log('No calendar events found in response');
                    }
                } catch (calendarError) {
                    console.warn('Could not fetch calendar events:', calendarError);
                    // Don't fail the whole request if calendar fetch fails
                }
            }

            // Add current time and timezone
            enrichedContext.currentTime = new Date().toLocaleString();
            enrichedContext.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        } catch (error) {
            console.warn('Error enriching context:', error);
            // Return base context if enrichment fails
        }

        return enrichedContext;
    }

    /**
     * Validate user input
     * @param {string} input - User input to validate
     * @returns {string|null} - Validated input or null if invalid
     */
    validateInput(input) {
        if (typeof input !== 'string') {
            return null;
        }

        const trimmed = input.trim();
        
        // Check minimum length
        if (trimmed.length < 1) {
            return null;
        }

        // Check maximum length (prevent abuse)
        const maxLength = window.CONFIG?.UI?.MAX_MESSAGE_LENGTH || 2000;
        if (trimmed.length > maxLength) {
            return trimmed.substring(0, maxLength);
        }

        return trimmed;
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.promptTemplates.getHistory();
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.promptTemplates.clearHistory();
    }

    /**
     * Check if processor is ready
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get processor status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            historyLength: this.promptTemplates.getHistoryLength(),
            lastProcessed: this.promptTemplates.getLastProcessed()
        };
    }
}

export default MessageProcessor;