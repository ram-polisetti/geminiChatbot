const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const dataLoader = require('./dataLoader');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

class LangChainVectorStore {
    constructor() {
        this.client = new ChromaClient({
            host: "localhost",
            port: 8000
        });

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        this.embeddings = {
            embedQuery: async (text) => {
                const maxRetries = 3;
                const baseDelay = 2000; // 2 seconds
                let retries = 0;

                while (true) {
                    try {
                        const response = await this.model.generateContent(text);
                        const result = await response.response.text();
                        const numbers = result.split(' ').map(Number);
                        const embedding = new Array(1536).fill(0);
                        for (let i = 0; i < Math.min(numbers.length, 1536); i++) {
                            embedding[i] = numbers[i];
                        }
                        return embedding;
                    } catch (error) {
                        if (error.message.includes('429') && retries < maxRetries) {
                            retries++;
                            const delay = baseDelay * Math.pow(2, retries - 1); // Exponential backoff
                            console.log(`Rate limit hit, retrying in ${delay}ms (attempt ${retries}/${maxRetries})`);
                            await new Promise(resolve => setTimeout(resolve, delay));
                        } else {
                            throw error;
                        }
                    }
                }
            },
            embedDocuments: async (texts) => {
                const embeddings = [];
                const batchSize = 3; // Process in small batches
                
                for (let i = 0; i < texts.length; i += batchSize) {
                    const batch = texts.slice(i, i + batchSize);
                    for (const text of batch) {
                        const embedding = await this.embeddings.embedQuery(text);
                        embeddings.push(embedding);
                    }
                    
                    // Add delay between batches
                    if (i + batchSize < texts.length) {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
                return embeddings;
            }
        };

        this.vectorStore = null;
        this.chain = null;
    }

    async initialize() {
        try {
            const chunks = await dataLoader.loadCompanyData();
            
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200
            });

            const splitDocs = await textSplitter.createDocuments([chunks.join('\n')]);
            
            this.vectorStore = await Chroma.fromDocuments(
                splitDocs,
                this.embeddings,
                {
                    collectionName: 'company_data',
                    url: 'http://localhost:8000'
                }
            );

            this.chain = ConversationalRetrievalQAChain.fromLLM(
                this.model,
                this.vectorStore.asRetriever(),
                {
                    returnSourceDocuments: true,
                    questionGeneratorChainOptions: {
                        template: 'Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question that captures all relevant context from the conversation history.\n\nChat History:\n{chat_history}\n\nFollow Up Input: {question}\n\nStandalone question:',
                    },
                }
            );

            console.log('LangChain vector store initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    async query(question, chatHistory = []) {
        try {
            const response = await this.chain.call({
                question,
                chat_history: chatHistory,
            });

            return {
                answer: response.text,
                sources: response.sourceDocuments.map(doc => doc.pageContent),
            };
        } catch (error) {
            console.error('Query error:', error);
            throw error;
        }
    }
}

module.exports = new LangChainVectorStore();