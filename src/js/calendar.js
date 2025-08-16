/**
 * Calendar Module (Refactored)
 * Main entry point for calendar functionality - delegates to modular services
 */

import GoogleCalendarAPI from '../services/GoogleCalendarAPI.js';

class CalendarService {
    constructor() {
        this.googleCalendarAPI = new GoogleCalendarAPI();
        this.isInitialized = false;
    }

    /**
     * Initialize calendar service
     */
    init() {
        this.googleCalendarAPI.init();
        this.isInitialized = true;
        
        if (window.utils && window.utils.logger) {
            window.utils.logger.log('Calendar service initialized');
        } else {
            console.log('Calendar service initialized');
        }
    }

    /**
     * Create a new calendar event
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} - Created event
     */
    async createEvent(eventData) {
        return await this.googleCalendarAPI.createEvent(eventData);
    }

    /**
     * Get calendar events
     * @param {Date} timeMin - Start time
     * @param {Date} timeMax - End time
     * @returns {Promise<Object>} - Events list
     */
    async getEvents(timeMin, timeMax) {
        return await this.googleCalendarAPI.getEvents(timeMin, timeMax);
    }

    /**
     * Update an existing event
     * @param {string} eventId - Event ID
     * @param {Object} eventData - Updated event data
     * @returns {Promise<Object>} - Updated event
     */
    async updateEvent(eventId, eventData) {
        return await this.googleCalendarAPI.updateEvent(eventId, eventData);
    }

    /**
     * Delete a calendar event
     * @param {string} eventId - Event ID
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        return await this.googleCalendarAPI.deleteEvent(eventId);
    }

    /**
     * Create event from natural language
     * @param {string} naturalLanguage - Natural language description
     * @returns {Promise<Object>} - Created event
     */
    async createEventFromNaturalLanguage(naturalLanguage) {
        return await this.googleCalendarAPI.createEventFromNaturalLanguage(naturalLanguage);
    }
}

// Create singleton instance
const calendarService = new CalendarService();

// Legacy compatibility object
const calendar = {
    // Legacy properties
    calendarId: 'primary',

    // Initialize calendar
    init() {
        calendarService.init();
    },

    // Create event
    async createEvent(eventData) {
        return await calendarService.createEvent(eventData);
    },

    // Get events
    async getEvents(timeMin, timeMax) {
        return await calendarService.getEvents(timeMin, timeMax);
    },

    // Update event
    async updateEvent(eventId, eventData) {
        return await calendarService.updateEvent(eventId, eventData);
    },

    // Delete event
    async deleteEvent(eventId) {
        return await calendarService.deleteEvent(eventId);
    },

    // Create from natural language
    async createEventFromNaturalLanguage(naturalLanguage) {
        return await calendarService.createEventFromNaturalLanguage(naturalLanguage);
    },

    // Get service instance (for advanced usage)
    getService() {
        return calendarService;
    }
};

// Make calendar available globally for backward compatibility
window.calendar = calendar;
window.calendarAPI = calendarService; // For MessageProcessor integration

export { CalendarService };
export default calendar;