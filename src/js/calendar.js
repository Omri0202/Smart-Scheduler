/**
 * Calendar Module
 * Handles all Google Calendar interactions
 */

const calendar = {
    // Calendar ID for the primary calendar
    calendarId: 'primary',
    
    /**
     * Initialize the calendar module
     */
    init() {
        utils.logger.log('Calendar module initialized');
    };
    
    /**
     * Create a new calendar event
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} - Created event
     */
    async createEvent(eventData) {
        try {
            if (!auth.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            const { summary, start, end, attendees = [], description = '', location = '' } = eventData;
            
            // Validate required fields
            if (!summary || !start || !end) {
                throw new Error('Missing required event fields');
            }
            
            // Format attendees if provided
            const attendeeList = Array.isArray(attendees) 
                ? attendees.map(email => ({ email }))
                : [];
            
            const event = {
                summary: summary.substring(0, CONFIG.UI.MAX_EVENT_TITLE_LENGTH),
                description: description.substring(0, CONFIG.UI.MAX_EVENT_DESCRIPTION_LENGTH),
                location: location,
                start: this._formatDateTime(start),
                end: this._formatDateTime(end),
                attendees: attendeeList,
                reminders: {
                    useDefault: true
                }
            };
            
            const response = await gapi.client.calendar.events.insert({
                calendarId: this.calendarId,
                resource: event,
                sendUpdates: 'all'
            });
            
            utils.logger.log('Event created:', response.result);
            return response.result;
            
        } catch (error) {
            utils.logger.error('Error creating calendar event:', error);
            throw error;
        }
    },
    
    /**
     * Get events within a date range
     * @param {Date} timeMin - Start of time range
     * @param {Date} timeMax - End of time range
     * @returns {Promise<Array>} - Array of events
     */
    async getEvents(timeMin, timeMax) {
        try {
            if (!auth.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            const response = await gapi.client.calendar.events.list({
                calendarId: this.calendarId,
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                showDeleted: false,
                singleEvents: true,
                orderBy: 'startTime'
            });
            
            return response.result.items || [];
            
        } catch (error) {
            utils.logger.error('Error fetching calendar events:', error);
            throw error;
        }
    },
    
    /**
     * Update an existing event
     * @param {string} eventId - ID of the event to update
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} - Updated event
     */
    async updateEvent(eventId, updates) {
        try {
            if (!auth.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            // Format date fields if they exist in updates
            const formattedUpdates = { ...updates };
            if (updates.start) formattedUpdates.start = this._formatDateTime(updates.start);
            if (updates.end) formattedUpdates.end = this._formatDateTime(updates.end);
            
            const response = await gapi.client.calendar.events.patch({
                calendarId: this.calendarId,
                eventId: eventId,
                resource: formattedUpdates,
                sendUpdates: 'all'
            });
            
            utils.logger.log('Event updated:', response.result);
            return response.result;
            
        } catch (error) {
            utils.logger.error('Error updating calendar event:', error);
            throw error;
        }
    },
    
    /**
     * Delete an event
     * @param {string} eventId - ID of the event to delete
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        try {
            if (!auth.isAuthenticated()) {
                throw new Error('User not authenticated');
            }
            
            await gapi.client.calendar.events.delete({
                calendarId: this.calendarId,
                eventId: eventId,
                sendUpdates: 'all'
            });
            
            utils.logger.log('Event deleted:', eventId);
            
        } catch (error) {
            utils.logger.error('Error deleting calendar event:', error);
            throw error;
        }
    },
    
    /**
     * Format a Date object for the Calendar API
     * @private
     */
    _formatDateTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        
        // Check if the date has a time component
        const hasTime = date.getHours() > 0 || date.getMinutes() > 0 || date.getSeconds() > 0;
        
        if (hasTime) {
            return {
                dateTime: date.toISOString(),
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        } else {
            // For all-day events
            return {
                date: date.toISOString().split('T')[0]
            };
        }
    },
    
    /**
     * Check if there's a scheduling conflict
     * @param {Date} start - Start time
     * @param {Date} end - End time
     * @param {string} [excludeEventId] - Event ID to exclude from conflict check
     * @returns {Promise<boolean>} - True if there's a conflict
     */
    async hasConflict(start, end, excludeEventId) {
        try {
            const events = await this.getEvents(start, end);
            
            // Filter out the current event if we're updating
            const filteredEvents = excludeEventId
                ? events.filter(event => event.id !== excludeEventId)
                : events;
            
            return filteredEvents.length > 0;
            
        } catch (error) {
            utils.logger.error('Error checking for scheduling conflict:', error);
            throw error;
        }
    },
    
    /**
     * Get available time slots within a date range
     * @param {Date} start - Start of time range
     * @param {Date} end - End of time range
     * @param {number} durationMinutes - Duration in minutes
     * @returns {Promise<Array>} - Array of available time slots
     */
    async getAvailableSlots(start, end, durationMinutes) {
        try {
            // Get busy slots from calendar
            const response = await gapi.client.calendar.freebusy.query({
                resource: {
                    timeMin: start.toISOString(),
                    timeMax: end.toISOString(),
                    items: [{ id: this.calendarId }]
                }
            });
            
            const busySlots = response.data.calendars[this.calendarId].busy || [];
            
            // Generate all possible slots
            const allSlots = [];
            const slotDuration = durationMinutes * 60 * 1000; // Convert to milliseconds
            let currentTime = new Date(start);
            
            while (currentTime.getTime() + slotDuration <= end.getTime()) {
                const slotEnd = new Date(currentTime.getTime() + slotDuration);
                allSlots.push({ start: new Date(currentTime), end: slotEnd });
                currentTime = new Date(currentTime.getTime() + (30 * 60 * 1000)); // 30-minute increments
            }
            
            // Filter out busy slots
            const availableSlots = allSlots.filter(slot => {
                return !busySlots.some(busy => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return (slot.start < busyEnd && slot.end > busyStart);
                });
            });
            
            return availableSlots;
            
        } catch (error) {
            utils.logger.error('Error getting available time slots:', error);
            throw error;
        }
    }
};

// Initialize calendar module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => calendar.init());

// Export calendar module
window.calendar = calendar;
