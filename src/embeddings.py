import logging
from typing import List
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from chromadb.api.types import Documents
from chromadb.utils.embedding_functions import EmbeddingFunction
from dotenv import load_dotenv
import os

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class CustomGeminiEmbeddingFunction(EmbeddingFunction):
    def __init__(self, api_key: str):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing CustomGeminiEmbeddingFunction")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=api_key
        )
        self.logger.info("CustomGeminiEmbeddingFunction initialized successfully")
    
    def __call__(self, input: Documents) -> List[List[float]]:
        self.logger.info(f"Generating embeddings for {len(input)} documents")
        try:
            embeddings = self.embeddings.embed_documents(input)
            self.logger.info(f"Successfully generated embeddings of shape {len(embeddings)}x{len(embeddings[0])}")
            return embeddings
        except Exception as e:
            self.logger.error(f"Error generating embeddings in CustomGeminiEmbeddingFunction: {str(e)}")
            raise

class EmbeddingsGenerator:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.logger.info("Initializing EmbeddingsGenerator")
        
        load_dotenv()
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            self.logger.error("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        try:
            self.embeddings = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=self.api_key
            )
            self.logger.info("EmbeddingsGenerator initialized successfully")
        except Exception as e:
            self.logger.error(f"Error initializing EmbeddingsGenerator: {str(e)}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of text chunks."""
        self.logger.info(f"Generating embeddings for {len(texts)} text chunks")
        try:
            embeddings = self.embeddings.embed_documents(texts)
            self.logger.info(f"Successfully generated embeddings of shape {len(embeddings)}x{len(embeddings[0])}")
            return embeddings
        except Exception as e:
            self.logger.error(f"Error generating embeddings: {str(e)}")
            raise
    
    def get_embedding_function(self):
        """Get the embedding function for ChromaDB."""
        self.logger.info("Creating CustomGeminiEmbeddingFunction for ChromaDB")
        try:
            embedding_function = CustomGeminiEmbeddingFunction(self.api_key)
            self.logger.info("Successfully created embedding function")
            return embedding_function
        except Exception as e:
            self.logger.error(f"Error creating embedding function: {str(e)}")
            raise