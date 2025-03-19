# CORtracker360 Customer Service Chatbot

An intelligent customer service chatbot built with Express.js, LangChain, and Google's Gemini API. The chatbot provides accurate responses about CORtracker360's products and services using RAG (Retrieval Augmented Generation) pattern.

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

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ram-polisetti/geminiChatbot.git
cd geminiChatbot
```

2. Install dependencies:
```bash
# Option 1: Standard installation
npm install

# Option 2: If you encounter peer dependency issues
npm install --legacy-peer-deps
```

3. Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

4. Prepare your company data:
- Place your company information in `companydata.txt`
- Format the data in clear, concise paragraphs
- Include relevant URLs and product information

## Running the Application

1. Start the ChromaDB server:
```bash
chroma run --path ./chromadb
```

2. In a new terminal, start the application:
```bash
npm run dev
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

## Core Components

### VectorStore Service
Handles ChromaDB integration and embedding generation:
- Initializes ChromaDB connection
- Manages document embedding with Gemini Pro
- Implements batch processing and error handling
- Provides context-aware query functionality

### DataLoader Service
Manages company data processing:
- Parses and chunks company information
- Validates data structure
- Handles efficient batch processing

### API Endpoints

#### POST /api/chat
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

#### GET /api/health
Check API health status.

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:45Z"
}
```

## Example Usage

### Basic Query
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about your ERP solution"}'
```

### Product Features Query
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the key features of your inventory management system?"}'
```

## Technical Details

### How It Works
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

### Performance Optimization
- Local ChromaDB instance for fast vector searches
- Batch processing for efficient data ingestion
- Rate limiting with exponential backoff
- Configurable chunk size and overlap

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

### Known Issues
There are currently peer dependency conflicts between some of the LangChain packages:
- @langchain/community@0.3.36 requiring @mendable/firecrawl-js@^1.4.3
- langchain@0.1.37 requiring @mendable/firecrawl-js@^0.0.13

This will be resolved in future updates. For now, use `npm install --legacy-peer-deps`.

## Troubleshooting
- If embedding generation fails, check your Gemini API key and quotas
- For ChromaDB errors, ensure sufficient disk space and permissions
- Rate limit errors will auto-retry, but may need longer delays between requests
- Memory issues may require reducing batch size in vectorStore.js