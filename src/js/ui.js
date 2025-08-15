/**
 * UI Module
 * Handles all UI interactions and updates
 */

const ui = {
    // DOM Elements
    elements: {
        welcomeContainer: null,
        loginContainer: null,
        appLayout: null,
        chatContainer: null,
        inputBox: null,
        sendButton: null,
        voiceButton: null,
        userProfile: null
    },
    
    // Initialize UI
    init() {
        // Cache DOM elements
        this.elements = {
            welcomeContainer: document.getElementById('welcomeContainer'),
            loginContainer: document.getElementById('loginContainer'),
            appLayout: document.getElementById('appLayout'),
            chatContainer: document.getElementById('chatContainer'),
            inputBox: document.getElementById('inputBox'),
            sendButton: document.getElementById('sendButton'),
            voiceButton: document.getElementById('voiceButton'),
            getStartedBtn: document.getElementById('getStartedBtn'),
            userProfile: document.getElementById('userProfile')
        };
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize voice recognition if available
        this.initVoiceRecognition();
        
        utils.logger.log('UI initialized');
    },
    
    // Set up event listeners
    setupEventListeners() {
        const { inputBox, sendButton, voiceButton, getStartedBtn } = this.elements;
        
        // Send message on button click
        if (sendButton) {
            sendButton.addEventListener('click', () => this.handleSendMessage());
        }
        
        // Send message on Enter key
        if (inputBox) {
            inputBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }
        
        // Toggle voice input
        if (voiceButton) {
            voiceButton.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        // Get started button
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.hideWelcomeScreen();
            });
        }
        
        // Handle back button/refresh
        window.addEventListener('popstate', () => {
            // Handle navigation if needed
        });
    },
    
    // Initialize voice recognition
    initVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            utils.logger.warn('Speech Recognition API not supported in this browser');
            if (this.elements.voiceButton) {
                this.elements.voiceButton.style.display = 'none';
            }
            return;
        }
        
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        this.recognition.onstart = () => {
            this.elements.voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.elements.voiceButton.classList.add('listening');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            this.elements.inputBox.value = transcript;
        };
        
        this.recognition.onend = () => {
            this.elements.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.elements.voiceButton.classList.remove('listening');
        };
        
        this.recognition.onerror = (event) => {
            utils.logger.error('Speech recognition error:', event.error);
            this.elements.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.elements.voiceButton.classList.remove('listening');
            this.showError('Voice input failed. Please try again.');
        };
    },
    
    // Toggle voice input
    toggleVoiceInput() {
        if (!this.recognition) return;
        
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        } else {
            this.recognition.start();
            this.isListening = true;
        }
    },
    
    // Handle send message
    async handleSendMessage() {
        const { inputBox } = this.elements;
        const message = inputBox.value.trim();
        
        if (!message) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        inputBox.value = '';
        
        try {
            // Show typing indicator
            this.showTypingIndicator();
            
            // Process message (this would be handled by your LLM or other logic)
            const response = await this.processMessage(message);
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add assistant response to chat
            if (response) {
                this.addMessage(response, 'assistant');
            }
        } catch (error) {
            utils.logger.error('Error processing message:', error);
            this.hideTypingIndicator();
            this.showError('Sorry, something went wrong. Please try again.');
        }
    },
    
    // Process message (placeholder - would be replaced with actual LLM integration)
    async processMessage(message) {
        // This is a placeholder - in a real app, this would call your LLM API
        utils.logger.log('Processing message:', message);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple response for demonstration
        const responses = [
            "I'll help you schedule that event.",
            "When would you like to schedule this event?",
            "Who should be invited to this event?",
            "Where will this event take place?",
            "I've added that to your calendar."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    },
    
    // Add message to chat
    addMessage(content, type = 'assistant') {
        const { chatContainer } = this.elements;
        if (!chatContainer) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.textContent = content;
        
        messageEl.appendChild(contentEl);
        chatContainer.appendChild(messageEl);
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },
    
    // Show typing indicator
    showTypingIndicator() {
        const { chatContainer } = this.elements;
        if (!chatContainer) return;
        
        // Remove any existing typing indicator
        this.hideTypingIndicator();
        
        const typingEl = document.createElement('div');
        typingEl.className = 'message assistant-message typing-indicator';
        typingEl.id = 'typingIndicator';
        
        const dots = document.createElement('div');
        dots.className = 'typing-dots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        
        typingEl.appendChild(dots);
        chatContainer.appendChild(typingEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    },
    
    // Hide typing indicator
    hideTypingIndicator() {
        const typingEl = document.getElementById('typingIndicator');
        if (typingEl) {
            typingEl.remove();
        }
    },
    
    // Show welcome screen
    showWelcomeScreen() {
        this.hideAllScreens();
        if (this.elements.welcomeContainer) {
            this.elements.welcomeContainer.style.display = 'flex';
        }
    },
    
    // Hide welcome screen
    hideWelcomeScreen() {
        if (this.elements.welcomeContainer) {
            this.elements.welcomeContainer.style.display = 'none';
        }
        this.showLoginScreen();
    },
    
    // Show login screen
    showLoginScreen() {
        this.hideAllScreens();
        if (this.elements.loginContainer) {
            this.elements.loginContainer.style.display = 'flex';
        }
    },
    
    // Show main app
    showApp(isDemo = false) {
        this.hideAllScreens();
        if (this.elements.appLayout) {
            this.elements.appLayout.style.display = 'flex';
            
            // Focus on input
            if (this.elements.inputBox) {
                this.elements.inputBox.focus();
            }
            
            // Add welcome message if it's the first time
            if (!isDemo && !this.hasShownWelcome) {
                this.addMessage("Hello! I'm your Smart Scheduler assistant. How can I help you today?", 'assistant');
                this.hasShownWelcome = true;
            }
        }
    },
    
    // Hide all screens
    hideAllScreens() {
        if (this.elements.welcomeContainer) this.elements.welcomeContainer.style.display = 'none';
        if (this.elements.loginContainer) this.elements.loginContainer.style.display = 'none';
        if (this.elements.appLayout) this.elements.appLayout.style.display = 'none';
    },
    
    // Update user profile in UI
    updateUserProfile(profile) {
        if (!profile) return;
        
        if (this.elements.userProfile) {
            // Update profile picture if available
            if (profile.picture) {
                this.elements.userProfile.style.backgroundImage = `url(${profile.picture})`;
            }
            
            // Update name if available
            if (profile.name) {
                this.elements.userProfile.setAttribute('title', profile.name);
            }
        }
    },
    
    // Show error message
    showError(message) {
        this.addMessage(message, 'error');
    },
    
    // Show success message
    showSuccess(message) {
        this.addMessage(message, 'success');
    }
};

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => ui.init());

// Export UI module
window.ui = ui;
