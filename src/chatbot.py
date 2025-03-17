import os
import typer
import logging
from typing import List
from pathlib import Path
from dotenv import load_dotenv
import google.generativeai as genai
import chromadb
from data_loader import DataLoader
from embeddings import EmbeddingsGenerator
from utils import format_bot_response, extract_links, validate_input, create_chat_prompt

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class CompanyChatbot:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing CompanyChatbot")
        
        load_dotenv()
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            self.logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        try:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-pro')
            self.logger.info("Successfully configured Gemini model")
            
            # Initialize components
            self.data_loader = DataLoader()
            self.embeddings_generator = EmbeddingsGenerator()
            
            # Setup ChromaDB
            self.logger.info("Setting up ChromaDB")
            self.chroma_client = chromadb.Client()
            self.collection = self.chroma_client.create_collection(
                name="company_data",
                embedding_function=self.embeddings_generator.get_embedding_function()
            )
            self.logger.info("Successfully initialized ChromaDB collection")
            
            # Load and process data
            self.setup_knowledge_base()
            self.logger.info("CompanyChatbot initialization completed successfully")
        except Exception as e:
            self.logger.error(f"Error during CompanyChatbot initialization: {str(e)}")
            raise
    
    def setup_knowledge_base(self):
        """Load company data and create vector store."""
        self.logger.info("Setting up knowledge base")
        try:
            chunks = self.data_loader.process()
            self.collection.add(
                documents=chunks,
                ids=[f"chunk_{i}" for i in range(len(chunks))]
            )
            self.logger.info(f"Successfully added {len(chunks)} chunks to the knowledge base")
        except Exception as e:
            self.logger.error(f"Error setting up knowledge base: {str(e)}")
            raise
    
    def get_relevant_context(self, query: str, k: int = 5) -> List[str]:
        """Retrieve relevant context from the vector store."""
        self.logger.info(f"Retrieving context for query: {query}")
        try:
            # Increase context retrieval for better coverage
            results = self.collection.query(
                query_texts=[query],
                n_results=k
            )
            
            # Log retrieved documents for debugging
            self.logger.info(f"Successfully retrieved {len(results['documents'][0])} relevant documents")
            self.logger.debug(f"Retrieved documents: {results['documents'][0]}")
            
            # Filter and sort context by relevance
            relevant_docs = results['documents'][0]
            
            # Ensure we have meaningful context
            if not relevant_docs:
                self.logger.warning("No relevant context found in vector store")
                return ["I apologize, but I don't have enough information to answer your question accurately. Could you please provide more details or rephrase your question?"]
                
            return relevant_docs
        except Exception as e:
            self.logger.error(f"Error retrieving context: {str(e)}")
            raise
    
    def generate_response(self, question: str) -> str:
        """Generate a response using Gemini with RAG."""
        self.logger.info(f"Generating response for question: {question}")
        try:
            # Get relevant context
            context = self.get_relevant_context(question)
            
            # Create prompt with context
            prompt = create_chat_prompt(question, context)
            self.logger.debug(f"Created prompt with {len(context)} context chunks")
            
            # Generate response
            response = self.model.generate_content(prompt)
            self.logger.info("Successfully generated response from Gemini")
            
            # Extract any relevant links from the context
            links = extract_links('\n'.join(context))
            
            # Format the response with links
            formatted_response = format_bot_response(response.text, links)
            self.logger.info("Response formatted and ready")
            return formatted_response
        except Exception as e:
            self.logger.error(f"Error generating response: {str(e)}")
            raise

def main():
    logger = logging.getLogger(__name__)
    try:
        logger.info("Starting Company Customer Service Chatbot")
        print("Initializing Company Customer Service Chatbot...")
        chatbot = CompanyChatbot()
        print("Chatbot ready! Type 'quit' to exit.\n")
        
        while True:
            user_input = input("Customer: ").strip()
            
            if user_input.lower() == 'quit' or any(phrase in user_input.lower() for phrase in ['nothing', 'no help needed', "don't need help", 'no thanks']):
                logger.info("User indicated no help needed or requested to quit")
                print("\nThank you for using our customer service chatbot! Have a great day!")
                break
            
            if not validate_input(user_input):
                logger.warning(f"Invalid input received: {user_input}")
                print("Bot: Please enter a valid question.")
                continue
            
            try:
                logger.info(f"Processing user input: {user_input}")
                response = chatbot.generate_response(user_input)
                print(f"\nBot: {response}\n")
            except Exception as e:
                logger.error(f"Error processing user input: {str(e)}")
                print(f"\nBot: I apologize, but I encountered an error. Please try again.\n")
    
    except Exception as e:
        logger.error(f"Fatal error in main: {str(e)}")
        print(f"Error: {str(e)}")
        return

if __name__ == "__main__":
    typer.run(main)