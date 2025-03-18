const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { ConversationalRetrievalQAChain } = require('langchain/chains');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
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
        this.model = new ChatGoogleGenerativeAI({ modelName: "gemini-pro", apiKey: process.env.GEMINI_API_KEY });
        
        // Initialize embeddings with the dedicated GoogleGenerativeAIEmbeddings class
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "gemini-pro",
            taskType: "RETRIEVAL_QUERY"
        });

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

            const documents = chunks.map(chunk => chunk.pageContent);
            const splitDocs = await textSplitter.createDocuments(documents);
            
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