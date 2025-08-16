/**
 * UI State Manager Service
 * Coordinates UI components and manages application state
 */

import ChatInterface from '../components/ChatInterface.js';
import NavigationMenu from '../components/NavigationMenu.js';
import UserProfile from '../components/UserProfile.js';
import VoiceRecognition from '../components/VoiceRecognition.js';

class UIStateManager {
    constructor() {
        // Initialize component instances
        this.chatInterface = new ChatInterface();
        this.navigationMenu = new NavigationMenu();
        this.userProfile = new UserProfile();
        this.voiceRecognition = new VoiceRecognition();
        
        // DOM elements cache
        this.elements = {};
        
        // Application state
        this.isInitialized = false;
    }

    /**
     * Initialize UI State Manager and all components
     */
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize all components
        this.chatInterface.init();
        this.navigationMenu.init();
        this.userProfile.init();
        this.voiceRecognition.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up component communication
        this.setupComponentCommunication();
        
        this.isInitialized = true;
        
        if (window.utils && window.utils.logger) {
            window.utils.logger.log('UI State Manager initialized');
        } else {
            console.log('UI State Manager initialized');
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        this.elements = {
            welcomeContainer: document.getElementById('welcomeContainer'),
            loginContainer: document.getElementById('loginContainer'),
            appContainer: document.getElementById('appContainer'),
            chatContainer: document.getElementById('chatContainer'),
            inputBox: document.getElementById('inputBox'),
            sendButton: document.getElementById('sendButton'),
            voiceButton: document.getElementById('voiceButton'),
            getStartedBtn: document.getElementById('getStartedBtn'),
            userProfile: document.getElementById('userProfile')
        };
    }

    /**
     * Set up main event listeners
     */
    setupEventListeners() {
        const { inputBox, sendButton, voiceButton, getStartedBtn } = this.elements;

        // Send message on button click
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.chatInterface.handleSendMessage();
            });
        }

        // Send message on Enter key
        if (inputBox) {
            inputBox.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.chatInterface.handleSendMessage();
                }
            });
        }

        // Toggle voice input
        if (voiceButton) {
            voiceButton.addEventListener('click', () => {
                this.voiceRecognition.toggleVoiceInput();
            });
        }

        // Get started button
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                this.navigationMenu.hideWelcomeScreen();
            });
        }

        // Handle browser navigation
        window.addEventListener('popstate', () => {
            // Handle navigation state if needed
        });
    }

    /**
     * Set up communication between components using custom events
     */
    setupComponentCommunication() {
        // Listen for chat message events
        window.addEventListener('addChatMessage', (event) => {
            const { message, type } = event.detail;
            this.chatInterface.addMessage(message, type);
        });

        // Listen for welcome message events
        window.addEventListener('addWelcomeMessage', (event) => {
            const { message, type } = event.detail;
            this.chatInterface.addMessage(message, type);
        });

        // Listen for profile update events
        window.addEventListener('profileUpdated', (event) => {
            // Handle profile updates if needed
            console.log('Profile updated:', event.detail.profile);
        });

        // Listen for profile cleared events
        window.addEventListener('profileCleared', () => {
            // Handle profile clearing if needed
            console.log('Profile cleared');
        });
    }

    /**
     * Get reference to specific component
     */
    getComponent(componentName) {
        switch (componentName) {
            case 'chat':
                return this.chatInterface;
            case 'navigation':
                return this.navigationMenu;
            case 'profile':
                return this.userProfile;
            case 'voice':
                return this.voiceRecognition;
            default:
                return null;
        }
    }

    /**
     * Check if UI is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Get current application state
     */
    getAppState() {
        return {
            currentScreen: this.navigationMenu.getCurrentScreen(),
            userLoggedIn: this.userProfile.isLoggedIn(),
            voiceSupported: this.voiceRecognition.isVoiceSupported(),
            isListening: this.voiceRecognition.isCurrentlyListening()
        };
    }
}

// Create singleton instance
const uiStateManager = new UIStateManager();

// Export both class and singleton
export { UIStateManager };
export default uiStateManager;