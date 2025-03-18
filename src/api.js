const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const vectorStore = require('./services/langchainVectorStore');

require('dotenv').config();

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'AI-KEY-GOES-HERE') {
    console.error('Invalid or missing GEMINI_API_KEY in .env file');
    process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());



(async () => {
    try {
        await vectorStore.initialize();
        console.log('Vector store initialized successfully');
    } catch (error) {
        console.error('Failed to initialize vector store:', error);
        process.exit(1);
    }
})();

app.post('/api/chat', async (req, res) => {
    try {
        console.log('Received chat request:', req.body);
        const { message } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing message:', message);
        const result = await vectorStore.query(message);
        console.log('Query completed successfully');
        
        const response = {
            message: result.answer,
            sources: result.sources,
            links: extractLinks(result.sources.join('\n'))
        };
        console.log('Sending response');
        res.json(response);
    } catch (error) {
        console.error('API Error:', error);
        const errorMessage = error.message.includes('timed out')
            ? 'Request timed out. Please try again.'
            : 'An error occurred while processing your request';
        res.status(500).json({ error: errorMessage });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        message: 'API is running'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Company Customer Service Chatbot API',
        version: '1.0',
        endpoints: [
            { path: '/api/chat', method: 'POST', description: 'Send a message to the chatbot' },
            { path: '/api/health', method: 'GET', description: 'Check API health status' }
        ]
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function extractLinks(text) {
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(linkRegex) || [];
}