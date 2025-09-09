const fs = require('fs-extra');
const path = require('path');
const pdf = require('pdf-parse');

class KnowledgeBuilder {
    constructor() {
        this.knowledgeBase = [];
        this.pdfFolder = './pdfs'; // Folder containing your PDFs
        this.outputFile = './knowledge-base.json';
    }

    async buildKnowledgeBase() {
        console.log('🚀 Starting knowledge base construction...');
        
        try {
            // Check if PDF folder exists
            if (!await fs.pathExists(this.pdfFolder)) {
                console.log(`📁 Creating PDF folder: ${this.pdfFolder}`);
                await fs.ensureDir(this.pdfFolder);
                console.log(`✅ Please place your PDF files in the '${this.pdfFolder}' folder and run this script again.`);
                return;
            }

            // Get all PDF files
            const files = await fs.readdir(this.pdfFolder);
            const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));
            
            if (pdfFiles.length === 0) {
                console.log(`❌ No PDF files found in '${this.pdfFolder}' folder.`);
                console.log(`📁 Please place your PDF files in the '${this.pdfFolder}' folder and run this script again.`);
                return;
            }

            console.log(`📚 Found ${pdfFiles.length} PDF file(s) to process:`);
            pdfFiles.forEach(file => console.log(`   - ${file}`));

            // Process each PDF
            for (const file of pdfFiles) {
                await this.processPDF(file);
            }

            // Save knowledge base
            await this.saveKnowledgeBase();
            
            console.log(`✅ Knowledge base built successfully!`);
            console.log(`📊 Total documents processed: ${this.knowledgeBase.length}`);
            console.log(`💾 Knowledge base saved to: ${this.outputFile}`);
            console.log(`🌐 You can now run 'npm start' to serve the Q&A interface.`);

        } catch (error) {
            console.error('❌ Error building knowledge base:', error.message);
        }
    }

    async processPDF(filename) {
        try {
            console.log(`📄 Processing: ${filename}`);
            
            const filePath = path.join(this.pdfFolder, filename);
            const dataBuffer = await fs.readFile(filePath);
            
            // Extract text from PDF
            const pdfData = await pdf(dataBuffer);
            const text = pdfData.text;
            
            if (!text || text.trim().length === 0) {
                console.log(`⚠️  Warning: No text extracted from ${filename}`);
                return;
            }

            // Check if this is a traffic safety related document
            const isTrafficSafetyDoc = this.isTrafficSafetyDocument(filename, text);
            
            if (!isTrafficSafetyDoc) {
                console.log(`⏭️  Skipping non-traffic safety document: ${filename}`);
                return;
            }

            // Split text into chunks for better processing
            const chunks = this.splitTextIntoChunks(text, 500); // 500 chars per chunk for faster processing
            
            // Create knowledge items for each chunk
            chunks.forEach((chunk, index) => {
                const knowledgeItem = {
                    id: `${filename}_${index}`,
                    content: chunk.trim(),
                    source: `📄 ${filename}`,
                    timestamp: new Date().toISOString(),
                    chunkIndex: index,
                    totalChunks: chunks.length
                };
                
                this.knowledgeBase.push(knowledgeItem);
            });

            console.log(`✅ Processed ${filename}: ${chunks.length} chunks created`);

        } catch (error) {
            console.error(`❌ Error processing ${filename}:`, error.message);
        }
    }

    isTrafficSafetyDocument(filename, text) {
        const filenameLower = filename.toLowerCase();
        const textLower = text.toLowerCase();
        
        // Traffic safety related terms
        const trafficTerms = [
            'verkeer', 'veiligheid', 'weg', 'fiets', 'voetganger', 'snelheid', 'verkeerslicht',
            'signalisatie', 'drempel', 'voorrang', 'schoolomgeving', 'vademecum', 'verkeersregel',
            'verkeersbord', 'verkeersdrempel', 'verkeersveiligheid', 'mobiliteit', 'verkeersstroom'
        ];
        
        // Check filename
        const filenameHasTrafficTerms = trafficTerms.some(term => filenameLower.includes(term));
        
        // Check content
        const contentHasTrafficTerms = trafficTerms.some(term => textLower.includes(term));
        
        // Exclude tunnel documents (they're not about road traffic)
        const isTunnelDoc = filenameLower.includes('tunnel') || textLower.includes('tunnel');
        
        return (filenameHasTrafficTerms || contentHasTrafficTerms) && !isTunnelDoc;
    }

    splitTextIntoChunks(text, chunkSize) {
        const chunks = [];
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        let currentChunk = '';
        
        for (const sentence of sentences) {
            const trimmedSentence = sentence.trim();
            if (!trimmedSentence) continue;
            
            // If adding this sentence would exceed chunk size, save current chunk
            if (currentChunk.length + trimmedSentence.length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = trimmedSentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
            }
        }
        
        // Add the last chunk if it has content
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }
        
        return chunks;
    }

    async saveKnowledgeBase() {
        const knowledgeData = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            totalDocuments: this.knowledgeBase.length,
            documents: this.knowledgeBase
        };

        await fs.writeJson(this.outputFile, knowledgeData, { spaces: 2 });
    }
}

// Run the knowledge builder
const builder = new KnowledgeBuilder();
builder.buildKnowledgeBase();
