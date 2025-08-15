// Load environment variables from .env file
const env = import.meta.env;

export const CONFIG = {
    GOOGLE: {
        CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID || '251900786787-rs2a373jkaetk9lmh49nch3tq5p3lnhp.apps.googleusercontent.com',
        API_KEY: env.VITE_GOOGLE_API_KEY || 'AIzaSyD5VfJmfPQMKDsNaX9JhK67BvDqeQu5fe0',
        SCOPES: env.VITE_GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        DISCOVERY_DOCS: [
            env.VITE_GOOGLE_DISCOVERY_DOCS || 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            'https://people.googleapis.com/$discovery/rest?version=v1'
        ]
    },
    DEBUG: env.VITE_DEBUG_MODE === 'true'
};

// For debugging
console.log('Environment configuration loaded:', {
    GOOGLE: {
        CLIENT_ID: CONFIG.GOOGLE.CLIENT_ID ? '***' + CONFIG.GOOGLE.CLIENT_ID.slice(-4) : 'not set',
        API_KEY: CONFIG.GOOGLE.API_KEY ? '***' + CONFIG.GOOGLE.API_KEY.slice(-4) : 'not set',
        SCOPES: CONFIG.GOOGLE.SCOPES,
        DISCOVERY_DOCS: CONFIG.GOOGLE.DISCOVERY_DOCS
    },
    DEBUG: CONFIG.DEBUG
});

export default CONFIG;
