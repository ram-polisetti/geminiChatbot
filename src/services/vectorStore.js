const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dataLoader = require('./dataLoader');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class VectorStore {
    constructor() {
        this.client = new ChromaClient({
            host: "localhost",
            port: 8000
        });
        
        this.embedFunction = {
            generate: async (texts) => {
                const embeddings = [];
                const maxRetries = 3;
                const baseDelay = 2000; // 2 seconds

                for (const text of texts) {
                    let retries = 0;
                    while (true) {
                        try {
                            const response = await this.contentModel.generateContent(text);
                            const result = await response.response.text();
                            const numbers = result.split(' ').map(Number);
                            const embedding = new Array(1536).fill(0);
                            for (let i = 0; i < Math.min(numbers.length, 1536); i++) {
                                embedding[i] = numbers[i];
                            }
                            embeddings.push(embedding);
                            break; // Success, exit retry loop
                        } catch (error) {
                            if (error.message.includes('429') && retries < maxRetries) {
                                retries++;
                                const delay = baseDelay * Math.pow(2, retries - 1); // Exponential backoff
                                console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
                                await new Promise(resolve => setTimeout(resolve, delay));
                            } else {
                                throw new Error(`Failed to generate embedding after ${retries} retries: ${error.message}`);
                            }
                        }
                    }
                }
                return embeddings;
            }
        };
        this.collection = null;
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.contentModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }

    async initialize() {
        try {
            const chunks = await dataLoader.loadCompanyData();
            
            try {
                this.collection = await this.client.getCollection({
                    name: 'company_data',
                    embeddingFunction: this.embedFunction
                });
                console.log('Using existing collection');
            } catch (error) {
                if (error.message.includes('not found')) {
                    this.collection = await this.client.createCollection({
                        name: 'company_data',
                        metadata: { description: 'Company information for chatbot' },
                        embeddingFunction: this.embedFunction
                    });
                    console.log('Created new collection');
                } else {
                    throw error;
                }
            }
            
            // Process chunks in smaller batches to avoid rate limits
            const batchSize = 3;
            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const batchIds = batch.map((_, idx) => `chunk_${i + idx}`);
                const batchMetadatas = batch.map(() => ({ source: 'company_data' }));
                
                await this.collection.add({
                    ids: batchIds,
                    metadatas: batchMetadatas,
                    documents: batch
                });
                
                // Add delay between batches to respect rate limits
                if (i + batchSize < chunks.length) {
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            
            console.log(`Successfully processed ${chunks.length} chunks of company data`);
            
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    async queryContext(question, k = 3) {
        return await this.collection.query({
            queryTexts: [question],
            nResults: k
        });
    }
}

module.exports = new VectorStore();