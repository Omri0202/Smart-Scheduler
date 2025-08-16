/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize UI
        window.ui.init();
        
        // Initialize LLM service
        if (window.llm) {
            try {
                await window.llm.init();
                console.log('LLM service initialized successfully');
            } catch (error) {
                console.error('Failed to initialize LLM service:', error);
                window.ui.showError('AI service unavailable. Some features may not work properly.');
            }
        } else {
            console.error('LLM service not loaded');
        }

        // Initialize Calendar service
        if (window.calendar) {
            try {
                window.calendar.init();
                console.log('Calendar service initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Calendar service:', error);
            }
        } else {
            console.error('Calendar service not loaded');
        }
        
        // Initialize authentication
        if (window.auth) {
            window.auth.init();
            
            // Add auth state listener to automatically show app when authenticated
            window.auth.addAuthStateListener((isAuthenticated, userProfile) => {
                console.log('Auth state changed:', { isAuthenticated, userProfile });
                if (isAuthenticated && userProfile) {
                    // User is authenticated, show the app
                    console.log('Auth listener: showing app for authenticated user');
                    window.ui.updateUserProfile(userProfile);
                    window.ui.showApp();
                } else {
                    // User is not authenticated, show login screen
                    console.log('Auth listener: showing login screen');
                    window.ui.showLoginScreen();
                }
            });
        } else {
            utils.logger.error('Auth module not loaded');
        }
        
        // Check if running as PWA
        if (utils.isPWA()) {
            utils.logger.log('Running as PWA');
            // Add any PWA-specific initialization here
        }
        
        // Check if running on mobile
        if (utils.isMobile()) {
            document.body.classList.add('mobile');
            utils.logger.log('Running on mobile device');
        }
        
        // Register service worker for PWA
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        utils.logger.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(error => {
                        utils.logger.error('ServiceWorker registration failed: ', error);
                    });
            });
        }
        
        // Handle app installation
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            
            // Stash the event so it can be triggered later
            window.deferredPrompt = e;
            
            // Show install button if you have one
            // You can add your own install button logic here
            utils.logger.log('App can be installed');
        });
        
        // Show welcome screen by default only if not authenticated
        // The auth state listener will handle showing the correct screen
        setTimeout(() => {
            if (!window.auth.isAuthenticated()) {
                window.ui.showWelcomeScreen();
            }
        }, 100);
        
        utils.logger.log('Application initialized');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        // Show error message to user
        if (window.ui) {
            window.ui.showError('Failed to initialize the application. Please refresh the page.');
        }
    }
});

// Handle window resize
window.addEventListener('resize', utils.debounce(() => {
    // Handle any responsive layout changes here
}, 250));

// Handle offline/online status
window.addEventListener('online', () => {
    window.ui.showSuccess('You are back online!');
});

window.addEventListener('offline', () => {
    window.ui.showError('You are offline. Some features may not be available.');
});

// Export to global scope
window.App = {
    utils: window.utils,
    ui: window.ui,
    auth: window.auth,
    config: window.CONFIG
};

// Log app info
console.log(`${CONFIG.APP.NAME} v${CONFIG.APP.VERSION}`);
