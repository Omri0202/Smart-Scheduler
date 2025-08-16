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
        this.messagesContainer = document.getElementById('messages');
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
     * Process user message using real AI service
     */
    async processMessage(message) {
        try {
            // Check if LLM service is available and ready
            if (!window.llm || !window.llm.isReady()) {
                throw new Error('AI service not available');
            }
            
            // Process message using real AI service
            const response = await window.llm.processInput(message);
            return response;
            
        } catch (error) {
            console.error('Error processing message with AI:', error);
            throw new Error('Failed to process message. Please try again.');
        }
    }

    /**
     * Add a message to the chat
     */
    addMessage(content, type = 'assistant') {
        const messagesContainer = this.messagesContainer;
        if (!messagesContainer) return;
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        // Add avatar for assistant messages
        if (type === 'assistant') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            messageElement.appendChild(avatar);
        }
        
        // Create message content container
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Add sender name
        const senderElement = document.createElement('div');
        senderElement.className = 'message-sender';
        senderElement.textContent = type === 'user' ? 'You' : 'Assistant';
        senderElement.style.fontWeight = '600';
        senderElement.style.fontSize = '0.75rem';
        senderElement.style.color = type === 'user' ? 'rgba(255, 255, 255, 0.9)' : '#6b7280';
        senderElement.style.marginBottom = '0.25rem';
        messageContent.appendChild(senderElement);
        
        // Add message text
        const textElement = document.createElement('div');
        textElement.className = 'message-text';
        textElement.textContent = content;
        textElement.style.fontSize = '0.875rem';
        textElement.style.lineHeight = '1.5';
        textElement.style.marginBottom = '0.375rem';
        messageContent.appendChild(textElement);
        
        // Add timestamp
        const timeElement = document.createElement('div');
        timeElement.className = 'message-time';
        timeElement.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeElement.style.fontSize = '0.6875rem';
        timeElement.style.color = type === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af';
        timeElement.style.fontWeight = '400';
        messageContent.appendChild(timeElement);
        
        // Add message content to message element
        messageElement.appendChild(messageContent);
        
        // Add message to chat
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        const messagesContainer = this.messagesContainer;
        if (!messagesContainer) return;
        
        // Remove existing typing indicator
        this.hideTypingIndicator();
        
        const typingEl = document.createElement('div');
        typingEl.className = 'typing-indicator';
        typingEl.id = 'typingIndicator';
        typingEl.style.display = 'flex';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dot';
        dots.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
        
        typingEl.appendChild(dots);
        messagesContainer.appendChild(typingEl);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

    /**
     * Show error message
     */
    showError(message) {
        this.addMessage(message, 'error');
    }
}

export default ChatInterface;