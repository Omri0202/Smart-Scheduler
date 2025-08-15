/**
 * Token Manager Utility
 * Handles secure storage, validation, and management of authentication tokens
 */

class TokenManager {
    constructor() {
        this.storageKey = 'smart_scheduler_auth';
        this.tokenRefreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    }

    /**
     * Store authentication token securely
     * @param {string} token - Access token
     * @param {number} expiresIn - Token expiry time in seconds
     */
    storeToken(token, expiresIn) {
        if (!token) return;

        const tokenData = {
            access_token: token,
            expires_at: Date.now() + (expiresIn * 1000),
            stored_at: Date.now()
        };

        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(tokenData));
        } catch (error) {
            console.warn('Failed to store token in sessionStorage:', error);
        }
    }

    /**
     * Retrieve stored token
     * @returns {string|null} - Access token or null if not found/expired
     */
    getToken() {
        try {
            const tokenData = sessionStorage.getItem(this.storageKey);
            if (!tokenData) return null;

            const parsed = JSON.parse(tokenData);
            
            // Check if token is expired
            if (this.isTokenExpired(parsed)) {
                this.clearToken();
                return null;
            }

            return parsed.access_token;
        } catch (error) {
            console.warn('Failed to retrieve token:', error);
            return null;
        }
    }

    /**
     * Check if token exists and is valid
     * @returns {boolean} - Whether valid token exists
     */
    hasValidToken() {
        return this.getToken() !== null;
    }

    /**
     * Check if token is expired or near expiry
     * @param {Object} tokenData - Token data object
     * @returns {boolean} - Whether token is expired
     */
    isTokenExpired(tokenData) {
        if (!tokenData || !tokenData.expires_at) return true;
        
        // Consider token expired if it will expire within the threshold
        return Date.now() >= (tokenData.expires_at - this.tokenRefreshThreshold);
    }

    /**
     * Clear stored token
     */
    clearToken() {
        try {
            sessionStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear token:', error);
        }
    }

    /**
     * Get token expiry information
     * @returns {Object|null} - Token expiry information
     */
    getTokenExpiry() {
        try {
            const tokenData = sessionStorage.getItem(this.storageKey);
            if (!tokenData) return null;

            const parsed = JSON.parse(tokenData);
            return {
                expiresAt: new Date(parsed.expires_at),
                isExpired: this.isTokenExpired(parsed),
                timeUntilExpiry: parsed.expires_at - Date.now()
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if token needs refresh
     * @returns {boolean} - Whether token should be refreshed
     */
    shouldRefreshToken() {
        const tokenData = sessionStorage.getItem(this.storageKey);
        if (!tokenData) return false;

        try {
            const parsed = JSON.parse(tokenData);
            const timeUntilExpiry = parsed.expires_at - Date.now();
            return timeUntilExpiry <= this.tokenRefreshThreshold;
        } catch (error) {
            return false;
        }
    }
}

export default TokenManager;