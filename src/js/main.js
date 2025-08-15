/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize UI
        window.ui.init();
        
        // Initialize authentication
        if (window.auth) {
            window.auth.init();
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
        
        // Show welcome screen by default
        window.ui.showWelcomeScreen();
        
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
