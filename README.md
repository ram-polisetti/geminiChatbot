# Company Customer Service Chatbot

A versatile chatbot that serves as a customer service agent for company website visitors. The chatbot uses Google's Gemini API along with LangChain and RAG (Retrieval Augmented Generation) to provide accurate responses based on company data. Available as both a terminal-based application and a web interface through a REST API.

## Features

- Dual interface support:
  - Terminal-based interactive chat
  - Web-based interface with REST API
- Uses company data from text file as knowledge base
- Implements RAG pattern with Chroma vector database
- Provides relevant product/service information
- Redirects users to appropriate resources with automatic link extraction
- Intelligent context retrieval and response generation
- Automatic link extraction and formatting

## Tech Stack

- Python 3.9+
- Google Gemini API (gemini-1.5-pro model)
- LangChain Community for text processing
- ChromaDB for vector storage
- FastAPI for REST API
- HTML/JavaScript for web interface
- RAG (Retrieval Augmented Generation)

## Project Structure

```
├── .env                  # Environment variables (API keys)
├── companydata.txt       # Company products and services information
├── requirements.txt      # Project dependencies
├── src/
│   ├── api.py           # REST API implementation
│   ├── chatbot.py       # Main chatbot implementation
│   ├── data_loader.py   # Data loading and preprocessing
│   ├── embeddings.py    # Vector embeddings generation
│   ├── static/          # Web interface files
│   │   └── index.html   # Web UI
│   └── utils.py         # Utility functions
```

## Component Details

### chatbot.py
- Main chatbot implementation using the CompanyChatbot class
- Core Components:
  - `__init__()`: Initializes Gemini API, ChromaDB, and other components
  - `setup_knowledge_base()`: Loads and processes company data into vector store
  - `get_relevant_context(query: str, k: int = 3)`: Retrieves top-k similar contexts
  - `generate_response(question: str)`: Implements RAG pattern for response generation
  - Exception handling and logging throughout

### api.py
- FastAPI-based REST API implementation
- Endpoints:
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

## Setup Instructions

1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies: `pip install -r requirements.txt`
4. Set up environment variables in `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
5. Add your company data to `companydata.txt`
6. Choose how to run the chatbot:
   - Terminal interface: `python src/chatbot.py`
   - Web interface: `python src/api.py` then visit http://localhost:8000

## Usage

### Terminal Interface
The chatbot implements a sophisticated RAG pattern:
1. User inputs a question
2. System retrieves relevant context from the knowledge base
3. Context is combined with the question to generate an accurate response
4. Any relevant links are automatically extracted and included

### Web Interface
1. Access the web interface at http://localhost:8000
2. Type your question in the chat input
3. Receive responses in a conversational format
4. Links are automatically formatted as clickable elements