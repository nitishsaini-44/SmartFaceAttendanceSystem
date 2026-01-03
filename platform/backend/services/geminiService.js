const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the Gemini model
const getModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Generate content using Gemini
 * @param {string} prompt - The prompt to send to Gemini
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The generated content
 */
const generateContent = async (prompt, options = {}) => {
  try {
    const model = getModel(options.model);
    
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxTokens || 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

/**
 * Generate JSON content using Gemini
 * @param {string} prompt - The prompt expecting JSON response
 * @param {object} options - Additional options
 * @returns {Promise<object>} - Parsed JSON object
 */
const generateJSON = async (prompt, options = {}) => {
  try {
    const fullPrompt = `${prompt}\n\nIMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text.`;
    
    const text = await generateContent(fullPrompt, options);
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini JSON Parse Error:', error);
    throw error;
  }
};

/**
 * Chat with Gemini (maintains conversation context)
 * @param {Array} messages - Array of message objects with role and content
 * @param {object} options - Additional options
 * @returns {Promise<string>} - The AI response
 */
const chat = async (messages, options = {}) => {
  try {
    const model = getModel(options.model);
    
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 2048,
      },
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    throw error;
  }
};

module.exports = {
  generateContent,
  generateJSON,
  chat,
  getModel,
};
