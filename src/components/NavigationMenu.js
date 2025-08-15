/**
 * Navigation Menu Component
 * Handles screen transitions and navigation state management
 */

class NavigationMenu {
    constructor() {
        this.elements = {
            welcomeContainer: null,
            loginContainer: null,
            appLayout: null
        };
        this.hasShownWelcome = false;
    }

    init() {
        this.elements = {
            welcomeContainer: document.getElementById('welcomeContainer'),
            loginContainer: document.getElementById('loginContainer'),
            appLayout: document.getElementById('appLayout')
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
        if (this.elements.appLayout) {
            this.elements.appLayout.style.display = 'flex';
            this.elements.appLayout.style.opacity = '1';
            
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
        if (this.elements.appLayout) this.elements.appLayout.style.display = 'none';
    }

    /**
     * Show welcome message in chat
     */
    showWelcomeMessage() {
        // This will be connected to ChatInterface
        const event = new CustomEvent('addWelcomeMessage', {
            detail: { 
                message: "Hello! I'm your Smart Scheduler assistant. How can I help you today?",
                type: 'assistant'
            }
        });
        window.dispatchEvent(event);
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
        if (this.elements.appLayout && this.elements.appLayout.style.display !== 'none') {
            return 'app';
        }
        return 'none';
    }
}

export default NavigationMenu;