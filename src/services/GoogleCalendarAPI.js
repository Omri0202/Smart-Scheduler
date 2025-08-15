/**
 * Google Calendar API Service
 * Handles direct interactions with Google Calendar API
 */

import EventManager from './EventManager.js';

class GoogleCalendarAPI {
    constructor() {
        this.calendarId = 'primary';
        this.eventManager = new EventManager();
        this.isInitialized = false;
    }

    /**
     * Initialize Google Calendar API service
     */
    init() {
        this.eventManager.init();
        this.isInitialized = true;
        
        if (window.utils && window.utils.logger) {
            window.utils.logger.log('Google Calendar API service initialized');
        } else {
            console.log('Google Calendar API service initialized');
        }
    }

    /**
     * Create a new calendar event
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} - Created event
     */
    async createEvent(eventData) {
        this.checkAuthentication();

        try {
            // Validate and format event
            const validation = this.eventManager.validateEvent(eventData);
            if (!validation.isValid) {
                throw new Error(`Invalid event data: ${validation.errors.join(', ')}`);
            }

            const formattedEvent = this.eventManager.formatEventForAPI(eventData);

            // Create event via API
            const response = await gapi.client.calendar.events.insert({
                calendarId: this.calendarId,
                resource: formattedEvent
            });

            if (window.utils && window.utils.logger) {
                window.utils.logger.log('Event created:', response.result);
            }

            return response.result;

        } catch (error) {
            if (window.utils && window.utils.logger) {
                window.utils.logger.error('Error creating calendar event:', error);
            }
            throw this.handleAPIError(error);
        }
    }

    /**
     * Get calendar events
     * @param {Date} timeMin - Start time
     * @param {Date} timeMax - End time
     * @param {number} maxResults - Maximum results
     * @returns {Promise<Object>} - Events list
     */
    async getEvents(timeMin, timeMax, maxResults = 250) {
        this.checkAuthentication();

        try {
            const response = await gapi.client.calendar.events.list({
                calendarId: this.calendarId,
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                maxResults: maxResults,
                singleEvents: true,
                orderBy: 'startTime'
            });

            return response.result;

        } catch (error) {
            if (window.utils && window.utils.logger) {
                window.utils.logger.error('Error fetching calendar events:', error);
            }
            throw this.handleAPIError(error);
        }
    }

    /**
     * Update an existing calendar event
     * @param {string} eventId - Event ID
     * @param {Object} eventData - Updated event data
     * @returns {Promise<Object>} - Updated event
     */
    async updateEvent(eventId, eventData) {
        this.checkAuthentication();

        try {
            // Validate event data
            const validation = this.eventManager.validateEvent(eventData);
            if (!validation.isValid) {
                throw new Error(`Invalid event data: ${validation.errors.join(', ')}`);
            }

            // Format for API
            const formattedEvent = this.eventManager.formatEventForAPI(eventData);

            const response = await gapi.client.calendar.events.update({
                calendarId: this.calendarId,
                eventId: eventId,
                resource: formattedEvent
            });

            return response.result;

        } catch (error) {
            if (window.utils && window.utils.logger) {
                window.utils.logger.error('Error updating calendar event:', error);
            }
            throw this.handleAPIError(error);
        }
    }

    /**
     * Delete a calendar event
     * @param {string} eventId - Event ID
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        this.checkAuthentication();

        try {
            await gapi.client.calendar.events.delete({
                calendarId: this.calendarId,
                eventId: eventId
            });

        } catch (error) {
            if (window.utils && window.utils.logger) {
                window.utils.logger.error('Error deleting calendar event:', error);
            }
            throw this.handleAPIError(error);
        }
    }

    /**
     * Parse natural language and create event
     * @param {string} naturalLanguage - Natural language description
     * @returns {Promise<Object>} - Created event
     */
    async createEventFromNaturalLanguage(naturalLanguage) {
        const eventData = this.eventManager.parseNaturalLanguage(naturalLanguage);
        return await this.createEvent(eventData);
    }

    /**
     * Check if user is authenticated
     * @throws {Error} - If user not authenticated
     */
    checkAuthentication() {
        if (!window.auth || !window.auth.isAuthenticated()) {
            throw new Error('User not authenticated. Please sign in to Google.');
        }
    }

    /**
     * Handle API errors and provide user-friendly messages
     * @param {Error} error - API error
     * @returns {Error} - Formatted error
     */
    handleAPIError(error) {
        const messages = {
            401: 'Authentication expired. Please sign in again.',
            403: 'Access denied. Please check your calendar permissions.',
            404: 'Calendar or event not found.'
        };
        
        if (messages[error.status]) return new Error(messages[error.status]);
        if (error.status >= 500) return new Error('Google Calendar service temporarily unavailable.');
        return new Error(error.message || 'Failed to perform calendar operation.');
    }

    /**
     * Get current calendar information
     * @returns {Promise<Object>} - Calendar info
     */
    async getCalendarInfo() {
        this.checkAuthentication();

        try {
            const response = await gapi.client.calendar.calendars.get({
                calendarId: this.calendarId
            });

            return response.result;

        } catch (error) {
            throw this.handleAPIError(error);
        }
    }
}

export default GoogleCalendarAPI;