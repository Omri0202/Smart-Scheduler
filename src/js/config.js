// API Configuration
const CONFIG = {
    // Google OAuth Configuration  
    GOOGLE: {
        CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || (() => {
            console.error('VITE_GOOGLE_CLIENT_ID not configured');
            return 'GOOGLE_CLIENT_ID_NOT_CONFIGURED';
        })(),
        SCOPES: import.meta.env.VITE_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar',
        DISCOVERY_DOCS: [import.meta.env.VITE_GOOGLE_DISCOVERY_DOCS || 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    },
    
    // Together API Configuration
    TOGETHER_API: {
        KEY: import.meta.env.VITE_TOGETHER_API_KEY || (() => {
            console.error('VITE_TOGETHER_API_KEY not configured');
            return 'TOGETHER_API_KEY_NOT_CONFIGURED';
        })(),
        ENDPOINT: import.meta.env.VITE_TOGETHER_API_ENDPOINT || 'https://api.together.xyz/v1/chat/completions'
    },
    
    // App Settings
    APP: {
        NAME: import.meta.env.VITE_APP_NAME || 'Smart Scheduler',
        VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
        DEBUG: import.meta.env.VITE_DEBUG_MODE === 'true' || false
    },
    
    // Default Event Settings
    EVENT: {
        DURATION: 60, // minutes
        DEFAULT_TITLE: 'New Event',
        DEFAULT_LOCATION: '',
        DEFAULT_DESCRIPTION: 'Created with Smart Scheduler'
    },
    
    // UI Constants
    UI: {
        TYPING_DELAY: 20, // ms between characters when displaying messages
        MAX_MESSAGE_LENGTH: 2000,
        MAX_EVENT_TITLE_LENGTH: 100,
        MAX_EVENT_DESCRIPTION_LENGTH: 5000
    }
};

// Export for use in other modules
window.CONFIG = CONFIG;
