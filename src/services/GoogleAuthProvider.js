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
     * Sign out user
     */
    async signOut() {
        try {
            const token = this.authStateManager.getAccessToken();
            
            if (token) {
                // Revoke the token
                await this.googleAPIHelper.revokeToken(token);
            }

            // Update auth state
            this.authStateManager.setUnauthenticated();

            // Update UI
            if (window.ui) {
                window.ui.showLoginScreen();
                window.ui.showSuccess('Successfully signed out.');
            }

            console.log('User signed out successfully');
            
        } catch (error) {
            console.error('Sign-out error:', error);
            // Still clear local state even if revoke fails
            this.authStateManager.setUnauthenticated();
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