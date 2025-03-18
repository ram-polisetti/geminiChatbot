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
        const { message, chatHistory = [] } = req.body;
        const result = await vectorStore.query(message, chatHistory);
        
        res.json({
            message: result.answer,
            sources: result.sources,
            links: extractLinks(result.sources.join('\n'))
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
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