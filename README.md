# CORtracker360 Chatbot

A company customer service chatbot built with Express.js, LangChain, and Gemini AI.

## Installation

1. Clone the repository
2. Install dependencies:
```bash
# Option 1: Standard installation (if it works)
npm install

# Option 2: If you encounter peer dependency issues
npm install --legacy-peer-deps
```

3. Create a `.env` file with your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
PORT=3000
```

## Running the Application

1. Start the ChromaDB server:
```bash
chroma run --path ./chromadb
```

2. In a new terminal, start the application:
```bash
npm run dev
```

## Known Issues

### Peer Dependency Conflicts

There are currently peer dependency conflicts between some of the LangChain packages. This is a known issue that will be resolved when these packages are updated. For now, you can use `npm install --legacy-peer-deps` to install the dependencies.

The specific conflict is between:
- @langchain/community@0.3.36 requiring @mendable/firecrawl-js@^1.4.3
- langchain@0.1.37 requiring @mendable/firecrawl-js@^0.0.13

This will be resolved in future updates of these packages.

## Dependencies

- @langchain/community: ^0.3.36
- @langchain/core: ^0.3.42
- @langchain/google-genai: ^0.0.10
- chromadb: ^1.10.5
- cors: ^2.8.5
- dotenv: ^16.4.7
- express: ^4.21.2
- langchain: ^0.1.25
- nodemon: ^3.0.2 (dev dependency)
# CORtracker360 Customer Service Chatbot

An intelligent chatbot implementation using Express.js, ChromaDB, and Google's Gemini API. The chatbot provides accurate responses about CORtracker360's products and services using RAG (Retrieval Augmented Generation) pattern.

## Features
- Express.js REST API endpoints for chat interactions
- Local ChromaDB instance for vector storage and similarity search
- Google Gemini Pro 1.5 API for natural language processing and embeddings
- Context-aware responses using company data
- Automatic link extraction from responses
- Real-time response generation
- Rate limiting and retry mechanisms for API stability
- Batch processing for efficient data ingestion

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Google Cloud Platform account with Gemini API access
- Local storage space for ChromaDB (approximately 1GB recommended)

## Dependencies
```json
{
  "@google/generative-ai": "^0.2.0",
  "chromadb": "^1.8.1",
  "dotenv": "^16.4.0",
  "express": "^4.18.2"
}
```

## Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd geminiChatbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

4. Prepare your company data:
- Place your company information in `companydata.txt`
- Format the data in clear, concise paragraphs
- Include relevant URLs and product information

## Functionality Details

**Core Service Implementations**

`src/services/vectorStore.js`
```javascript
class VectorStore {
  /**
   * Initializes ChromaDB connection and Gemini embedding function
   * @param {object} config - Configuration object
   * @param {string} config.collectionName - Name for vector collection
   * @param {number} config.batchSize - Documents per embedding batch (default: 5)
   */
  constructor(config) {
    // ChromaDB client setup
    this.client = new ChromaClient();
    // Gemini embedding generator
    this.embeddingFunction = new GeminiEmbeddingFunction({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  /**
   * Creates/loads vector collection with error handling
   * Processes documents in batches with rate limiting
   * @param {Array} documents - Company data chunks from dataLoader
   * @param {number} [retries=3] - Max retry attempts for failed batches
   */
  async initialize(documents, retries = 3) {
    // Implementation details...
  }

  /**
   * Handles context query with error tracking
   * @param {string} query - User's search query
   * @param {number} [topK=3] - Number of similar contexts to retrieve
   * @returns {Array} Relevant context chunks with metadata
   */
  async queryContext(query, topK = 3) {
    // Implementation details...
  }
}
```

`src/services/langchainVectorStore.js`
- `constructor()`: Configures LangChain components with optimized parameters
- `initialize()`: Implements document splitting, batch processing, and retrieval chain setup
- `query()`: Executes hybrid search with timeout handling and source tracking

`src/services/dataLoader.js`
```javascript
class DataLoader {
  /**
   * Parses company data into structured chunks
   * @param {string} filePath - Path to companydata.txt
   * @param {number} [chunkSize=1000] - Character count per chunk
   * @param {number} [overlap=200] - Overlap between chunks
   * @returns {Array} Structured document chunks with metadata
   */
  async loadCompanyData(filePath, chunkSize = 1000, overlap = 200) {
    // File processing implementation...
  }

  /**
   * Validates chunks before ingestion
   * @private
   * @param {Array} chunks - Document chunks to validate
   * @throws {Error} If invalid chunk structure detected
   */
  validateChunks(chunks) {
    // Validation logic...
  }
}
```

`src/api.js`
```javascript
// API endpoint configuration
const api = express.Router();

/**
 * Chat endpoint - Orchestrates request flow
 * @route POST /api/chat
 * @param {object} req.body - Request body
 * @param {string} req.body.message - User's query message
 * @returns {object} AI response with links and formatted message
 */
api.post('/chat', rateLimiter, async (req, res) => {
  // Endpoint implementation...
});

/**
 * Structures final API response
 * @param {string} rawResponse - Raw AI response text
 * @param {Array} sources - Context sources from vector store
 * @returns {object} Formatted response with links
 */
function formatResponse(rawResponse, sources) {
  // Response formatting logic...
}
```

## Project Structure
```plaintext
geminiChatbot/
├── src/
│   ├── api.js              # Express.js API endpoints
│   └── services/
│       ├── dataLoader.js   # Company data loading service
│       └── vectorStore.js  # ChromaDB integration and embedding generation
├── companydata.txt         # Company information
├── package.json
└── .env
```

## Implementation Details

### ChromaDB Setup
- Uses local ChromaDB instance (no Docker required)
- Automatically creates and manages collections
- Implements custom embedding function using Gemini Pro
- Stores embeddings locally for fast retrieval

### Rate Limiting & Error Handling
- Implements exponential backoff for API rate limits
- Maximum 3 retries for failed embedding generations
- 2-second delay between batch processing
- Batch size of 5 documents for optimal processing

### Data Processing
- Automatic chunking of company data
- Vector embeddings generated using Gemini Pro
- Efficient batch processing with rate limit consideration
- Automatic collection management and cleanup

## Usage
1. Start the server:
```bash
npm start
```

2. The API will be available at http://localhost:3000

3. Interact with the API:

### Chat Examples

**Basic Query:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about your ERP solution"}'
```

**Product Features Query:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the key features of your inventory management system?"}'
```

**Pricing Information Query:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Can you explain your pricing tiers?"}'
```

**Integration Query:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How can I integrate your system with my existing software?"}'
```

### Health Check
```bash
curl http://localhost:3000/api/health
```

## API Endpoints

### POST /api/chat
Send a message to the chatbot.

Request body:
```json
{
  "message": "your question here"
}
```

Response:
```json
{
  "message": "AI-generated response with detailed information about your query",
  "links": [
    "https://example.com/relevant-documentation",
    "https://example.com/feature-details"
  ]
}
```

Example Response:
```json
{
  "message": "Our ERP solution offers comprehensive inventory management with real-time tracking, automated reordering, and detailed analytics. The system integrates seamlessly with major e-commerce platforms and includes features like barcode scanning and multi-warehouse management.",
  "links": [
    "https://cortracker360.com/inventory-management",
    "https://cortracker360.com/integration-guide"
  ]
}
```

### GET /api/health
Check API health status.

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:45Z"
}
```

## How It Works
1. Initial Setup:
   - Loads company data from text file
   - Chunks text into manageable segments
   - Generates embeddings using Gemini Pro
   - Stores vectors in local ChromaDB

2. Query Processing:
   - Receives user question via API
   - Converts question to embedding
   - Searches ChromaDB for relevant contexts
   - Retrieves top 3 most similar contexts

3. Response Generation:
   - Combines user question with retrieved contexts
   - Sends to Gemini Pro for response generation
   - Extracts relevant links from response
   - Returns formatted response to user

## Development
For development with auto-reload:
```bash
npm run dev
```

## Troubleshooting
- If embedding generation fails, check your Gemini API key and quotas
- For ChromaDB errors, ensure sufficient disk space and permissions
- Rate limit errors will auto-retry, but may need longer delays between requests
- Memory issues may require reducing batch size in vectorStore.js

## Performance Considerations
- Initial data loading may take time due to rate limits
- Response time depends on context retrieval and Gemini API latency
- Local ChromaDB instance provides faster vector searches
- Batch processing optimizes initial data ingestion