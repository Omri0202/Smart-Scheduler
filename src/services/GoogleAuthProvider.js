/**
 * Google Authentication Provider
 * Handles Google OAuth initialization and authentication flow
 */

import AuthStateManager from './AuthStateManager.js';
import GoogleAPIHelper from '../utils/GoogleAPIHelper.js';

class GoogleAuthProvider {
    constructor() {
        this.authStateManager = new AuthStateManager();
        this.googleAPIHelper = new GoogleAPIHelper();
        this.tokenClient = null;
        this.isInitializing = false;
    }

    /**
     * Initialize Google authentication
     */
    async init() {
        if (this.isInitializing) return;
        this.isInitializing = true;

        try {
            this.authStateManager.init();
            
            // Initialize both GAPI and GIS in parallel
            await Promise.all([
                this.googleAPIHelper.initGoogleAPI(),
                this.initGoogleIdentity()
            ]);

            console.log('Google Auth Provider initialized');
        } catch (error) {
            console.error('Failed to initialize Google Auth Provider:', error);
            throw error;
        } finally {
            this.isInitializing = false;
        }
    }

    /**
     * Initialize Google Identity Services
     */
    async initGoogleIdentity() {
        this.tokenClient = this.googleAPIHelper.initTokenClient((response) => {
            this.handleAuthResponse(response);
        });
    }

    /**
     * Handle authentication response
     * @param {Object} response - Auth response from Google
     */
    async handleAuthResponse(response) {
        if (response && response.access_token) {
            await this.handleAuthSuccess(response);
        } else if (response && response.error) {
            this.handleAuthError(response.error);
        }
    }

    /**
     * Handle successful authentication
     * @param {Object} response - Success response
     */
    async handleAuthSuccess(response) {
        try {
            const { access_token, expires_in } = response;
            
            // Fetch user profile
            const userProfile = await this.googleAPIHelper.fetchUserProfile(access_token);
            
            // Update auth state
            this.authStateManager.setAuthenticated(access_token, expires_in, userProfile);

            // Update UI
            if (window.ui) {
                window.ui.updateUserProfile(userProfile);
                window.ui.showApp();
                window.ui.showSuccess('Successfully signed in!');
            }

            console.log('Authentication successful');
            
        } catch (error) {
            console.error('Error handling auth success:', error);
            this.handleAuthError('Failed to complete authentication');
        }
    }

    /**
     * Handle authentication error
     * @param {string} error - Error message
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        this.authStateManager.setUnauthenticated();

        if (window.ui) {
            if (error === 'popup_closed_by_user') {
                window.ui.showError('Sign-in was cancelled.');
            } else {
                window.ui.showError('Authentication failed. Please try again.');
            }
        }
    }

    /**
     * Sign in user
     */
    async signIn() {
        if (!this.googleAPIHelper.isReady()) {
            throw new Error('Google authentication not initialized');
        }

        if (this.authStateManager.getAuthStatus()) {
            console.log('User already authenticated, showing app');
            
            // Get stored user profile and show the app
            let userProfile = this.authStateManager.getUserProfile();
            console.log('Retrieved user profile:', userProfile);
            console.log('window.ui available:', !!window.ui);
            
            if (window.ui) {
                if (userProfile) {
                    // We have both token and profile, show app immediately
                    try {
                        console.log('Updating user profile...');
                        window.ui.updateUserProfile(userProfile);
                        console.log('Showing app...');
                        window.ui.showApp();
                        console.log('Showing success message...');
                        window.ui.showSuccess('Welcome back!');
                        console.log('Navigation completed successfully');
                    } catch (error) {
                        console.error('Error during UI navigation:', error);
                    }
                } else {
                    // We have token but no profile, fetch it first
                    console.log('No profile found, fetching user profile...');
                    const token = this.authStateManager.getAccessToken();
                    if (token) {
                        try {
                            userProfile = await this.googleAPIHelper.fetchUserProfile(token);
                            console.log('Fetched user profile:', userProfile);
                            
                            // Update auth state with the profile
                            this.authStateManager.updateUserProfile(userProfile);
                            
                            // Now show the app
                            window.ui.updateUserProfile(userProfile);
                            window.ui.showApp();
                            window.ui.showSuccess('Welcome back!');
                            console.log('Navigation completed with fetched profile');
                        } catch (error) {
                            console.error('Error fetching user profile:', error);
                            console.log('Profile fetch failed, this may be due to insufficient scopes. Clearing auth to force re-authentication with updated permissions.');
                            // If profile fetch fails, sign out to force re-authentication with new scopes
                            await this.signOut();
                            if (window.ui) {
                                window.ui.showSuccess('Please sign in again to update permissions');
                            }
                        }
                    }
                }
            } else {
                console.error('window.ui not available');
            }
            return;
        }

        try {
            // Request access token with updated scopes
            this.tokenClient.requestAccessToken({
                prompt: 'consent',
                include_granted_scopes: true
            });
        } catch (error) {
            console.error('Sign-in failed:', error);
            this.handleAuthError('Sign-in failed');
        }
    }

