from typing import List, Dict, Optional
from pathlib import Path

def format_bot_response(response: str, links: Optional[List[str]] = None) -> str:
    """Format the chatbot's response with any relevant redirect links."""
    formatted_response = response.strip()
    
    if links:
        formatted_response += "\n\nRelevant links:\n"
        for link in links:
            formatted_response += f"- {link}\n"
    
    return formatted_response

def extract_links(text: str) -> List[str]:
    """Extract relevant links from the company data based on context."""
    # This is a placeholder implementation
    # In a real application, this would use regex or URL parsing
    links = []
    for line in text.split('\n'):
        if 'http://' in line or 'https://' in line:
            links.append(line.strip())
    return links

def validate_input(user_input: str) -> bool:
    """Validate and sanitize user input."""
    if not user_input or user_input.isspace():
        return False
    return True

def create_chat_prompt(question: str, context: List[str]) -> str:
    """Create a prompt for the Gemini model using the question and retrieved context."""
    context_text = '\n'.join(context)
    return f"""Based on the following company information, please answer the customer's question.
    If the information is not in the provided context, politely say so.
    
    Context:
    {context_text}
    
    Customer Question: {question}
    
    Answer:"""