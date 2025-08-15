/**
 * LLM Module (Refactored)
 * Main entry point for LLM functionality - delegates to modular services
 */

import MessageProcessor from '../services/MessageProcessor.js';

class LLMService {
    constructor() {
        this.messageProcessor = new MessageProcessor();
        this.isInitialized = false;
    }

    /**
     * Initialize the LLM service
     */
    async init() {
        try {
            await this.messageProcessor.init();
            this.isInitialized = true;
            
            if (window.utils && window.utils.logger) {
                window.utils.logger.log('LLM service initialized');
            } else {
                console.log('LLM service initialized');
            }
        } catch (error) {
            console.error('Failed to initialize LLM service:', error);
            throw error;
        }
    }

    /**
     * Process user input and generate a response
     * @param {string} input - User input
     * @param {Object} context - Additional context
     * @returns {Promise<string>} - Generated response
     */
    async processInput(input, context = {}) {
        if (!this.isInitialized) {
            throw new Error('LLM service not initialized');
        }

        return await this.messageProcessor.processInput(input, context);
    }

    /**
     * Get conversation history
     * @returns {Array} - Conversation history
     */
    getConversationHistory() {
        return this.messageProcessor.getConversationHistory();
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.messageProcessor.clearHistory();
    }

    /**
     * Get service status
     * @returns {Object} - Service status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            ...this.messageProcessor.getStatus()
        };
    }

    /**
     * Check if service is ready
     * @returns {boolean} - Whether service is ready
     */
    isReady() {
        return this.isInitialized && this.messageProcessor.isReady();
    }
}

// Create singleton instance
const llmService = new LLMService();

// Legacy compatibility object
const llm = {
    // Legacy properties
    conversationHistory: [],
    maxHistoryLength: 10,

    // Initialize LLM
    async init() {
        await llmService.init();
        // Sync legacy property
        this.conversationHistory = llmService.getConversationHistory();
    },

    // Process user input
    async processInput(input, context = {}) {
        const response = await llmService.processInput(input, context);
        // Sync legacy property
        this.conversationHistory = llmService.getConversationHistory();
        return response;
    },

    // Add to history (legacy method)
    addToHistory(role, content) {
        // This is now handled internally by MessageProcessor
        console.warn('llm.addToHistory is deprecated. History is managed automatically.');
    },

    // Clear history
    clearHistory() {
        llmService.clearHistory();
        this.conversationHistory = [];
    },

    // Get service instance (for advanced usage)
    getService() {
        return llmService;
    },

    // Check if ready
    isReady() {
        return llmService.isReady();
    }
};

// Make LLM available globally for backward compatibility
window.llm = llm;

export { LLMService };
export default llm;