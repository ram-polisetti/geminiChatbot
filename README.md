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