/**
 * Authentication Module (Refactored)
 * Main entry point for authentication functionality - delegates to modular services
 */

import GoogleAuthProvider from '../services/GoogleAuthProvider.js';

class AuthService {
    constructor() {
        this.googleAuthProvider = new GoogleAuthProvider();
        this.isInitialized = false;
    }

    /**
     * Initialize authentication service
     */
    async init() {
        try {
            await this.googleAuthProvider.init();
            this.isInitialized = true;
            
            if (window.utils && window.utils.logger) {
                window.utils.logger.log('Auth service initialized');
            } else {
                console.log('Auth service initialized');
            }
        } catch (error) {
            console.error('Failed to initialize Auth service:', error);
            throw error;
        }
    }

    /**
     * Sign in user
     */
    async signIn() {
        return await this.googleAuthProvider.signIn();
    }

    /**
     * Sign out user
     */
    async signOut() {
        return await this.googleAuthProvider.signOut();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} - Authentication status
     */
    isAuthenticated() {
        return this.googleAuthProvider.isAuthenticated();
    }

    /**
     * Get current user profile
     * @returns {Object|null} - User profile
     */
    getUserProfile() {
        return this.googleAuthProvider.getUserProfile();
    }

    /**
     * Get current access token
     * @returns {string|null} - Access token
     */
    getAccessToken() {
        return this.googleAuthProvider.getAccessToken();
    }

    /**
     * Add authentication state listener
     * @param {Function} callback - Callback function
     */
    addAuthStateListener(callback) {
        this.googleAuthProvider.addAuthStateListener(callback);
    }

    /**
     * Check if auth service is ready
     * @returns {boolean} - Whether service is ready
     */
    isReady() {
        return this.isInitialized && this.googleAuthProvider.isReady();
    }
}

// Create singleton instance
const authService = new AuthService();

// Legacy compatibility object
const auth = {
    // Initialize auth
    async init() {
        await authService.init();
    },

    // Sign in
    async signIn() {
        return await authService.signIn();
    },

    // Sign out
    async signOut() {
        return await authService.signOut();
    },

    // Check authentication status
    isAuthenticated() {
        return authService.isAuthenticated();
    },

    // Get user profile
    getUserProfile() {
        return authService.getUserProfile();
    },

    // Get access token
    getAccessToken() {
        return authService.getAccessToken();
    },

    // Add state listener
    addAuthStateListener(callback) {
        authService.addAuthStateListener(callback);
    },

    // Get service instance (for advanced usage)
    getService() {
        return authService;
    },

    // Check if ready
    isReady() {
        return authService.isReady();
    }
};

// Make auth available globally for backward compatibility
window.auth = auth;

export { AuthService };
export default auth;