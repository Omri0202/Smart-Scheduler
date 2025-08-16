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
        this.userAvatar = document.getElementById('userAvatar');
        this.userName = document.getElementById('userName');
        this.mobileUserAvatar = document.getElementById('mobileUserAvatar');
        this.mobileUserName = document.getElementById('mobileUserName');
        this.mobileUserEmail = document.getElementById('mobileUserEmail');
    }

    /**
     * Update user profile display
     */
    updateUserProfile(profile) {
        if (!profile) return;
        
        this.currentProfile = profile;
        
        // Update desktop user profile
        if (this.userAvatar) {
            if (profile.picture) {
                this.userAvatar.src = profile.picture;
                this.userAvatar.style.display = 'block';
            } else {
                // Use a default avatar or initials
                this.userAvatar.src = this.generateDefaultAvatar(profile.name);
                this.userAvatar.style.display = 'block';
            }
            this.userAvatar.alt = profile.name || 'User';
        }
        
        if (this.userName) {
            this.userName.textContent = profile.name || 'User';
        }
        
        // Update mobile user profile
        if (this.mobileUserAvatar) {
            if (profile.picture) {
                this.mobileUserAvatar.src = profile.picture;
            } else {
                this.mobileUserAvatar.src = this.generateDefaultAvatar(profile.name);
            }
            this.mobileUserAvatar.alt = profile.name || 'User';
        }
        
        if (this.mobileUserName && profile.name) {
            this.mobileUserName.textContent = profile.name;
        }
        
        if (this.mobileUserEmail && profile.email) {
            this.mobileUserEmail.textContent = profile.email;
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
     * Generate a default avatar using initials or placeholder
     */
    generateDefaultAvatar(name) {
        if (!name || name === 'Unknown User') {
            // Return a default user icon from a service like UI Avatars
            return 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=128';
        }
        
        // Generate avatar with user initials
        const initials = name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=fff&size=128`;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentProfile !== null;
    }
}

export default UserProfile;