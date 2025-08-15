/**
 * Chat Interface Component
 * Handles chat message display, typing indicators, and message processing
 */

class ChatInterface {
    constructor() {
        this.chatContainer = null;
        this.inputBox = null;
        this.sendButton = null;
    }

    init() {
        this.chatContainer = document.getElementById('chatContainer');
        this.inputBox = document.getElementById('inputBox');
        this.sendButton = document.getElementById('sendButton');
    }

    /**
     * Handle sending a message
     */
    async handleSendMessage() {
        const inputBox = this.inputBox;
        const message = inputBox.value.trim();
        
        if (!message) return;
        
        // Clear input and add user message
        this.addMessage(message, 'user');
        inputBox.value = '';
        
        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Process the message (this will be connected to LLM service)
            const response = await this.processMessage(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add response
            if (response) {
                this.addMessage(response, 'assistant');
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.showError('Sorry, something went wrong. Please try again.');
            console.error('Error processing message:', error);
        }
    }

    /**
     * Process user message (placeholder - will be connected to LLM service)
     */
    async processMessage(message) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Placeholder responses (will be replaced with actual LLM integration)
        const responses = [
            "I understand you'd like to schedule something. Let me help you with that.",
            "I can help you manage your calendar. What would you like to do?",
            "Let me check your calendar and find the best time for that.",
            "I'll help you schedule that meeting. When would work best for you?",
            "Let me create that calendar event for you."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    /**
     * Add a message to the chat
     */
    addMessage(content, type = 'assistant') {
        const chatContainer = this.chatContainer;
        if (!chatContainer) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.textContent = content;
        
        messageEl.appendChild(contentEl);
        chatContainer.appendChild(messageEl);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const chatContainer = this.chatContainer;
        if (!chatContainer) return;
        
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant typing-indicator';
        typingEl.id = 'typingIndicator';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        
        typingEl.appendChild(dots);
        chatContainer.appendChild(typingEl);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingEl = document.getElementById('typingIndicator');
        if (typingEl) {
            typingEl.remove();
        }
    }
}

export default ChatInterface;