const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const vectorStore = require('./services/vectorStore');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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
        const { message } = req.body;
        const results = await vectorStore.queryContext(message);
        
        const prompt = `Context: ${results.documents[0].join('\n\n')}
        Question: ${message}`;
        
        const result = await model.generateContent(prompt);
        
        res.json({
            message: result.response.text(),
            links: extractLinks(results.documents[0].join('\n'))
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