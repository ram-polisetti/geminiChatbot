require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { logger } = require('./logger');
const embeddingsService = require('./embeddings.service');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API and ChromaDB
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Initialize ChromaDB
embeddingsService.initialize().catch(error => {
    logger.error('Failed to initialize ChromaDB:', error);
    process.exit(1);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('src/static'));

// Helper functions for response formatting and context handling
const validateInput = (message) => {
    return message && message.trim().length > 0;
};

const extractLinks = (text) => {
    const links = [];
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.includes('http://') || line.includes('https://')) {
            links.push(line.trim());
        }
    }
    return links;
};

const formatBotResponse = (response, links = []) => {
    let formattedResponse = response.trim();
    if (!links.length) return formattedResponse;

    const responseLower = response.toLowerCase();
    const serviceKeywords = {
        erp: ['enterprise resource planning', 'erp', 'business process', 'workflow'],
        crm: ['customer relationship', 'crm', 'sales', 'customer service'],
        scm: ['supply chain', 'scm', 'inventory', 'logistics', 'procurement'],
        hrm: ['human resource', 'hrm', 'workforce', 'employee', 'talent']
    };

    const serviceTypes = {};
    for (const [service, keywords] of Object.entries(serviceKeywords)) {
        serviceTypes[service] = keywords.some(keyword => responseLower.includes(keyword));
    }

    const companyLinks = [];
    const resourceLinks = [];
    const socialLinks = [];

    for (const link of links) {
        const linkLower = link.toLowerCase();
        if (['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'].some(sm => linkLower.includes(sm))) {
            socialLinks.push(link);
        } else if (['privacy', 'terms', 'faq'].some(res => linkLower.includes(res))) {
            resourceLinks.push(link);
        } else if (Object.values(serviceTypes).some(v => v)) {
            if (serviceTypes.erp && !linkLower.includes('erp')) continue;
            if (Object.entries(serviceTypes).some(([type, mentioned]) => mentioned && linkLower.includes(type))) {
                companyLinks.push(link);
            }
        } else {
            companyLinks.push(link);
        }
    }

    if (companyLinks.length || resourceLinks.length || socialLinks.length) {
        formattedResponse += '\n\nRelevant links:';
    }

    if (companyLinks.length) {
        formattedResponse += '\nCompany Information:';
        for (const link of [...new Set(companyLinks)].sort()) {
            formattedResponse += `\n- ${link}`;
        }
    }

    if (resourceLinks.length) {
        formattedResponse += '\nResources:';
        for (const link of [...new Set(resourceLinks)].sort()) {
            formattedResponse += `\n- ${link}`;
        }
    }

    if (socialLinks.length) {
        formattedResponse += '\nSocial Media:';
        for (const link of [...new Set(socialLinks)].sort()) {
            formattedResponse += `\n- ${link}`;
        }
    }

    return formattedResponse;
};

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    logger.info('Received chat request');
    try {
        const { message } = req.body;
        if (!message || !validateInput(message)) {
            return res.status(400).json({
                error: 'Invalid request. Message field is required'
            });
        }

        const userMessage = message.trim();
        let response;

        // Get relevant context from ChromaDB
        const relevantDocs = await embeddingsService.queryCollection(userMessage);
        const context = relevantDocs.join('\n');

        // Define company introduction for identity-related queries
        if (userMessage.toLowerCase().includes('who are you') || 
            userMessage.toLowerCase().includes('what are you') || 
            userMessage.toLowerCase().match(/\b(hi|hello|hey)\b/)) {
            response = "Hello! I'm your dedicated customer service representative from CORtracker360. I'm here to help you learn about our comprehensive business solutions and services. How may I assist you today?";
        }
        // Handle product and service inquiries
        else if (userMessage.toLowerCase().includes('products') || 
                 userMessage.toLowerCase().includes('services') || 
                 userMessage.toLowerCase().includes('offer')) {
            response = `Thank you for your interest in our products and services! At CORtracker360, we offer a comprehensive suite of business solutions designed to revolutionize your workflow. Our main solutions include:

            1. ERP (Enterprise Resource Planning): Our unified system integrates all core business processes for seamless collaboration.

            2. CRM (Customer Relationship Management): We help you optimize customer engagement and enhance retention.

            3. SCM (Supply Chain Management): Our tools ensure effective management from procurement to delivery.

            4. HRM (Human Resource Management): We provide solutions to enhance employee engagement and optimize workforce management.

            5. Additional specialized solutions:
               - Purchases/Procurement Management
               - Inventory Management
               - Production & Maintenance
               - Sales Management

            We also offer innovative service models:
            - Talent as a Service (TaaS): Access to skilled professionals for your project needs
            - Knowledge as a Service (KaaS): Specialized expertise to bridge skill gaps
            - RPO & MSP: Flexible hiring management and temporary staffing solutions

            How can we help you find the perfect solution for your business needs?`;
        } else {
            // Add company context to the prompt
            const contextPrompt = `Based on the following company information and context, please answer the customer's question.
            Context:
            ${context}

            Follow these guidelines to avoid redundancy:
            1. If the question is about a specific service, only provide information directly related to that service
            2. Avoid repeating general company information unless specifically asked
            3. Keep responses focused and concise
            4. Only include relevant links for the specific topic being discussed
            If the information is not in the provided context, politely say so.

            As a CORtracker360 customer service representative, provide a helpful and professional response to: ${userMessage}`;
            const result = await model.generateContent(contextPrompt);
            const rawResponse = result.response.text();
            // Extract and format links from the response
            const links = extractLinks(rawResponse);
            response = formatBotResponse(rawResponse, links);
        }

        res.json({ response });
    } catch (error) {
        logger.error('Error processing chat request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Root endpoint
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});