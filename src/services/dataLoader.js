const fs = require('fs').promises;
const path = require('path');

class DataLoader {
    async loadCompanyData() {
        const dataPath = path.join(__dirname, '../../companydata.txt');
        const data = await fs.readFile(dataPath, 'utf8');
        
        const chunks = [];
        const words = data.split(' ');
        let currentChunk = '';
        
        for (const word of words) {
            if (currentChunk.length + word.length > 1000) {
                chunks.push(currentChunk);
                currentChunk = word;
            } else {
                currentChunk += ' ' + word;
            }
        }
        if (currentChunk) chunks.push(currentChunk);
        
        return chunks;
    }
}

module.exports = new DataLoader();