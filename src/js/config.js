// API Configuration
const CONFIG = {
    // Google OAuth Configuration
    GOOGLE: {
        CLIENT_ID: '251900786787-rs2a373jkaetk9lmh49nch3tq5p3lnhp.apps.googleusercontent.com',
        SCOPES: 'https://www.googleapis.com/auth/calendar',
        DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    },
    
    // Together API Configuration
    TOGETHER_API: {
        KEY: '1e60c638e6c99899e27a3bec16b056dfd8fc1e5cace56a9c09e3a324f0de8f39',
        ENDPOINT: 'https://api.together.xyz/v1/chat/completions'
    },
    
    // App Settings
    APP: {
        NAME: 'Smart Scheduler',
        VERSION: '1.0.0',
        DEBUG: true
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
