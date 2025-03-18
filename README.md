# CORtracker360 Customer Service Chatbot

An intelligent chatbot implementation using Express.js, ChromaDB, and Google's Gemini API. The chatbot provides accurate responses about CORtracker360's products and services using RAG (Retrieval Augmented Generation) pattern.

## Features
- Express.js REST API endpoints for chat interactions
- ChromaDB for vector storage and similarity search
- Google Gemini API for natural language processing
- Context-aware responses using company data
- Automatic link extraction from responses
- Real-time response generation

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- Google Cloud Platform account with Gemini API access



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

## Project Structure
```plaintext
geminiChatbot/
├── src/
│   ├── api.js              # Express.js API endpoints
│   └── services/
│       ├── dataLoader.js   # Company data loading service
│       └── vectorStore.js  # ChromaDB integration
├── companytestdata.txt     # Company information
├── package.json
└── .env
```

## Usage
Start the server:
```bash
npm start
```

The API will be available at http://localhost:3000

Send a chat message:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Tell me about your ERP solution"}'
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
  "message": "AI-generated response",
  "links": ["relevant URLs from the context"]
}
```

### GET /api/health
Check API health status.

## How It Works
When a question is received, the system:
1. Searches ChromaDB for relevant context
2. Combines the context with the question
3. Uses Gemini to generate an informed response
4. Extracts and returns relevant links

The RAG pattern ensures responses are:
- Accurate to company information
- Context-aware
- Up-to-date with the latest data

## Development
For development with auto-reload:
```bash
npm run dev
```