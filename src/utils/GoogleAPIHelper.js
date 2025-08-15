/**
 * Google API Helper Utility
 * Handles Google API initialization and helper functions
 */

class GoogleAPIHelper {
    constructor() {
        this.gapiInited = false;
        this.gisInited = false;
    }

    /**
     * Initialize Google API client
     */
    async initGoogleAPI() {
        try {
            await new Promise((resolve, reject) => {
                window.gapi.load('client', {
                    callback: resolve,
                    onerror: reject,
                    timeout: 5000,
                    ontimeout: () => reject(new Error('Google API client load timed out'))
                });
            });

            await window.gapi.client.init({
                apiKey: window.CONFIG.GOOGLE.API_KEY,
                discoveryDocs: window.CONFIG.GOOGLE.DISCOVERY_DOCS,
            });

            this.gapiInited = true;
            console.log('Google API client initialized');
            
        } catch (error) {
            console.error('Failed to initialize Google API:', error);
            throw new Error('Failed to initialize Google API. Please refresh the page.');
        }
    }

    /**
     * Initialize Google Identity Services token client
     * @param {Function} callback - Auth response callback
     * @returns {Object} - Token client
     */
    initTokenClient(callback) {
        try {
            const tokenClient = window.google.accounts.oauth2.initTokenClient({
                client_id: window.CONFIG.GOOGLE.CLIENT_ID,
                scope: window.CONFIG.GOOGLE.SCOPES,
                callback: callback
            });

            this.gisInited = true;
            console.log('Google Identity Services initialized');
            return tokenClient;
            
        } catch (error) {
            console.error('Failed to initialize Google Identity Services:', error);
            throw new Error('Failed to initialize Google authentication.');
        }
    }

    /**
     * Fetch user profile from Google API
     * @param {string} accessToken - Access token
     * @returns {Promise<Object>} - User profile
     */
    async fetchUserProfile(accessToken) {
        try {
            const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
            return response.ok ? await response.json() : { name: 'Unknown User', email: '', picture: '' };
        } catch (error) {
            console.error('Error fetching user profile:', error);
            return { name: 'Unknown User', email: '', picture: '' };
        }
    }

    /**
     * Revoke access token
     * @param {string} token - Token to revoke
     */
    async revokeToken(token) {
        try {
            await window.google.accounts.oauth2.revoke(token);
        } catch (error) {
            console.error('Error revoking token:', error);
        }
    }

    /**
     * Check if both GAPI and GIS are initialized
     * @returns {boolean} - Whether both are ready
     */
    isReady() {
        return this.gapiInited && this.gisInited;
    }
}

export default GoogleAPIHelper;