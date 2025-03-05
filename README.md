# Company Customer Service Chatbot

A terminal-based prototype chatbot that serves as a customer service agent for company website visitors. The chatbot uses Google's Gemini API along with LangChain and RAG (Retrieval Augmented Generation) to provide accurate responses based on company data.

## Features

- Terminal-based interactive chat interface
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
- RAG (Retrieval Augmented Generation)

## Project Structure

```
├── .env                  # Environment variables (API keys)
├── companydata.txt       # Company products and services information
├── requirements.txt      # Project dependencies
├── src/
│   ├── chatbot.py       # Main chatbot implementation
│   ├── data_loader.py    # Data loading and preprocessing
│   ├── embeddings.py     # Vector embeddings generation
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
6. Run the chatbot: `python src/chatbot.py`

## Usage

The chatbot implements a sophisticated RAG pattern:
1. Data Processing:
   - Loads company data from `companydata.txt`
   - Splits text into chunks of 1000 characters with 200-character overlap
   - Generates embeddings using Gemini's embedding-001 model

2. Vector Storage:
   - Creates ChromaDB collection for efficient similarity search
   - Stores document chunks with their embeddings
   - Enables fast context retrieval

3. Query Processing:
   - When a user asks a question:
     a. Question is embedded using the same model
     b. Top-3 most relevant context chunks are retrieved
     c. Context is combined with question in a structured prompt
     d. Gemini model generates response using the enhanced context
     e. Links are automatically extracted and formatted

4. Response Generation:
   - Maintains conversation context
   - Provides relevant product/service information
   - Includes helpful resource links when available
   - Handles edge cases and invalid inputs gracefully

Users can interact with the chatbot through the terminal, asking questions about products and services. The chatbot provides context-aware responses and relevant redirect links based on the query context.