/**
 * LLM Module
 * Handles all interactions with the language model
 */

const llm = {
    // Conversation history
    conversationHistory: [],
    
    // Maximum number of messages to keep in history
    maxHistoryLength: 10,
    
    /**
     * Initialize the LLM module
     */
    init() {
        this.conversationHistory = [];
        utils.logger.log('LLM module initialized');
    },
    
    /**
     * Process user input and generate a response
     * @param {string} input - User input
     * @param {Object} context - Additional context (e.g., user preferences, calendar data)
     * @returns {Promise<string>} - Generated response
     */
    async processInput(input, context = {}) {
        try {
            // Add user message to history
            this.addToHistory('user', input);
            
            // Prepare the prompt with conversation history and context
            const prompt = this._preparePrompt(input, context);
            
            // Call the LLM API
            const response = await this._callLLM(prompt);
            
            // Add assistant response to history
            this.addToHistory('assistant', response);
            
            return response;
            
        } catch (error) {
            utils.logger.error('Error processing input with LLM:', error);
            throw error;
        }
    },
    
    /**
     * Add a message to the conversation history
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     */
    addToHistory(role, content) {
        this.conversationHistory.push({ role, content, timestamp: new Date() });
        
        // Trim history if it exceeds max length
        if (this.conversationHistory.length > this.maxHistoryLength * 2) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength * 2);
        }
    },
    
    /**
     * Clear the conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
    },
    
    /**
     * Prepare the prompt with conversation history and context
     * @private
     */
    _preparePrompt(input, context) {
        // Start with system message
        let prompt = [
            {
                role: 'system',
                content: `You are Smart Scheduler, an AI assistant that helps users manage their calendar and schedule events.\n` +
                         `Current date: ${new Date().toLocaleDateString()}\n` +
                         `User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n` +
                         `Be concise, helpful, and proactive. Ask clarifying questions when needed.`
            }
        ];
        
        // Add conversation history
        this.conversationHistory.forEach(msg => {
            prompt.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
        
        // Add current user input
        prompt.push({
            role: 'user',
            content: input
        });
        
        return prompt;
    },
    
    /**
     * Call the LLM API
     * @private
     */
    async _callLLM(messages) {
        try {
            const response = await fetch(CONFIG.TOGETHER_API.ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.TOGETHER_API.KEY}`
                },
                body: JSON.stringify({
                    model: 'meta-llama/Llama-3-70b-chat-hf',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    top_p: 0.9,
                    stop: ['</s>']
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`LLM API error: ${response.status} - ${JSON.stringify(errorData)}`);
            }
            
            const data = await response.json();
            return data.choices[0]?.message?.content?.trim() || "I'm sorry, I couldn't generate a response. Please try again.";
            
        } catch (error) {
            utils.logger.error('Error calling LLM API:', error);
            throw error;
        }
    },
    
    /**
     * Extract event details from user input
     * @param {string} input - User input
     * @returns {Object} - Extracted event details
     */
    extractEventDetails(input) {
        // This is a simplified version - in a real app, you'd use more sophisticated NLP
        const eventDetails = {
            summary: '',
            description: '',
            start: null,
            end: null,
            attendees: [],
            location: ''
        };
        
        // Extract time references (simplified)
        const timeRegex = /(\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{1,2}(?::\d{2})?)/gi;
        const timeMatches = input.match(timeRegex) || [];
        
        if (timeMatches.length > 0) {
            // Very basic time extraction - would be more robust in production
            eventDetails.start = new Date();
            const timeParts = timeMatches[0].match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
            
            if (timeParts) {
                let hours = parseInt(timeParts[1], 10);
                const minutes = timeParts[2] ? parseInt(timeParts[2], 10) : 0;
                const period = timeParts[3] ? timeParts[3].toLowerCase() : null;
                
                if (period === 'pm' && hours < 12) hours += 12;
                if (period === 'am' && hours === 12) hours = 0;
                
                eventDetails.start.setHours(hours, minutes, 0, 0);
                
                // Set end time (default to 1 hour duration)
                eventDetails.end = new Date(eventDetails.start);
                eventDetails.end.setHours(eventDetails.end.getHours() + 1);
            }
        }
        
        // Extract potential attendees (very basic)
        const people = ['me', 'i', 'my', 'myself', 'with', 'and'];
        const words = input.toLowerCase().split(/\s+/);
        const potentialAttendees = words.filter(word => 
            !people.includes(word) && 
            word.includes('@') && 
            utils.isValidEmail(word)
        );
        
        if (potentialAttendees.length > 0) {
            eventDetails.attendees = [...new Set(potentialAttendees)]; // Remove duplicates
        }
        
        // Extract potential location (very basic)
        const locationKeywords = ['at', 'in', 'on', 'to'];
        const locationIndex = words.findIndex(word => locationKeywords.includes(word));
        
        if (locationIndex !== -1 && words[locationIndex + 1]) {
            eventDetails.location = words.slice(locationIndex + 1).join(' ');
        }
        
        // Use the rest as summary/description
        const usedText = [
            ...timeMatches,
            ...eventDetails.attendees,
            ...eventDetails.location.split(' ')
        ].join('|');
        
        const summary = input.replace(new RegExp(usedText, 'gi'), '').trim();
        if (summary) {
            eventDetails.summary = summary;
            eventDetails.description = `Created from: "${input}"`;
        }
        
        return eventDetails;
    },
    
    /**
     * Generate a natural language summary of an event
     * @param {Object} event - Calendar event
     * @returns {string} - Natural language summary
     */
    generateEventSummary(event) {
        if (!event) return '';
        
        const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
        const end = event.end.dateTime ? new Date(event.end.dateTime) : new Date(event.end.date);
        
        const options = { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        const startStr = start.toLocaleString(undefined, options);
        const endStr = end.toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        let summary = `"${event.summary || 'Untitled Event'}"`;
        
        if (event.start.dateTime) {
            summary += ` on ${startStr} to ${endStr}`;
        } else {
            summary += ` all day on ${start.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`;
        }
        
        if (event.location) {
            summary += ` at ${event.location}`;
        }
        
        if (event.attendees && event.attendees.length > 0) {
            const attendeeNames = event.attendees
                .filter(a => a.email !== userProfile?.email)
                .map(a => a.displayName || a.email.split('@')[0]);
                
            if (attendeeNames.length > 0) {
                summary += ` with ${attendeeNames.join(', ')}`;
            }
        }
        
        return summary;
    },
    
    /**
     * Generate a suggested event name based on details
     * @param {Object} eventDetails - Event details
     * @returns {Promise<string>} - Suggested event name
     */
    async generateEventName(eventDetails) {
        try {
            const prompt = [
                {
                    role: 'system',
                    content: 'You are an AI assistant that helps create concise, descriptive event titles. ' +
                             'Generate a short, clear title (max 5-7 words) based on the event details provided.'
                },
                {
                    role: 'user',
                    content: `Generate a concise event title for an event with these details:\n` +
                             `Summary: ${eventDetails.summary || 'N/A'}\n` +
                             `Description: ${eventDetails.description || 'N/A'}\n` +
                             `Location: ${eventDetails.location || 'N/A'}\n` +
                             `Attendees: ${eventDetails.attendees?.join(', ') || 'N/A'}\n\n` +
                             `Return only the title, no other text.`
                }
            ];
            
            const response = await this._callLLM(prompt);
            return response.trim().replace(/^["']|["']$/g, '');
            
        } catch (error) {
            utils.logger.error('Error generating event name:', error);
            return eventDetails.summary || 'New Event';
        }
    }
};

// Initialize LLM module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => llm.init());

// Export LLM module
window.llm = llm;
