/**
 * UI Module (Refactored)
 * Main entry point for UI system - delegates to modular components
 */

import uiStateManager from '../services/UIStateManager.js';

// Legacy UI object for backward compatibility
const ui = {
    // Initialize UI system
    init() {
        uiStateManager.init();
    },

    // Delegate methods to appropriate components
    addMessage(content, type = 'assistant') {
        const chatInterface = uiStateManager.getComponent('chat');
        if (chatInterface) {
            chatInterface.addMessage(content, type);
        }
    },

    showWelcomeScreen() {
        const navigationMenu = uiStateManager.getComponent('navigation');
        if (navigationMenu) {
            navigationMenu.showWelcomeScreen();
        }
    },

    hideWelcomeScreen() {
        const navigationMenu = uiStateManager.getComponent('navigation');
        if (navigationMenu) {
            navigationMenu.hideWelcomeScreen();
        }
    },

    showLoginScreen() {
        const navigationMenu = uiStateManager.getComponent('navigation');
        if (navigationMenu) {
            navigationMenu.showLoginScreen();
        }
    },

    showApp(isDemo = false) {
        const navigationMenu = uiStateManager.getComponent('navigation');
        if (navigationMenu) {
            navigationMenu.showApp(isDemo);
        }
    },

    updateUserProfile(profile) {
        const userProfile = uiStateManager.getComponent('profile');
        if (userProfile) {
            userProfile.updateUserProfile(profile);
        }
    },

    showError(message) {
        const userProfile = uiStateManager.getComponent('profile');
        if (userProfile) {
            userProfile.showError(message);
        }
    },

    showSuccess(message) {
        const userProfile = uiStateManager.getComponent('profile');
        if (userProfile) {
            userProfile.showSuccess(message);
        }
    },

    showTypingIndicator() {
        const chatInterface = uiStateManager.getComponent('chat');
        if (chatInterface) {
            chatInterface.showTypingIndicator();
        }
    },

    hideTypingIndicator() {
        const chatInterface = uiStateManager.getComponent('chat');
        if (chatInterface) {
            chatInterface.hideTypingIndicator();
        }
    },

    // Expose state manager for advanced usage
    getStateManager() {
        return uiStateManager;
    },

    // Get application state
    getAppState() {
        return uiStateManager.getAppState();
    }
};

// Make UI available globally for backward compatibility
window.ui = ui;

export default ui;