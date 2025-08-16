/**
 * Authentication State Manager
 * Manages user authentication state and session persistence
 */

import TokenManager from '../utils/TokenManager.js';

class AuthStateManager {
    constructor() {
        this.tokenManager = new TokenManager();
        this.userProfile = null;
        this.isAuthenticated = false;
        this.authStateListeners = [];
    }

    /**
     * Initialize authentication state manager
     */
    init() {
        // Check for existing valid token
        this.checkExistingAuth();
        console.log('Auth State Manager initialized');
    }

    /**
     * Check for existing authentication
     */
    checkExistingAuth() {
        const token = this.tokenManager.getToken();
        const storedProfile = localStorage.getItem('smart_scheduler_user_profile');
        
        if (token) {
            this.isAuthenticated = true;
            
            // Restore user profile if available
            if (storedProfile) {
                try {
                    this.userProfile = JSON.parse(storedProfile);
                } catch (error) {
                    console.error('Error parsing stored user profile:', error);
                    localStorage.removeItem('smart_scheduler_user_profile');
                }
            }
            
            this.notifyAuthStateChange(true);
        }
    }

    /**
     * Set user as authenticated
     * @param {string} accessToken - Access token
     * @param {number} expiresIn - Token expiry in seconds
     * @param {Object} profile - User profile data
     */
    setAuthenticated(accessToken, expiresIn, profile = null) {
        this.tokenManager.storeToken(accessToken, expiresIn);
        this.userProfile = profile;
        this.isAuthenticated = true;
        
        // Store user profile persistently
        if (profile) {
            localStorage.setItem('smart_scheduler_user_profile', JSON.stringify(profile));
        }
        
        // Update global access token for GAPI
        if (window.gapi && window.gapi.client) {
            window.gapi.client.setToken({ access_token: accessToken });
        }

        this.notifyAuthStateChange(true);
    }

    /**
     * Set user as not authenticated
     */
    setUnauthenticated() {
        this.tokenManager.clearToken();
        this.userProfile = null;
        this.isAuthenticated = false;

        // Clear stored user profile
        localStorage.removeItem('smart_scheduler_user_profile');

        // Clear global access token
        if (window.gapi && window.gapi.client) {
            window.gapi.client.setToken(null);
        }

        this.notifyAuthStateChange(false);
    }

    /**
     * Get current authentication status
     * @returns {boolean} - Whether user is authenticated
     */
    getAuthStatus() {
        // Double-check token validity
        if (this.isAuthenticated && !this.tokenManager.hasValidToken()) {
            this.setUnauthenticated();
        }
        return this.isAuthenticated;
    }

    /**
     * Get current access token
     * @returns {string|null} - Current access token
     */
    getAccessToken() {
        return this.tokenManager.getToken();
    }

    /**
     * Get user profile
     * @returns {Object|null} - User profile data
     */
    getUserProfile() {
        return this.userProfile;
    }

    /**
     * Update user profile
     * @param {Object} profile - Updated profile data
     */
    updateUserProfile(profile) {
        this.userProfile = profile;
        
        // Store profile persistently
        if (profile) {
            localStorage.setItem('smart_scheduler_user_profile', JSON.stringify(profile));
        }
        
        // Notify UI components about profile update
        const event = new CustomEvent('profileUpdated', {
            detail: { profile }
        });
        window.dispatchEvent(event);
    }

    /**
     * Add authentication state listener
     * @param {Function} callback - Callback function
     */
    addAuthStateListener(callback) {
        this.authStateListeners.push(callback);
    }

    /**
     * Remove authentication state listener
     * @param {Function} callback - Callback function to remove
     */
    removeAuthStateListener(callback) {
        this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of auth state change
     * @param {boolean} isAuthenticated - Current auth state
     */
    notifyAuthStateChange(isAuthenticated) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(isAuthenticated, this.userProfile);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });

        // Dispatch global event
        const event = new CustomEvent('authStateChanged', {
            detail: { 
                isAuthenticated,
                userProfile: this.userProfile
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Check if token needs refresh
     * @returns {boolean} - Whether token should be refreshed
     */
    shouldRefreshToken() {
        return this.tokenManager.shouldRefreshToken();
    }

    /**
     * Get token expiry information
     * @returns {Object|null} - Token expiry info
     */
    getTokenExpiry() {
        return this.tokenManager.getTokenExpiry();
    }

    /**
     * Validate current authentication state
     * @returns {boolean} - Whether auth state is valid
     */
    validateAuthState() {
        if (!this.isAuthenticated) return false;
        
        const hasValidToken = this.tokenManager.hasValidToken();
        if (!hasValidToken) {
            this.setUnauthenticated();
            return false;
        }

        return true;
    }
}

export default AuthStateManager;