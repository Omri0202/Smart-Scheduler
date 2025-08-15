// Global state
const authState = {
    isSignedIn: false,
    userProfile: null,
    tokenClient: null,
    gapiInited: false,
    gisInited: false
};

// UI update functions
function updateUI(isSignedIn) {
    const loginContainer = document.getElementById('loginContainer');
    const appContainer = document.getElementById('appContainer');
    
    if (isSignedIn) {
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
    } else {
        loginContainer.style.display = 'flex';
        appContainer.style.display = 'none';
    }
}

function showError(message) {
    console.error(message);
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

// Google API Initialization
async function initializeGapiClient() {
    try {
        // First load the client library
        await new Promise((resolve, reject) => {
            gapi.load('client:auth2', {
                callback: resolve,
                onerror: reject,
                timeout: 10000,
                ontimeout: () => reject(new Error('Timeout loading Google API client'))
            });
        });

        console.log('Initializing GAPI client with config:', {
            apiKey: window.CONFIG.GOOGLE.API_KEY,
            clientId: window.CONFIG.GOOGLE.CLIENT_ID,
            discoveryDocs: window.CONFIG.GOOGLE.DISCOVERY_DOCS,
            scope: window.CONFIG.GOOGLE.SCOPES
        });

        // Initialize the client with API key and discovery docs
        await gapi.client.init({
            apiKey: window.CONFIG.GOOGLE.API_KEY,
            discoveryDocs: window.CONFIG.GOOGLE.DISCOVERY_DOCS,
            clientId: window.CONFIG.GOOGLE.CLIENT_ID,
            scope: window.CONFIG.GOOGLE.SCOPES
        });
        
        console.log('GAPI client initialized successfully');
        authState.gapiInited = true;
        updateSigninStatus();
        
        // Check for existing token
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance && authInstance.isSignedIn.get()) {
            authState.isSignedIn = true;
            updateUI(true);
            await loadUserProfile();
        }
        
    } catch (error) {
        console.error('Error initializing GAPI client:', error);
        let errorMessage = 'Failed to initialize Google services. ';
        
        if (error.status === 400) {
            errorMessage += 'Invalid API key or client ID. Please check your Google Cloud Console settings.';
        } else if (error.details) {
            if (error.details.includes('ORIGIN')) {
                errorMessage = 'Invalid domain. Please add ' + window.location.origin + ' to Authorized JavaScript origins in Google Cloud Console.';
            } else {
                errorMessage += error.details;
            }
        } else if (error.message) {
            errorMessage += error.message;
        }
        
        showError(errorMessage);
        throw error;
    }
}

// Initialize Google Identity Services
function initializeGis() {
    try {
        authState.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: window.CONFIG.GOOGLE.CLIENT_ID,
            scope: window.CONFIG.GOOGLE.SCOPES,
            callback: (response) => {
                if (response.error) {
                    console.error('Error from Google Identity Services:', response);
                    showError('Authentication error: ' + response.error);
                    return;
                }
                authState.isSignedIn = true;
                updateUI(true);
                loadUserProfile();
            },
            error_callback: (error) => {
                console.error('Error in Google Identity Services:', error);
                showError('Authentication error: ' + error.message);
            }
        });
        
        console.log('Google Identity Services initialized');
        authState.gisInited = true;
        updateSigninStatus();
        
    } catch (error) {
        console.error('Error initializing Google Identity Services:', error);
        showError('Failed to initialize authentication services. Please refresh the page.');
    }
}

// Update sign-in status
function updateSigninStatus() {
    if (authState.gapiInited && authState.gisInited) {
        document.getElementById('signInButton').style.display = 'block';
    }
}

// Load user profile
async function loadUserProfile() {
    try {
        const response = await gapi.client.people.people.get({
            resourceName: 'people/me',
            personFields: 'names,emailAddresses,photos'
        });
        
        const profile = response.result;
        authState.userProfile = profile;
        
        // Update UI with user info
        const userName = profile.names && profile.names[0]?.displayName || 'User';
        const userEmail = profile.emailAddresses && profile.emailAddresses[0]?.value || '';
        const userPhoto = profile.photos && profile.photos[0]?.url || '';
        
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                ${userPhoto ? `<img src="${userPhoto}" alt="Profile" class="profile-pic">` : ''}
                <div>
                    <div class="user-name">${userName}</div>
                    <div class="user-email">${userEmail}</div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading user profile:', error);
        showError('Failed to load user profile. Please try signing in again.');
    }
}

// Handle sign in
function handleAuthClick() {
    if (!authState.gisInited || !authState.tokenClient) {
        showError('Authentication service not ready. Please try again.');
        return;
    }
    
    try {
        authState.tokenClient.requestAccessToken();
    } catch (error) {
        console.error('Error requesting access token:', error);
        showError('Failed to start authentication. Please try again.');
    }
}

// Handle sign out
function handleSignoutClick() {
    const auth2 = gapi.auth2.getAuthInstance();
    if (auth2) {
        auth2.signOut().then(() => {
            authState.isSignedIn = false;
            authState.userProfile = null;
            updateUI(false);
            console.log('User signed out');
        }).catch(error => {
            console.error('Error signing out:', error);
            showError('Failed to sign out. Please try again.');
        });
    } else {
        // If auth2 isn't available, just update the UI
        authState.isSignedIn = false;
        authState.userProfile = null;
        updateUI(false);
    }
}

// Initialize the application
function initializeApp() {
    console.log('Initializing application...');
    
    // Set up event listeners
    document.getElementById('signInButton').addEventListener('click', handleAuthClick);
    document.getElementById('signOutButton').addEventListener('click', handleSignoutClick);
    
    // Show loading state
    document.getElementById('loadingIndicator').style.display = 'block';
    
    // Initialize Google APIs
    initializeGapiClient().catch(error => {
        console.error('Failed to initialize Google API client:', error);
    });
    
    // Initialize Google Identity Services
    if (typeof google !== 'undefined' && google.accounts) {
        initializeGis();
    } else {
        console.error('Google Identity Services not loaded');
        showError('Failed to load authentication services. Please refresh the page.');
    }
}

// Make functions available globally
window.initializeApp = initializeApp;
window.gapiLoaded = function() {
    console.log('Google API client loaded');
    if (document.readyState === 'complete') {
        initializeApp();
    } else {
        window.addEventListener('load', initializeApp);
    }
};

window.gisLoaded = function() {
    console.log('Google Identity Services loaded');
    if (typeof google !== 'undefined' && google.accounts) {
        initializeGis();
    }
};

window.handleGapiError = function() {
    console.error('Failed to load Google API client');
    showError('Failed to load Google services. Please check your connection and refresh the page.');};

window.handleGisError = function() {
    console.error('Failed to load Google Identity Services');
    showError('Failed to load authentication services. Please check your connection and refresh the page.');
};
