const { ChromaClient } = require('chromadb');
const dataLoader = require('./dataLoader');  // Add this import

class VectorStore {
    constructor() {
        this.client = new ChromaClient({
            path: "http://localhost:8000"
        });
        this.collection = null;
    }

    async initialize() {
        const chunks = await dataLoader.loadCompanyData();
        this.collection = await this.client.createCollection('company_data');
        
        await this.collection.add({
            ids: chunks.map((_, i) => `chunk_${i}`),
            documents: chunks,
        });
    }

    async queryContext(question, k = 3) {
        return await this.collection.query({
            queryTexts: [question],
            nResults: k
        });
    }
}

module.exports = new VectorStore();