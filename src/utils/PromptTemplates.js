/**
 * Prompt Templates Utility
 * Handles conversation history, prompt engineering, and context injection
 */

class PromptTemplates {
    constructor() {
        this.conversationHistory = [];
        this.maxHistoryLength = 10;
        this.systemPrompt = '';
        this.lastProcessed = null;
    }

    /**
     * Initialize prompt templates
     */
    init() {
        this.conversationHistory = [];
        this.systemPrompt = this.createSystemPrompt();
        console.log('Prompt Templates initialized');
    }

    /**
     * Create the system prompt for the LLM
     * @returns {string} - System prompt
     */
    createSystemPrompt() {
        const now = new Date();
        return `You are a Smart Scheduler AI assistant. You help users manage their Google Calendar.

CRITICAL RULES:
- NEVER claim events are scheduled unless you have actual calendar API confirmation
- NEVER make up meeting details, times, or confirmations  
- ONLY reference real calendar events provided in the context
- Use the user's real name and calendar data when available in context

CALENDAR ACCESS DETECTION:
- IF context contains "✅ CALENDAR ACCESS CONFIRMED", you DO have access - use the provided calendar data
- IF context contains "❌ CALENDAR ACCESS NOT AVAILABLE", you do NOT have access - be honest about this
- NEVER contradict yourself - if you have access, confidently use the data; if not, clearly state you don't have access

MEETING CREATION PROCESS:
1. COLLECT MINIMUM REQUIRED INFO: title, date, start time, duration/end time
2. ONCE you have the minimum info, IMMEDIATELY create the calendar event
3. AFTER successful creation, ask follow-up questions for improvements (attendees, location, description, etc.)
4. UPDATE the event with additional details as provided
5. If event creation fails, explain the error and ask for corrections

MANDATORY INFORMATION for scheduling:
- Meeting title/subject (what)
- Date (when - day)
- Start time (when - time)  
- Duration OR end time (how long)

OPTIONAL INFORMATION (collect after creation):
- Attendees/participants
- Location (physical or virtual)
- Description/agenda
- Reminders

Guidelines: 
- Create events as soon as you have mandatory info - don't wait for optional details
- Ask follow-up questions to enhance already-created events
- Always confirm successful creation before asking for enhancements
- Be helpful but truthful about calendar integration status
- Reference actual upcoming events from context when relevant

CALENDAR ACTIONS AVAILABLE:
To create a calendar event, respond with exactly this format:
[CREATE_EVENT]
Title: [meeting title]
Date: [YYYY-MM-DD]
Start: [HH:MM]
End: [HH:MM]
[/CREATE_EVENT]

To update an event, respond with:
[UPDATE_EVENT:event_id]
[field]: [new value]
[/UPDATE_EVENT]

Example:
[CREATE_EVENT]
Title: Meeting with Dr. Shim
Date: 2025-08-17
Start: 14:00
End: 15:00
[/CREATE_EVENT]

Current: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    }

    /**
     * Prepare prompt with conversation history and context
     * @param {string} input - User input
     * @param {Object} context - Additional context
     * @returns {Array} - Array of message objects for API
     */
    preparePrompt(input, context = {}) {
        const messages = [];

        // Add system prompt
        messages.push({
            role: 'system',
            content: this.systemPrompt
        });

        // Add context if provided
        if (context && Object.keys(context).length > 0) {
            const contextMessage = this.formatContext(context);
            if (contextMessage) {
                messages.push({
                    role: 'system',
                    content: contextMessage
                });
            }
        }

        // Add conversation history (limited)
        const recentHistory = this.getRecentHistory();
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current user input
        messages.push({
            role: 'user',
            content: input
        });

        return messages;
    }

    /**
     * Format context information for the prompt
     * @param {Object} context - Context object
     * @returns {string} - Formatted context string
     */
    formatContext(context) {
        let contextParts = [];

        if (context.userProfile) {
            contextParts.push(`User: ${context.userProfile.name || 'Unknown'}`);
        }

        if (context.currentTime) {
            contextParts.push(`Current time: ${context.currentTime}`);
        }

        if (context.timeZone) {
            contextParts.push(`Time zone: ${context.timeZone}`);
        }

        if (context.calendarEvents && context.calendarEvents.length > 0) {
            const eventSummary = context.calendarEvents.slice(0, 5).map(event => {
                const startDate = new Date(event.start);
                const formattedDate = startDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                });
                const formattedTime = startDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                });
                return `${event.summary} on ${formattedDate} at ${formattedTime}`;
            }).join('; ');
            
            contextParts.push(`✅ CALENDAR ACCESS CONFIRMED - You have ${context.calendarEvents.length} upcoming events: ${eventSummary}`);
            if (context.calendarEvents.length > 5) {
                contextParts.push(`Plus ${context.calendarEvents.length - 5} more events not shown`);
            }
        } else if (context.calendarEvents && context.calendarEvents.length === 0) {
            contextParts.push('✅ CALENDAR ACCESS CONFIRMED - Your calendar is clear with no upcoming events');
        } else {
            contextParts.push('❌ CALENDAR ACCESS NOT AVAILABLE - Cannot access calendar data');
        }

        if (context.preferences) {
            if (context.preferences.workingHours) {
                contextParts.push(`Working hours: ${context.preferences.workingHours.start} - ${context.preferences.workingHours.end}`);
            }
            if (context.preferences.timeZone) {
                contextParts.push(`Preferred timezone: ${context.preferences.timeZone}`);
            }
        }

        return contextParts.length > 0 ? 
            `Context: ${contextParts.join('. ')}.` : 
            '';
    }

    /**
     * Add message to conversation history
     * @param {string} role - Message role (user/assistant)
     * @param {string} content - Message content
     */
    addToHistory(role, content) {
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date()
        });

        this.lastProcessed = new Date();

        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    }

    /**
     * Get recent conversation history
     * @param {number} limit - Maximum number of messages to return
     * @returns {Array} - Recent conversation history
     */
    getRecentHistory(limit = this.maxHistoryLength) {
        return this.conversationHistory.slice(-limit);
    }

    /**
     * Get full conversation history
     * @returns {Array} - Full conversation history
     */
    getHistory() {
        return [...this.conversationHistory];
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        this.lastProcessed = null;
    }

    /**
     * Get history length
     * @returns {number} - Number of messages in history
     */
    getHistoryLength() {
        return this.conversationHistory.length;
    }

    /**
     * Get last processed timestamp
     * @returns {Date|null} - Last processed timestamp
     */
    getLastProcessed() {
        return this.lastProcessed;
    }

    /**
     * Update system prompt
     * @param {string} newPrompt - New system prompt
     */
    updateSystemPrompt(newPrompt) {
        this.systemPrompt = newPrompt;
    }

    /**
     * Get current system prompt
     * @returns {string} - Current system prompt
     */
    getSystemPrompt() {
        return this.systemPrompt;
    }
}

export default PromptTemplates;