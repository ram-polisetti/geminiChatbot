from typing import List, Dict, Optional
from pathlib import Path

def format_bot_response(response: str, links: Optional[List[str]] = None) -> str:
    """Format the chatbot's response with categorized and deduplicated links."""
    formatted_response = response.strip()
    
    if links:
        # Extract topic from response for context-aware link filtering
        response_lower = response.lower()
        
        # Dynamically detect service types from response context
        service_keywords = {
            'erp': ['enterprise resource planning', 'erp', 'business process', 'workflow'],
            'crm': ['customer relationship', 'crm', 'sales', 'customer service'],
            'scm': ['supply chain', 'scm', 'inventory', 'logistics', 'procurement'],
            'hrm': ['human resource', 'hrm', 'workforce', 'employee', 'talent']
        }
        
        service_types = {}
        for service, keywords in service_keywords.items():
            service_types[service] = any(keyword in response_lower for keyword in keywords)
        
        # Group links by category and relevance
        company_links = []
        for link in links:
            link_lower = link.lower()
            # Skip social media and general resource links
            if any(sm in link_lower for sm in ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'privacy', 'terms', 'faq']):
                continue
            # Only include service-specific links when discussing specific services
            if any(service_types.values()):
                # If discussing ERP, only show ERP links
                if service_types['erp'] and 'erp' not in link_lower:
                    continue
                # For other services, show relevant service links
                elif any(stype for stype, mentioned in service_types.items() if mentioned and stype in link_lower):
                    company_links.append(link)
            else:
                company_links.append(link)
        
        resource_links = [link for link in links if any(res in link.lower() for res in ['privacy', 'terms', 'faq'])]
        social_links = [link for link in links if any(sm in link.lower() for sm in ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'])]
        
        # Add categorized links to response
        if any([company_links, resource_links, social_links]):
            formatted_response += "\n\nRelevant links:"
        
        if company_links:
            formatted_response += "\nCompany Information:"
            for link in sorted(set(company_links)):
                formatted_response += f"\n- {link}"
        
        if resource_links:
            formatted_response += "\nResources:"
            for link in sorted(set(resource_links)):
                formatted_response += f"\n- {link}"
        
        if social_links:
            formatted_response += "\nSocial Media:"
            for link in sorted(set(social_links)):
                formatted_response += f"\n- {link}"
    
    return formatted_response

def extract_links(text: str) -> List[str]:
    """Extract and categorize relevant links from the company data based on context."""
    # Initialize categories
    link_categories = {
        'social_media': set(),
        'resources': set(),
        'company_info': set()
    }
    
    # Process each line
    for line in text.split('\n'):
        if 'http://' in line or 'https://' in line:
            link = line.strip()
            # Categorize links
            if any(sm in link.lower() for sm in ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube']):
                link_categories['social_media'].add(link)
            elif any(res in link.lower() for res in ['privacy', 'terms', 'faq']):
                link_categories['resources'].add(link)
            else:
                link_categories['company_info'].add(link)
    
    # Combine all unique links in a structured order
    all_links = []
    if link_categories['company_info']:
        all_links.extend(sorted(link_categories['company_info']))
    if link_categories['resources']:
        all_links.extend(sorted(link_categories['resources']))
    if link_categories['social_media']:
        all_links.extend(sorted(link_categories['social_media']))
    
    return all_links

def validate_input(user_input: str) -> bool:
    """Validate and sanitize user input."""
    if not user_input or user_input.isspace():
        return False
    return True

def create_chat_prompt(question: str, context: List[str]) -> str:
    """Create a prompt for the Gemini model using the question and retrieved context."""
    context_text = '\n'.join(context)
    return f"""You are a customer service representative for CORtracker360. Use the following company information to provide accurate, helpful responses to customer inquiries. 

    Guidelines:
    1. Base your responses ONLY on the provided context
    2. For specific service inquiries, provide detailed information from the context
    3. Include relevant links when discussing specific services or features
    4. If information is not in the context, acknowledge this and ask for clarification
    5. Maintain a professional, helpful tone
    6. Format responses for readability with appropriate spacing and structure
    
    Company Context:
    {context_text}
    
    Customer Question: {question}
    
    Please provide a detailed, accurate response based on the above context:"""