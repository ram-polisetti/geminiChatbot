const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChromaClient } = require('chromadb');
const { logger } = require('./logger');

class EmbeddingsService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        this.chromaClient = new ChromaClient();
        this.chromaClient.heartbeat(); // Ensure client is working
        this.collection = null;
    }

    async initialize() {
        try {
            logger.info('Initializing ChromaDB collection');
            this.collection = await this.chromaClient.createCollection({
                name: 'company_data',
                metadata: { description: 'Company information for chatbot' }
            });
            logger.info('ChromaDB collection initialized successfully');
        } catch (error) {
            logger.error('Error initializing ChromaDB collection:', error);
            throw error;
        }
    }

    async generateEmbeddings(texts) {
        try {
            logger.info(`Generating embeddings for ${texts.length} texts`);
            const embeddings = [];
            for (const text of texts) {
                const result = await this.model.embedContent(text);
                embeddings.push(result.embedding);
            }
            logger.info('Embeddings generated successfully');
            return embeddings;
        } catch (error) {
            logger.error('Error generating embeddings:', error);
            throw error;
        }
    }

    async addDocuments(texts, metadata = []) {
        try {
            logger.info(`Adding ${texts.length} documents to ChromaDB`);
            const embeddings = await this.generateEmbeddings(texts);
            const ids = texts.map((_, index) => `doc_${index}`);
            await this.collection.add({
                ids,
                embeddings,
                documents: texts,
                metadatas: metadata.length ? metadata : texts.map(() => ({}))
            });
            logger.info('Documents added successfully');
        } catch (error) {
            logger.error('Error adding documents:', error);
            throw error;
        }
    }

    async queryCollection(query, numResults = 5) {
        try {
            logger.info(`Querying collection with: ${query}`);
            const queryEmbedding = await this.model.embedContent(query);
            const results = await this.collection.query({
                queryEmbeddings: [queryEmbedding.embedding],
                nResults: numResults
            });
            logger.info(`Found ${results.documents[0].length} relevant documents`);
            return results.documents[0];
        } catch (error) {
            logger.error('Error querying collection:', error);
            throw error;
        }
    }
}

module.exports = new EmbeddingsService();