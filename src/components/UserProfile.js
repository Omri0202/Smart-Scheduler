/**
 * User Profile Component
 * Handles user profile display, updates, and user feedback messages
 */

class UserProfile {
    constructor() {
        this.userProfileElement = null;
        this.currentProfile = null;
    }

    init() {
        this.userProfileElement = document.getElementById('userProfile');
    }

    /**
     * Update user profile display
     */
    updateUserProfile(profile) {
        if (!profile) return;
        
        this.currentProfile = profile;
        
        if (this.userProfileElement) {
            // Update profile picture
            if (profile.picture) {
                this.userProfileElement.style.backgroundImage = `url(${profile.picture})`;
                this.userProfileElement.style.backgroundSize = 'cover';
                this.userProfileElement.style.backgroundPosition = 'center';
            }
            
            // Update profile tooltip/title
            if (profile.name) {
                this.userProfileElement.setAttribute('title', profile.name);
                this.userProfileElement.setAttribute('aria-label', `Profile: ${profile.name}`);
            }
        }
        
        // Dispatch profile update event
        const event = new CustomEvent('profileUpdated', {
            detail: { profile }
        });
        window.dispatchEvent(event);
    }

    /**
     * Get current profile data
     */
    getCurrentProfile() {
        return this.currentProfile;
    }

    /**
     * Show error message via chat interface
     */
    showError(message) {
        const event = new CustomEvent('addChatMessage', {
            detail: { 
                message,
                type: 'error'
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Show success message via chat interface
     */
    showSuccess(message) {
        const event = new CustomEvent('addChatMessage', {
            detail: { 
                message,
                type: 'success'
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Clear profile data
     */
    clearProfile() {
        this.currentProfile = null;
        
        if (this.userProfileElement) {
            this.userProfileElement.style.backgroundImage = '';
            this.userProfileElement.removeAttribute('title');
            this.userProfileElement.removeAttribute('aria-label');
        }
        
        // Dispatch profile cleared event
        const event = new CustomEvent('profileCleared');
        window.dispatchEvent(event);
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentProfile !== null;
    }
}

export default UserProfile;