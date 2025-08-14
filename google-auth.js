// Google API Configuration
const API_KEY = 'AIzaSyBq1W8rv77mcFyZqYbsrEBJxYm6nvpdxcQ';
const CLIENT_ID = '251900786787-rs2a373jkaetk9lmh49nch3tq5p3lnhp.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  'https://people.googleapis.com/$discovery/rest?version=v1'
];
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/contacts.readonly'
].join(' ');

// Global state
let gapiInited = false;
let gisInited = false;
let tokenClient = null;
let accessToken = null;

// UI Elements
let signInButton = null;
let signOutButton = null;
let loginContainer = null;
let appContainer = null;

// Initialize the application
function init() {
  // Get DOM elements
  signInButton = document.getElementById('authorize_button');
  signOutButton = document.getElementById('signOutBtn');
  loginContainer = document.getElementById('loginContainer');
  appContainer = document.getElementById('appLayout');
  
  // Set up event listeners
  if (signInButton) {
    signInButton.addEventListener('click', handleAuthClick);
    signInButton.disabled = true;
  }
  
  if (signOutButton) {
    signOutButton.addEventListener('click', handleSignout);
  }
  
  // Start loading Google APIs
  loadGoogleAPIs();
}

// Load Google API scripts
function loadGoogleAPIs() {
  // Load Google API Client
  loadScript('https://apis.google.com/js/api.js', () => {
    console.log('Google API script loaded');
    gapi.load('client', initializeGapi);
  }, () => {
    showError('Failed to load Google API. Please check your internet connection and refresh the page.', true);
  });
  
  // Load Google Identity Services
  loadScript('https://accounts.google.com/gsi/client', () => {
    console.log('Google Identity Services script loaded');
    initializeGIS();
  }, () => {
    showError('Failed to load Google Identity Services. Please check your internet connection and refresh the page.', true);
  });
}

// Initialize Google API Client
async function initializeGapi() {
  try {
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    console.log('Google API initialized');
    maybeEnableButtons();
  } catch (error) {
    console.error('Error initializing Google API:', error);
    showError('Failed to initialize Google services. Please refresh the page.', true);
  }
}

// Initialize Google Identity Services
function initializeGIS() {
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      prompt: 'consent',
      callback: (response) => {
        if (response.error) {
          console.error('OAuth error:', response.error);
          showError('Authentication failed. Please try again.');
          return;
        }
        accessToken = response.access_token;
        console.log('OAuth token received');
        handleAuthSuccess();
      }
    });
    
    gisInited = true;
    console.log('Google Identity Services initialized');
    maybeEnableButtons();
  } catch (error) {
    console.error('Error initializing Google Identity Services:', error);
    showError('Failed to initialize authentication. Please refresh the page.', true);
  }
}

// Enable buttons when both APIs are loaded
function maybeEnableButtons() {
  if (signInButton && gapiInited && gisInited) {
    signInButton.disabled = false;
    signInButton.textContent = 'Sign in with Google';
    console.log('Sign-in button enabled');
  }
}

// Handle sign-in button click
function handleAuthClick() {
  console.log('Sign-in button clicked');
  
  if (!signInButton) {
    console.error('Sign-in button not found');
    return;
  }
  
  if (!tokenClient) {
    console.error('Google Identity Services not initialized');
    showError('Authentication services not ready. Please refresh the page.', true);
    return;
  }
  
  // Show loading state
  signInButton.disabled = true;
  signInButton.textContent = 'Signing in...';
  
  try {
    tokenClient.requestAccessToken();
  } catch (error) {
    console.error('Error requesting access token:', error);
    showError('Failed to start sign-in. Please try again.');
    if (signInButton) {
      signInButton.disabled = false;
      signInButton.textContent = 'Sign in with Google';
    }
  }
}

// Handle successful authentication
function handleAuthSuccess() {
  console.log('Authentication successful');
  
  // Update UI
  if (loginContainer) loginContainer.style.display = 'none';
  if (appContainer) appContainer.style.display = 'flex';
  
  // Set the token for API requests
  if (gapi.client) {
    gapi.client.setToken({ access_token: accessToken });
  }
  
  // Load user profile
  loadUserProfile();
  
  // Initialize the rest of the app
  initializeApp();
}

// Load user profile information
async function loadUserProfile() {
  try {
    const userInfo = await gapi.client.oauth2.userinfo.get();
    const welcomeName = document.getElementById('welcomeName');
    if (welcomeName && userInfo.result && userInfo.result.name) {
      welcomeName.textContent = userInfo.result.name;
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
}

// Handle sign out
function handleSignout() {
  console.log('Signing out...');
  
  // Clear tokens
  accessToken = null;
  if (gapi.client) {
    gapi.client.setToken(null);
  }
  
  // Reset UI
  if (loginContainer) loginContainer.style.display = 'flex';
  if (appContainer) appContainer.style.display = 'none';
  
  // Reset sign-in button
  if (signInButton) {
    signInButton.disabled = false;
    signInButton.textContent = 'Sign in with Google';
  }
  
  console.log('Signed out');
}

// Initialize the rest of the application
function initializeApp() {
  console.log('Initializing application...');
  // Add any additional app initialization code here
}

// Show error message to user
function showError(message, isFatal = false) {
  console.error(message);
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.style.cssText = 'color: #ff4444; margin: 20px; padding: 15px; background: #ffebee; border-radius: 4px; text-align: center;';
  errorDiv.textContent = message;
  
  const container = loginContainer || document.body;
  container.insertBefore(errorDiv, container.firstChild);
  
  if (isFatal && signInButton) {
    signInButton.disabled = true;
  }
}

// Helper function to load scripts
function loadScript(src, onload, onerror) {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = onload;
  script.onerror = onerror || function() {
    console.error(`Failed to load script: ${src}`);
  };
  document.head.appendChild(script);
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
