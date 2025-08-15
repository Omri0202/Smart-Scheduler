/**
 * Voice Recognition Component
 * Handles speech-to-text functionality and voice input controls
 */

class VoiceRecognition {
    constructor() {
        this.recognition = null;
        this.voiceButton = null;
        this.isListening = false;
        this.isSupported = false;
    }

    init() {
        this.voiceButton = document.getElementById('voiceButton');
        this.initVoiceRecognition();
    }

    /**
     * Initialize voice recognition API
     */
    initVoiceRecognition() {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech Recognition API not supported in this browser');
            this.hideVoiceButton();
            return;
        }

        this.isSupported = true;
        
        // Initialize speech recognition
        this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        // Set up event handlers
        this.setupRecognitionHandlers();
    }

    /**
     * Set up speech recognition event handlers
     */
    setupRecognitionHandlers() {
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceButton(true);
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            // Update input field with transcript
            this.updateInputWithTranscript(transcript);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceButton(false);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceButton(false);
            this.showVoiceError('Voice input failed. Please try again.');
        };
    }

    /**
     * Toggle voice input on/off
     */
    toggleVoiceInput() {
        if (!this.recognition || !this.isSupported) return;

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    /**
     * Update voice button appearance
     */
    updateVoiceButton(isListening) {
        if (!this.voiceButton) return;

        if (isListening) {
            this.voiceButton.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            this.voiceButton.classList.add('listening');
        } else {
            this.voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            this.voiceButton.classList.remove('listening');
        }
    }

    /**
     * Hide voice button when not supported
     */
    hideVoiceButton() {
        if (this.voiceButton) {
            this.voiceButton.style.display = 'none';
        }
    }

    /**
     * Update input field with voice transcript
     */
    updateInputWithTranscript(transcript) {
        const inputBox = document.getElementById('inputBox');
        if (inputBox) {
            inputBox.value = transcript;
            
            // Dispatch input event for any listeners
            const event = new Event('input', { bubbles: true });
            inputBox.dispatchEvent(event);
        }
    }

    /**
     * Show voice recognition error
     */
    showVoiceError(message) {
        const event = new CustomEvent('addChatMessage', {
            detail: { 
                message,
                type: 'error'
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * Check if voice recognition is supported
     */
    isVoiceSupported() {
        return this.isSupported;
    }

    /**
     * Check if currently listening
     */
    isCurrentlyListening() {
        return this.isListening;
    }
}

export default VoiceRecognition;