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
        return `You are a helpful AI assistant for Smart Scheduler. Help users schedule meetings and events.

Guidelines: Always confirm details, suggest specific times, ask clarifying questions if ambiguous, be concise.

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
            const eventSummary = context.calendarEvents.slice(0, 3).map(event => 
                `${event.summary} (${event.start})`
            ).join(', ');
            contextParts.push(`Upcoming events: ${eventSummary}`);
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