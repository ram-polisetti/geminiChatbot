# Company Customer Service Chatbot

An intelligent chatbot service that acts as a customer service representative for CORtracker360. Built with Express.js and Google's Gemini AI, this chatbot provides accurate responses about company products and services using RAG (Retrieval Augmented Generation) with ChromaDB for efficient information retrieval.

## Features

- RESTful API built with Express.js
- Integration with Google Gemini AI (gemini-1.5-pro model)
- Vector-based document retrieval using ChromaDB
- Automatic context-aware response generation
- Intelligent link extraction and categorization
- CORS-enabled for cross-origin requests
- Comprehensive error handling and logging

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- Google Cloud Platform account with Gemini API access
- ChromaDB (will be installed automatically)

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

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000 # Optional, defaults to 3000
```

## Project Structure

```
├── src/
│   ├── app.js                 # Express server and API routes
│   ├── embeddings.service.js  # Embeddings generation and ChromaDB integration
│   ├── logger.js             # Logging configuration
│   └── static/               # Static web interface files
│       └── index.html        # Web UI
├── package.json              # Project dependencies and scripts
└── .env                      # Environment variables
```

## API Endpoints

### POST /api/chat
Send a message to the chatbot.

**Request Body:**
```json
{
    "message": "Tell me about your ERP solutions"
}
```

**Response:**
```json
{
    "response": "Detailed response about ERP solutions with relevant links"
}
```

### GET /api/health
Check the API health status.

**Response:**
```json
{
    "status": "healthy"
}
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Access the web interface:
Open `http://localhost:3000` in your browser

## Error Handling

The application includes comprehensive error handling:
- Input validation
- API rate limiting
- Graceful error responses
- Detailed error logging

## Logging

Logs are stored in the `logs` directory:
- `combined.log`: All log levels
- `error.log`: Error-level logs only

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| GEMINI_API_KEY | Google Gemini API key | Yes |
| PORT | Server port (default: 3000) | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
  - `POST /chat`: Accepts chat messages and returns bot responses
  - `GET /`: Serves the web interface
- CORS support for web client integration

### data_loader.py
- Handles data processing through DataLoader class
- Key Functions:
  - `load_data() -> str`: Reads and validates company data file
  - `preprocess_data(text: str) -> List[str]`: Chunks text using RecursiveCharacterTextSplitter
  - `process() -> List[str]`: Orchestrates the complete data processing pipeline
- Configurable chunk size (1000) and overlap (200) for optimal context windows

### embeddings.py
- Manages embeddings through two main classes:
  - CustomGeminiEmbeddingFunction:
    - Implements ChromaDB's EmbeddingFunction interface
    - Handles batch document embedding
  - EmbeddingsGenerator:
    - `generate_embeddings(texts: List[str]) -> List[List[float]]`: Creates text embeddings
    - `get_embedding_function()`: Returns ChromaDB-compatible embedding function
- Uses Gemini's embedding-001 model

### utils.py
- Utility functions for response handling:
  - `format_bot_response(response: str, links: Optional[List[str]])`: Formats responses with links
  - `extract_links(text: str) -> List[str]`: Identifies and extracts URLs from context
  - `validate_input(user_input: str) -> bool`: Sanitizes user input
  - `create_chat_prompt(question: str, context: List[str])`: Builds structured prompts

## Implementation Progress

- [x] Project structure setup
- [x] Environment configuration
- [x] Data loading and preprocessing
- [x] Vector database setup with Chroma
- [x] RAG implementation
- [x] Chatbot interface development
- [x] REST API implementation
- [x] Web interface development
- [ ] Testing and refinement

## Usage

1. Clone the repository:
```bash
git clone <repository-url>
cd geminiChatbot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000 # Optional, defaults to 3000
```

4. Start the development server:
```bash
npm run dev
```

5. Access the web interface at http://localhost:3000

The chatbot implements a sophisticated RAG pattern:
1. User inputs a question through the web interface
2. System retrieves relevant context from the ChromaDB knowledge base
3. Context is combined with the question to generate an accurate response using Gemini AI
4. Any relevant links are automatically extracted and included in the response