import logging
from pathlib import Path
from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

class DataLoader:
    def __init__(self, data_path: str = "../companydata.txt"):
        self.logger = logging.getLogger(__name__)
        self.data_path = Path(__file__).parent.parent / "companydata.txt"
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len
        )
        self.logger.info(f"DataLoader initialized with data path: {self.data_path}")
    
    def load_data(self) -> str:
        """Load the company data from the text file."""
        self.logger.info(f"Attempting to load data from {self.data_path}")
        if not self.data_path.exists():
            self.logger.error(f"Company data file not found at {self.data_path}")
            raise FileNotFoundError(f"Company data file not found at {self.data_path}")
        
        try:
            with open(self.data_path, 'r', encoding='utf-8') as file:
                data = file.read()
                self.logger.info(f"Successfully loaded {len(data)} characters of data")
                return data
        except Exception as e:
            self.logger.error(f"Error loading data: {str(e)}")
            raise
    
    def preprocess_data(self, text: str) -> List[str]:
        """Split the text into chunks for embedding."""
        self.logger.info(f"Preprocessing data of length {len(text)} characters")
        try:
            chunks = self.text_splitter.split_text(text)
            self.logger.info(f"Successfully split text into {len(chunks)} chunks")
            return chunks
        except Exception as e:
            self.logger.error(f"Error preprocessing data: {str(e)}")
            raise
    
    def process(self) -> List[str]:
        """Load and preprocess the company data."""
        self.logger.info("Starting data processing pipeline")
        try:
            raw_text = self.load_data()
            processed_chunks = self.preprocess_data(raw_text)
            self.logger.info("Data processing pipeline completed successfully")
            return processed_chunks
        except Exception as e:
            self.logger.error(f"Error in processing pipeline: {str(e)}")
            raise