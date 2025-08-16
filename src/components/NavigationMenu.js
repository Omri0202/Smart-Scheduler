/**
 * Navigation Menu Component
 * Handles screen transitions and navigation state management
 */

class NavigationMenu {
    constructor() {
        this.elements = {
            welcomeContainer: null,
            loginContainer: null,
            appContainer: null
        };
        this.hasShownWelcome = false;
    }

    init() {
        this.elements = {
            welcomeContainer: document.getElementById('welcomeContainer'),
            loginContainer: document.getElementById('loginContainer'),
            appContainer: document.getElementById('appContainer')
        };
    }

    /**
     * Show welcome screen
     */
    showWelcomeScreen() {
        this.hideAllScreens();
        if (this.elements.welcomeContainer) {
            this.elements.welcomeContainer.style.display = 'flex';
            this.elements.welcomeContainer.style.opacity = '1';
        }
    }

    /**
     * Hide welcome screen and show login
     */
    hideWelcomeScreen() {
        if (this.elements.welcomeContainer) {
            this.elements.welcomeContainer.style.display = 'none';
        }
        this.showLoginScreen();
    }

    /**
     * Show login screen
     */
    showLoginScreen() {
        this.hideAllScreens();
        if (this.elements.loginContainer) {
            this.elements.loginContainer.style.display = 'flex';
            this.elements.loginContainer.style.opacity = '1';
        }
    }

    /**
     * Show main application
     */
    showApp(isDemo = false) {
        this.hideAllScreens();
        if (this.elements.appContainer) {
            this.elements.appContainer.style.display = 'block';
            this.elements.appContainer.style.opacity = '1';
            
            // Hide the static welcome message
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.style.display = 'none';
            }
            
            // Focus on input box
            const inputBox = document.getElementById('inputBox');
            if (inputBox) {
                inputBox.focus();
            }
            
            // Show welcome message on first visit
            if (!isDemo && !this.hasShownWelcome) {
                this.showWelcomeMessage();
                this.hasShownWelcome = true;
            }
        }
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        if (this.elements.welcomeContainer) this.elements.welcomeContainer.style.display = 'none';
        if (this.elements.loginContainer) this.elements.loginContainer.style.display = 'none';
        if (this.elements.appContainer) this.elements.appContainer.style.display = 'none';
    }

    /**
     * Show welcome message in chat
     */
    showWelcomeMessage() {
        // Small delay to ensure the chat interface is ready
        setTimeout(() => {
            const event = new CustomEvent('addWelcomeMessage', {
                detail: { 
                    message: "Welcome! I'm your Smart Scheduler assistant. I can help you schedule meetings, check your calendar, and manage your events. What would you like to do today?",
                    type: 'assistant'
                }
            });
            window.dispatchEvent(event);
        }, 500);
    }

    /**
     * Get current screen state
     */
    getCurrentScreen() {
        if (this.elements.welcomeContainer && this.elements.welcomeContainer.style.display !== 'none') {
            return 'welcome';
        }
        if (this.elements.loginContainer && this.elements.loginContainer.style.display !== 'none') {
            return 'login';
        }
        if (this.elements.appContainer && this.elements.appContainer.style.display !== 'none') {
            return 'app';
        }
        return 'none';
    }
}

export default NavigationMenu;