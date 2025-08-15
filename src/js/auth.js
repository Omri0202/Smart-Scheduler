/**
 * Authentication Module
 * Handles Google OAuth authentication and user session management
 */

// Global variables
let tokenClient;
let gapiInited = false;
let gisInited = false;
let accessToken = null;
let userProfile = null;

// Initialize Google API client
async function initGoogleAPI() {
    try {
        await new Promise((resolve, reject) => {
            gapi.load('client', {
                callback: resolve,
                onerror: reject,
                timeout: 5000,
                ontimeout: () => reject(new Error('Google API client load timed out'))
            });
        });

        await gapi.client.init({
            apiKey: CONFIG.GOOGLE.API_KEY || '',
            discoveryDocs: CONFIG.GOOGLE.DISCOVERY_DOCS,
        });

        gapiInited = true;
        utils.logger.log('Google API client initialized');
        checkAuthStatus();
    } catch (error) {
        utils.logger.error('Failed to initialize Google API:', error);
        ui.showError('Failed to initialize Google API. Please refresh the page.');
    }
}

// Initialize Google Identity Services
function initGoogleIdentity() {
    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.GOOGLE.CLIENT_ID,
            scope: CONFIG.GOOGLE.SCOPES,
            prompt: 'consent',
            callback: (response) => {
                if (response && response.access_token) {
                    handleAuthSuccess(response);
                } else if (response && response.error) {
                    handleAuthError(response.error);
                }
            },
            error_callback: (error) => {
                handleAuthError(error);
            }
        });

        gisInited = true;
        utils.logger.log('Google Identity Services initialized');
        checkAuthStatus();
    } catch (error) {
        utils.logger.error('Failed to initialize Google Identity Services:', error);
        ui.showError('Failed to initialize authentication service. Please refresh the page.');
    }
}

// Check authentication status
function checkAuthStatus() {
    if (!gapiInited || !gisInited) return false;
    
    // Check for access token in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const token = hashParams.get('access_token');
    
    if (token) {
        // Remove token from URL
        window.history.replaceState({}, document.title, window.location.pathname);
        accessToken = token;
        gapi.client.setToken({ access_token: accessToken });
        loadUserProfile();
        return true;
    }
    
    // Check if we have a stored token
    const storedToken = localStorage.getItem('google_access_token');
    if (storedToken) {
        accessToken = storedToken;
        gapi.client.setToken({ access_token: accessToken });
        loadUserProfile();
        return true;
    }
    
    return false;
}

// Handle successful authentication
async function handleAuthSuccess(response) {
    try {
        accessToken = response.access_token;
        localStorage.setItem('google_access_token', accessToken);
        
        // Set the token for gapi client
        gapi.client.setToken({ 
            access_token: accessToken,
            expires_in: response.expires_in || 3600,
            token_type: 'Bearer'
        });
        
        // Load user profile
        await loadUserProfile();
        
        // Show main app
        ui.showApp();
        
        utils.logger.log('User authenticated successfully');
    } catch (error) {
        utils.logger.error('Error in authentication success handler:', error);
        ui.showError('An error occurred during authentication. Please try again.');
    }
}

// Handle authentication error
function handleAuthError(error) {
    utils.logger.error('Authentication error:', error);
    ui.showError('Authentication failed. Please try again.');
    
    // Clear any stored tokens
    localStorage.removeItem('google_access_token');
    accessToken = null;
    userProfile = null;
    
    // Show login screen
    ui.showLogin();
}

// Load user profile from Google
async function loadUserProfile() {
    try {
        const response = await gapi.client.oauth2.userinfo.get();
        userProfile = response.result;
        utils.logger.log('User profile loaded:', userProfile);
        ui.updateUserProfile(userProfile);
        return userProfile;
    } catch (error) {
        utils.logger.error('Failed to load user profile:', error);
        throw error;
    }
}

// Sign out the user
function signOut() {
    try {
        // Revoke token
        if (accessToken && google.accounts.oauth2) {
            google.accounts.oauth2.revoke(accessToken, () => {
                utils.logger.log('Access token revoked');
            });
        }
        
        // Clear tokens and user data
        localStorage.removeItem('google_access_token');
        accessToken = null;
        userProfile = null;
        
        // Reset gapi client
        if (gapi.client && gapi.client.getToken()) {
            gapi.client.setToken(null);
        }
        
        // Show login screen
        ui.showLogin();
        
        utils.logger.log('User signed out');
    } catch (error) {
        utils.logger.error('Error during sign out:', error);
    }
}

// Initialize authentication
function initAuth() {
    // Initialize Google API client
    if (window.gapi) {
        initGoogleAPI();
    } else {
        window.gapiLoaded = initGoogleAPI;
    }
    
    // Initialize Google Identity Services
    if (window.google && google.accounts) {
        initGoogleIdentity();
    } else {
        window.gisLoaded = initGoogleIdentity;
    }
    
    // Set up sign out button
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', signOut);
    }
    
    // Set up test/demo mode button
    const testButton = document.getElementById('testButton');
    if (testButton) {
        testButton.addEventListener('click', () => {
            utils.logger.log('Test mode activated');
            ui.showApp(true);
        });
    }
}

// Export auth functions
window.auth = {
    init: initAuth,
    signOut,
    getAccessToken: () => accessToken,
    getUserProfile: () => userProfile,
    isAuthenticated: () => !!accessToken
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAuth);