    /**
     * Sign out user - complete cleanup
     */
    async signOut() {
        try {
            const token = this.authStateManager.getAccessToken();
            
            console.log('Starting complete sign out process...');

            // Step 1: Revoke Google token
            if (token) {
                try {
                    await this.googleAPIHelper.revokeToken(token);
                    console.log('Google token revoked successfully');
                } catch (revokeError) {
                    console.warn('Failed to revoke Google token:', revokeError);
                    // Continue with cleanup even if revoke fails
                }
            }

            // Step 2: Clear GAPI client token
            if (window.gapi && window.gapi.client) {
                try {
                    window.gapi.client.setToken(null);
                    console.log('GAPI client token cleared');
                } catch (gapiError) {
                    console.warn('Failed to clear GAPI token:', gapiError);
                }
            }

            // Step 3: Sign out from Google Identity Services
            if (window.google && window.google.accounts && window.google.accounts.id) {
                try {
                    window.google.accounts.id.disableAutoSelect();
                    console.log('Google Identity Services auto-select disabled');
                } catch (gisError) {
                    console.warn('Failed to disable GIS auto-select:', gisError);
                }
            }

            // Step 4: Clear all localStorage (comprehensive)
            try {
                console.log('localStorage before clearing:', { ...localStorage });
                
                // Clear specific smart scheduler items first
                const specificItems = [
                    'smart_scheduler_access_token',
                    'smart_scheduler_token_expiry', 
                    'smart_scheduler_user_profile',
                    'smart_scheduler_auth_state',
                    'smart_scheduler_session',
                    'gapi.client::plus',
                    'gapi.client::https://www.googleapis.com/oauth2/v2/userinfo',
                    'gapi.client::https://www.googleapis.com/auth/calendar'
                ];
                
                specificItems.forEach(item => {
                    localStorage.removeItem(item);
                    console.log(`Removed localStorage item: ${item}`);
                });
                
                // Clear any other app-specific items (more comprehensive)
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (
                        key.startsWith('smart_scheduler_') || 
                        key.startsWith('google_') || 
                        key.startsWith('gapi') ||
                        key.startsWith('__gsi') ||
                        key.startsWith('G_') ||
                        key.includes('oauth') ||
                        key.includes('token') ||
                        key.includes('auth')
                    )) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`Removed localStorage key: ${key}`);
                });
                
                console.log('localStorage after clearing:', { ...localStorage });
                console.log('localStorage cleared of authentication data');
            } catch (storageError) {
                console.warn('Failed to clear localStorage:', storageError);
                // Nuclear option for localStorage
                try {
                    localStorage.clear();
                    console.log('Used nuclear option: localStorage.clear()');
                } catch (nuclearError) {
                    console.error('Even nuclear localStorage clear failed:', nuclearError);
                }
            }

            // Step 5: Clear all sessionStorage (comprehensive)
            try {
                console.log('sessionStorage before clearing:', { ...sessionStorage });
                
                // Clear specific items first
                const specificSessionItems = [
                    'smart_scheduler_session',
                    'smart_scheduler_temp_state',
                    'google_auth_state',
                    'gapi_auth_state',
                    'oauth_state',
                    'auth_token',
                    'access_token'
                ];
                
                specificSessionItems.forEach(item => {
                    sessionStorage.removeItem(item);
                    console.log(`Removed sessionStorage item: ${item}`);
                });
                
                // Clear any other auth-related items (more comprehensive)
                const sessionKeysToRemove = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && (
                        key.startsWith('smart_scheduler_') || 
                        key.startsWith('google_') || 
                        key.startsWith('gapi') ||
                        key.startsWith('__gsi') ||
                        key.startsWith('G_') ||
                        key.includes('oauth') ||
                        key.includes('token') ||
                        key.includes('auth')
                    )) {
                        sessionKeysToRemove.push(key);
                    }
                }
                sessionKeysToRemove.forEach(key => {
                    sessionStorage.removeItem(key);
                    console.log(`Removed sessionStorage key: ${key}`);
                });
                
                console.log('sessionStorage after clearing:', { ...sessionStorage });
                console.log('sessionStorage cleared of authentication data');
            } catch (sessionError) {
                console.warn('Failed to clear sessionStorage:', sessionError);
                // Nuclear option for sessionStorage
                try {
                    sessionStorage.clear();
                    console.log('Used nuclear option: sessionStorage.clear()');
                } catch (nuclearError) {
                    console.error('Even nuclear sessionStorage clear failed:', nuclearError);
                }
            }

            // Step 6: Update auth state manager
            this.authStateManager.setUnauthenticated();

            // Step 7: Clear conversation history
            if (window.llm) {
                try {
                    window.llm.clearHistory();
                    console.log('LLM conversation history cleared');
                } catch (llmError) {
                    console.warn('Failed to clear LLM history:', llmError);
                }
            }

            // Step 8: Verify storage is actually cleared
            const remainingLocalItems = [];
            const remainingSessionItems = [];
            
            // Check localStorage
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (
                    key.startsWith('smart_scheduler_') || 
                    key.startsWith('google_') || 
                    key.startsWith('gapi') ||
                    key.includes('auth') ||
                    key.includes('token')
                )) {
                    remainingLocalItems.push(key);
                }
            }
            
            // Check sessionStorage
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key && (
                    key.startsWith('smart_scheduler_') || 
                    key.startsWith('google_') || 
                    key.startsWith('gapi') ||
                    key.includes('auth') ||
                    key.includes('token')
                )) {
                    remainingSessionItems.push(key);
                }
            }
            
            if (remainingLocalItems.length > 0 || remainingSessionItems.length > 0) {
                console.warn('Some auth items still remain:', { remainingLocalItems, remainingSessionItems });
                // Force clear any remaining items
                remainingLocalItems.forEach(key => localStorage.removeItem(key));
                remainingSessionItems.forEach(key => sessionStorage.removeItem(key));
            }

            // Step 9: Update UI
            if (window.ui) {
                window.ui.showLoginScreen();
                window.ui.showSuccess('Successfully signed out from all services.');
            }

            console.log('Complete sign out process finished successfully');
            
            // Step 10: Force page reload after a short delay to ensure complete cleanup
            setTimeout(() => {
                console.log('Forcing page reload to ensure complete signout...');
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Sign-out error:', error);
            
            // Emergency cleanup - force clear everything even if other steps failed
            try {
                this.authStateManager.setUnauthenticated();
                localStorage.clear(); // Nuclear option
                sessionStorage.clear(); // Nuclear option
                
                if (window.ui) {
                    window.ui.showLoginScreen();
                    window.ui.showError('Signed out with some errors. Please refresh if you experience issues.');
                }
            } catch (emergencyError) {
                console.error('Emergency cleanup failed:', emergencyError);
                // Force page reload as last resort
                window.location.reload();
            }
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.authStateManager.getAuthStatus();
    }

    /**
     * Get current user profile
     */
    getUserProfile() {
        return this.authStateManager.getUserProfile();
    }

    /**
     * Get current access token
     */
    getAccessToken() {
        return this.authStateManager.getAccessToken();
    }

    /**
     * Add authentication state listener
     */
    addAuthStateListener(callback) {
        this.authStateManager.addAuthStateListener(callback);
    }

    /**
     * Check if auth provider is ready
     */
    isReady() {
        return this.googleAPIHelper.isReady();
    }
}

export default GoogleAuthProvider;