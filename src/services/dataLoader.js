const fs = require('fs').promises;
const path = require('path');

class DataLoader {
    async loadCompanyData() {
        const dataPath = path.join(__dirname, '../../companydata.txt');
        const data = await fs.readFile(dataPath, 'utf8');
        
        // Split by sections (##) while preserving headers for context
        const sections = data.split(/(?=##\s)/); 
        const chunks = [];
        
        for (const section of sections) {
            if (section.trim()) {
                // If section is too long, split it further by paragraphs
                if (section.length > 500) {
                    const paragraphs = section.split('\n\n');
                    let currentChunk = '';
                    
                    for (const paragraph of paragraphs) {
                        if (currentChunk.length + paragraph.length > 500) {
                            if (currentChunk) chunks.push(currentChunk.trim());
                            currentChunk = paragraph;
                        } else {
                            currentChunk += '\n\n' + paragraph;
                        }
                    }
                    if (currentChunk) chunks.push(currentChunk.trim());
                } else {
                    chunks.push(section.trim());
                }
            }
        }
        
        return chunks;
    }
}

module.exports = new DataLoader();