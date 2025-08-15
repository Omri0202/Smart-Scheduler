/**
 * Event Manager Service
 * Handles event validation, formatting, and business logic
 */

import DateTimeUtils from '../utils/DateTimeUtils.js';

class EventManager {
    constructor() {
        this.dateTimeUtils = new DateTimeUtils();
        this.maxTitleLength = 100;
        this.maxDescriptionLength = 5000;
    }

    /**
     * Initialize Event Manager
     */
    init() {
        this.maxTitleLength = window.CONFIG?.UI?.MAX_EVENT_TITLE_LENGTH || 100;
        this.maxDescriptionLength = window.CONFIG?.UI?.MAX_EVENT_DESCRIPTION_LENGTH || 5000;
        console.log('Event Manager initialized');
    }

    /**
     * Validate event data
     * @param {Object} eventData - Event data to validate
     * @returns {Object} - Validation result
     */
    validateEvent(eventData) {
        const errors = [];
        const { summary, start, end, attendees, description, location } = eventData;

        // Required fields
        if (!summary || summary.trim().length === 0) {
            errors.push('Event title is required');
        }

        if (!start) {
            errors.push('Start time is required');
        }

        if (!end) {
            errors.push('End time is required');
        }

        // Validate dates
        if (start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);

            if (isNaN(startDate.getTime())) errors.push('Invalid start date');
            if (isNaN(endDate.getTime())) errors.push('Invalid end date');
            if (startDate >= endDate) errors.push('End time must be after start time');
            if (startDate < new Date()) errors.push('Cannot schedule events in the past');
        }

        // Validate lengths
        if (summary && summary.length > this.maxTitleLength) {
            errors.push(`Title too long (max ${this.maxTitleLength} characters)`);
        }

        if (description && description.length > this.maxDescriptionLength) {
            errors.push(`Description too long (max ${this.maxDescriptionLength} characters)`);
        }

        // Validate attendees
        if (attendees && Array.isArray(attendees)) {
            const invalidEmails = attendees.filter(email => !this.isValidEmail(email));
            if (invalidEmails.length) errors.push(`Invalid emails: ${invalidEmails.join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Format event data for Google Calendar API
     * @param {Object} eventData - Raw event data
     * @returns {Object} - Formatted event data
     */
    formatEventForAPI(eventData) {
        const { summary, start, end, attendees = [], description = '', location = '' } = eventData;

        // Format attendees
        const attendeeList = Array.isArray(attendees) 
            ? attendees.map(email => ({ email: email.trim() }))
            : [];

        return {
            summary: summary.substring(0, this.maxTitleLength).trim(),
            description: description.substring(0, this.maxDescriptionLength).trim(),
            location: location.trim(),
            start: this.dateTimeUtils.formatDateTime(start),
            end: this.dateTimeUtils.formatDateTime(end),
            attendees: attendeeList,
            reminders: {
                useDefault: true
            }
        };
    }

    /**
     * Check for event conflicts
     * @param {Object} newEvent - New event to check
     * @param {Array} existingEvents - Existing events
     * @returns {Array} - Array of conflicting events
     */
    checkConflicts(newEvent, existingEvents) {
        const conflicts = [];
        const newStart = new Date(newEvent.start);
        const newEnd = new Date(newEvent.end);

        for (const event of existingEvents) {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);

            // Check for overlap
            if (newStart < eventEnd && newEnd > eventStart) {
                conflicts.push({
                    event,
                    overlapStart: new Date(Math.max(newStart.getTime(), eventStart.getTime())),
                    overlapEnd: new Date(Math.min(newEnd.getTime(), eventEnd.getTime()))
                });
            }
        }

        return conflicts;
    }

    /**
     * Suggest alternative times for conflicting events
     * @param {Object} originalEvent - Original event data
     * @param {Array} conflicts - Conflicting events
     * @returns {Array} - Suggested alternative times
     */
    suggestAlternativeTimes(originalEvent, conflicts) {
        const suggestions = [];
        const duration = new Date(originalEvent.end) - new Date(originalEvent.start);
        const originalStart = new Date(originalEvent.start);

        // Try 30 minutes later
        suggestions.push({
            start: this.dateTimeUtils.addMinutes(originalStart, 30),
            end: this.dateTimeUtils.addMinutes(originalStart, 30 + duration / 60000)
        });

        // Try 1 hour later
        suggestions.push({
            start: this.dateTimeUtils.addMinutes(originalStart, 60),
            end: this.dateTimeUtils.addMinutes(originalStart, 60 + duration / 60000)
        });

        return suggestions;
    }

    /**
     * Parse natural language event description
     * @param {string} input - Natural language input
     * @returns {Object} - Parsed event data
     */
    parseNaturalLanguage(input) {
        const eventData = {
            summary: '',
            start: null,
            end: null,
            attendees: [],
            description: input
        };

        // Extract title (usually first part before time indicators)
        const timeIndicators = /(at|from|on|tomorrow|today|next|meeting)/i;
        const titleMatch = input.split(timeIndicators)[0].trim();
        eventData.summary = titleMatch || 'New Event';

        // Extract time information
        try {
            const timeString = input.match(/(tomorrow|today|next \w+|\d{1,2}(:\d{2})?\s*(am|pm))/i);
            if (timeString) {
                eventData.start = this.dateTimeUtils.parseNaturalTime(timeString[0]);
                eventData.end = this.dateTimeUtils.addMinutes(
                    eventData.start, 
                    this.dateTimeUtils.getDefaultDuration()
                );
            }
        } catch (error) {
            console.warn('Could not parse time from natural language:', error);
        }

        // Extract emails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emails = input.match(emailRegex);
        if (emails) {
            eventData.attendees = emails;
        }

        return eventData;
    }

    /**
     * Validate email address
     * @param {string} email - Email to validate
     * @returns {boolean} - Whether email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

export default EventManager;