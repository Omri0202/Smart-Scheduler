/**
 * LLM Client Service
 * Handles direct API communication with the Together AI service
 */

class LLMClient {
    constructor() {
        this.apiEndpoint = null;
        this.apiKey = null;
        this.defaultModel = 'meta-llama/Llama-2-7b-chat-hf';
        this.maxTokens = 512;
        this.temperature = 0.7;
    }

    /**
     * Initialize the LLM client with configuration
     */
    init(config = {}) {
        this.apiEndpoint = config.endpoint || window.CONFIG?.TOGETHER_API?.ENDPOINT;
        this.apiKey = config.apiKey || window.CONFIG?.TOGETHER_API?.KEY;
        
        if (!this.apiEndpoint || !this.apiKey) {
            throw new Error('LLM API configuration not found');
        }

        if (this.apiKey === 'TOGETHER_API_KEY_NOT_CONFIGURED') {
            throw new Error('Together API key not configured in environment variables');
        }
    }

    /**
     * Make API call to Together AI
     * @param {Array} messages - Array of message objects with role and content
     * @returns {Promise<string>} - Generated response text
     */
    async callAPI(messages) {
        if (!this.apiEndpoint || !this.apiKey) {
            throw new Error('LLM client not initialized');
        }

        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: this.defaultModel,
                    messages: messages,
                    max_tokens: this.maxTokens,
                    temperature: this.temperature,
                    top_p: 0.7,
                    top_k: 50,
                    repetition_penalty: 1,
                    stop: ["<|im_end|>", "</s>"],
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.status} - ${errorData}`);
            }

            const data = await response.json();
            
            if (!data.choices || data.choices.length === 0) {
                throw new Error('No response generated from LLM');
            }

            return data.choices[0].message.content.trim();

        } catch (error) {
            console.error('LLM API call failed:', error);
            
            // Provide user-friendly error messages
            if (error.message.includes('401') || error.message.includes('unauthorized')) {
                throw new Error('Invalid API key. Please check your Together AI configuration.');
            } else if (error.message.includes('429')) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
            } else if (error.message.includes('503') || error.message.includes('502')) {
                throw new Error('LLM service temporarily unavailable. Please try again later.');
            } else {
                throw new Error('Failed to generate response. Please try again.');
            }
        }
    }

    /**
     * Update model configuration
     */
    setModel(modelName) {
        this.defaultModel = modelName;
    }

    /**
     * Update generation parameters
     */
    setGenerationParams({ maxTokens, temperature, topP, topK }) {
        if (maxTokens !== undefined) this.maxTokens = maxTokens;
        if (temperature !== undefined) this.temperature = temperature;
        if (topP !== undefined) this.topP = topP;
        if (topK !== undefined) this.topK = topK;
    }

    /**
     * Health check for API connectivity
     */
    async healthCheck() {
        try {
            const testMessage = [{ role: 'user', content: 'Hello' }];
            await this.callAPI(testMessage);
            return true;
        } catch (error) {
            console.error('LLM health check failed:', error);
            return false;
        }
    }
}

export default LLMClient;