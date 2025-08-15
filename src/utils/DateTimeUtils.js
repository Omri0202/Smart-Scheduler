/**
 * Date Time Utilities
 * Handles date/time formatting, parsing, and timezone operations
 */

class DateTimeUtils {
    constructor() {
        this.defaultTimeZone = 'America/New_York';
    }

    /**
     * Format date/time for Google Calendar API
     * @param {Date|string} dateTime - Date to format
     * @param {string} timeZone - Optional timezone
     * @returns {Object} - Formatted datetime object
     */
    formatDateTime(dateTime, timeZone = null) {
        let date;
        
        if (typeof dateTime === 'string') {
            date = new Date(dateTime);
        } else if (dateTime instanceof Date) {
            date = dateTime;
        } else {
            throw new Error('Invalid date format');
        }

        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        const timezone = timeZone || this.getUserTimeZone();

        return {
            dateTime: date.toISOString(),
            timeZone: timezone
        };
    }

    /**
     * Parse natural language time into Date object
     * @param {string} timeString - Natural language time
     * @returns {Date} - Parsed date
     */
    parseNaturalTime(timeString) {
        const now = new Date();
        const lowerTime = timeString.toLowerCase().trim();

        // Handle relative times
        if (lowerTime.includes('tomorrow')) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return this.extractTime(lowerTime, tomorrow);
        }

        if (lowerTime.includes('next week')) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return this.extractTime(lowerTime, nextWeek);
        }

        // Handle today
        if (lowerTime.includes('today') || lowerTime.match(/\d{1,2}(am|pm)/i)) {
            return this.extractTime(lowerTime, now);
        }

        // Try parsing as regular date
        try {
            return new Date(timeString);
        } catch (error) {
            throw new Error('Could not parse time string');
        }
    }

    /**
     * Extract time from string and apply to date
     * @param {string} timeString - Time string
     * @param {Date} baseDate - Base date to apply time to
     * @returns {Date} - Date with extracted time
     */
    extractTime(timeString, baseDate) {
        const timeMatch = timeString.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i);
        
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]) || 0;
            const period = timeMatch[3];

            if (period && period.toLowerCase() === 'pm' && hours !== 12) {
                hours += 12;
            } else if (period && period.toLowerCase() === 'am' && hours === 12) {
                hours = 0;
            }

            const result = new Date(baseDate);
            result.setHours(hours, minutes, 0, 0);
            return result;
        }

        return baseDate;
    }

    /**
     * Get user's timezone
     * @returns {string} - User timezone
     */
    getUserTimeZone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch (error) {
            return this.defaultTimeZone;
        }
    }

    /**
     * Format date for display
     * @param {Date} date - Date to format
     * @returns {string} - Formatted date string
     */
    formatForDisplay(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }

        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    }

    /**
     * Check if two dates are on the same day
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {boolean} - Whether dates are same day
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * Add duration to date
     * @param {Date} date - Base date
     * @param {number} minutes - Minutes to add
     * @returns {Date} - New date with duration added
     */
    addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }

    /**
     * Get default event duration
     * @returns {number} - Default duration in minutes
     */
    getDefaultDuration() {
        return window.CONFIG?.EVENT?.DURATION || 60;
    }
}

export default DateTimeUtils;