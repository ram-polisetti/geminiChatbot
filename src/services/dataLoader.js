const fs = require('fs').promises;
const path = require('path');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');

class DataLoader {
    constructor() {
        this.dataPath = path.join(__dirname, '../../companydata.txt');
        this.textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        console.info(`DataLoader initialized with data path: ${this.dataPath}`);
    }

    async loadData() {
        console.info(`Attempting to load data from ${this.dataPath}`);
        try {
            const data = await fs.readFile(this.dataPath, 'utf8');
            console.info(`Successfully loaded ${data.length} characters of data`);
            return data;
        } catch (error) {
            console.error(`Error loading data: ${error.message}`);
            throw error;
        }
    }

    async preprocessData(text) {
        console.info(`Preprocessing data of length ${text.length} characters`);
        try {
            const chunks = await this.textSplitter.createDocuments([text]);
            console.info(`Successfully split text into ${chunks.length} chunks`);
            return chunks;
        } catch (error) {
            console.error(`Error preprocessing data: ${error.message}`);
            throw error;
        }
    }

    async loadCompanyData() {
        console.info('Starting data processing pipeline');
        try {
            const rawText = await this.loadData();
            const processedChunks = await this.preprocessData(rawText);
            console.info('Data processing pipeline completed successfully');
            return processedChunks;
        } catch (error) {
            console.error(`Error in processing pipeline: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new DataLoader();