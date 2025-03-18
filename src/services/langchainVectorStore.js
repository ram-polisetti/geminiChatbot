const { ChromaClient } = require('chromadb');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Chroma } = require('@langchain/community/vectorstores/chroma');
const { RetrievalQAChain } = require('langchain/chains');
const { PromptTemplate } = require('@langchain/core/prompts');
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
        this.model = new ChatGoogleGenerativeAI({
            modelName: "gemini-1.5-pro",
            apiKey: process.env.GEMINI_API_KEY,
            temperature: 0,
            maxOutputTokens: 50,
            topK: 1,
            topP: 0,
            streaming: false
        });
        
        // Initialize embeddings with the dedicated GoogleGenerativeAIEmbeddings class
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            modelName: "embedding-001",
            taskType: "RETRIEVAL_QUERY"
        });

        this.vectorStore = null;
        this.chain = null;
    }

    async initialize() {
        try {
            console.log('Starting vector store initialization...');
            
            // Delete existing collection if it exists
            try {
                await this.client.deleteCollection({ name: 'company_data' });
                console.log('Deleted existing collection');
            } catch (error) {
                console.log('No existing collection to delete');
            }

            const chunks = await dataLoader.loadCompanyData();
            console.log(`Loaded ${chunks.length} data chunks`);
            
            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200
            });

            const documents = chunks.map(chunk => chunk.pageContent);
            const splitDocs = await textSplitter.createDocuments(documents);
            console.log(`Split into ${splitDocs.length} documents`);
            
            console.log('Creating new vector store...');
            this.vectorStore = await Chroma.fromDocuments(
                splitDocs,
                this.embeddings,
                {
                    collectionName: 'company_data',
                    url: 'http://localhost:8000'
                }
            );
            console.log('Vector store created successfully');

            console.log('Setting up retrieval chain...');
            const retriever = this.vectorStore.asRetriever({
                k: 1, // Reduce to 1 most relevant document for faster response
                searchType: "similarity"
            });

            const prompt = PromptTemplate.fromTemplate(
                `Answer the question using only the context provided. Be direct and brief (max 30 words).
                ---
                Context: {context}
                Question: {question}
                Answer:`
            );

            this.chain = RetrievalQAChain.fromLLM(
                this.model,
                retriever,
                {
                    returnSourceDocuments: true,
                    verbose: true,
                    prompt: prompt,
                    inputKey: "question",
                    outputKey: "text"
                }
            );
            console.log('Retrieval chain setup complete with custom prompt');

            console.log('LangChain vector store initialized successfully');
        } catch (error) {
            console.error('Initialization error:', error);
            throw error;
        }
    }

    async query(question) {
        try {
            console.log('Starting query processing for:', question);
            
            console.log('Retrieving relevant documents...');
            const docs = await this.vectorStore.similaritySearch(question, 1);
            console.log('Retrieved documents:', docs.length);

            const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
                .getGenerativeModel({ model: "gemini-1.5-pro" });

            const prompt = `Summarize in 10 words: ${docs[0].pageContent}`;
            console.log('Sending prompt to LLM...');

            const response = await Promise.race([
                model.generateContent(prompt),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Query timed out after 10 seconds')), 10000)
                )
            ]);

            const result = {
                answer: (await response.response).text(),
                sources: docs.map(doc => doc.pageContent)
            };
            console.log('Query processing completed successfully');

            return result;
        } catch (error) {
            console.error('Query error:', error);
            console.error('Error stack:', error.stack);
            if (error.message.includes('timed out')) {
                throw new Error('Request timed out. Please try again.');
            }
            throw error;
        }
    }
}

module.exports = new LangChainVectorStore();