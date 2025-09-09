class LocalAIQASystem {
    constructor() {
        this.knowledgeBase = this.loadKnowledgeBase();
        this.model = null;
        this.modelLoaded = false;
        this.initializeEventListeners();
        this.updateKnowledgeDisplay();
        this.loadModel();
    }

    async loadModel() {
        try {
            this.showStatus('AI model wordt gedownload... Dit kan even duren.', 'loading');
            
            // Wait for TensorFlow.js to be available
            let attempts = 0;
            while (!window.tfReady && attempts < 100) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.tfReady) {
                throw new Error('TensorFlow.js library niet geladen. Controleer je internetverbinding en probeer de pagina te refreshen.');
            }
            
            console.log('TensorFlow.js found, loading model...');
            
            // Load Universal Sentence Encoder model
            this.model = await use.load();
            console.log('Universal Sentence Encoder loaded');

            this.modelLoaded = true;
            this.showStatus('AI model geladen en klaar voor gebruik!', 'success');
            document.getElementById('askBtn').disabled = false;
            
        } catch (error) {
            console.error('Model loading error:', error);
            this.showStatus(`Fout bij laden AI model: ${error.message}`, 'error');
        }
    }

    initializeEventListeners() {
        document.getElementById('processBtn').addEventListener('click', () => this.processDocuments());
        document.getElementById('addUrlBtn').addEventListener('click', () => this.addUrl());
        document.getElementById('askBtn').addEventListener('click', () => this.askQuestion());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop support
        const fileLabel = document.querySelector('.file-label');
        fileLabel.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileLabel.classList.add('dragover');
        });
        fileLabel.addEventListener('dragleave', () => {
            fileLabel.classList.remove('dragover');
        });
        fileLabel.addEventListener('drop', (e) => {
            e.preventDefault();
            fileLabel.classList.remove('dragover');
            this.handleFileUpload({ target: { files: e.dataTransfer.files } });
        });
        
        // Enter key support
        document.getElementById('questionInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.askQuestion();
            }
        });
    }


    // File Upload Handler
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        this.showStatus('Bestanden worden verwerkt...', 'loading');

        try {
            for (let file of files) {
                const content = await this.extractTextFromFile(file);
                
                const knowledgeItem = {
                    id: Date.now().toString() + Math.random(),
                    content: content,
                    source: `📄 ${file.name}`,
                    timestamp: new Date().toISOString()
                };

                this.knowledgeBase.push(knowledgeItem);
            }

            this.saveKnowledgeBase();
            this.updateKnowledgeDisplay();
            this.showStatus(`${files.length} bestand(en) succesvol verwerkt!`, 'success');
            
            // Clear file input
            document.getElementById('fileInput').value = '';
        } catch (error) {
            this.showStatus(`Fout bij verwerken bestanden: ${error.message}`, 'error');
        }
    }

    // Extract text from different file types
    async extractTextFromFile(file) {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.pdf')) {
            return await this.extractTextFromPDF(file);
        } else if (fileName.endsWith('.txt')) {
            return await this.extractTextFromTXT(file);
        } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
            return await this.extractTextFromDOC(file);
        } else {
            throw new Error(`Bestandstype niet ondersteund: ${fileType}`);
        }
    }

    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const arrayBuffer = e.target.result;
                    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                    let fullText = '';
                    
                    // Extract text from all pages
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    
                    resolve(fullText.trim());
                } catch (error) {
                    reject(new Error(`PDF parsing fout: ${error.message}`));
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async extractTextFromTXT(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    }

    async extractTextFromDOC(file) {
        // For DOC/DOCX files, we'd need a library like mammoth.js
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const text = "DOC/DOCX bestand geüpload. Voor volledige ondersteuning is een DOC parser library nodig.";
                resolve(text);
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Document Processing
    async processDocuments() {
        const textInput = document.getElementById('textInput').value.trim();
        const urlInput = document.getElementById('urlInput').value.trim();
        
        if (!textInput && !urlInput) {
            this.showStatus('Voeg tekst of een URL toe om te verwerken', 'error');
            return;
        }

        this.showStatus('Documenten worden verwerkt...', 'loading');

        try {
            let content = '';
            let source = '';

            if (textInput) {
                content = textInput;
                source = 'Handmatig toegevoegde tekst';
            }

            if (urlInput) {
                const urlContent = await this.scrapeUrlWithSubdomains(urlInput);
                content += (content ? '\n\n' : '') + urlContent;
                source = urlInput;
            }

            // Store in knowledge base
            const knowledgeItem = {
                id: Date.now().toString(),
                content: content,
                source: source,
                timestamp: new Date().toISOString()
            };

            this.knowledgeBase.push(knowledgeItem);
            this.saveKnowledgeBase();
            this.updateKnowledgeDisplay();

            // Clear inputs
            document.getElementById('textInput').value = '';
            document.getElementById('urlInput').value = '';

            this.showStatus('Documenten succesvol verwerkt!', 'success');
        } catch (error) {
            this.showStatus(`Fout bij verwerken: ${error.message}`, 'error');
        }
    }

    async addUrl() {
        const urlInput = document.getElementById('urlInput').value.trim();
        if (!urlInput) {
            this.showStatus('Voer een geldige URL in', 'error');
            return;
        }

        this.showStatus('URL en subdomains worden verwerkt...', 'loading');

        try {
            const content = await this.scrapeUrlWithSubdomains(urlInput);
            
            const knowledgeItem = {
                id: Date.now().toString(),
                content: content,
                source: urlInput,
                timestamp: new Date().toISOString()
            };

            this.knowledgeBase.push(knowledgeItem);
            this.saveKnowledgeBase();
            this.updateKnowledgeDisplay();

            document.getElementById('urlInput').value = '';
            this.showStatus('URL en subdomains succesvol toegevoegd!', 'success');
        } catch (error) {
            this.showStatus(`Fout bij URL verwerken: ${error.message}`, 'error');
        }
    }

    // Web Scraping with Subdomain Support
    async scrapeUrlWithSubdomains(url) {
        try {
            const mainContent = await this.scrapeUrl(url);
            const subdomainContent = await this.scrapeSubdomains(url);
            
            return mainContent + (subdomainContent ? '\n\n--- SUBDOMAINS ---\n\n' + subdomainContent : '');
        } catch (error) {
            throw new Error(`Fout bij ophalen van URL en subdomains: ${error.message}`);
        }
    }

    // Web Scraping (using CORS proxy)
    async scrapeUrl(url) {
        try {
            // Try multiple CORS proxy services
            const proxies = [
                `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
                `https://cors-anywhere.herokuapp.com/${url}`,
                `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
            ];
            
            let lastError = null;
            
            for (let proxyUrl of proxies) {
                try {
                    const response = await fetch(proxyUrl);
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    let data;
                    if (proxyUrl.includes('allorigins.win')) {
                        data = await response.json();
                        if (!data.contents) {
                            throw new Error('Geen inhoud in response');
                        }
                        data = data.contents;
                    } else {
                        data = await response.text();
                    }

                    // Simple HTML to text conversion
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    
                    // Remove script and style elements
                    const scripts = doc.querySelectorAll('script, style, nav, header, footer');
                    scripts.forEach(el => el.remove());
                    
                    // Get text content
                    const text = doc.body.textContent || doc.body.innerText || '';
                    
                    // Clean up text
                    const cleanText = text.replace(/\s+/g, ' ').trim().substring(0, 5000);
                    
                    if (cleanText.length > 100) {
                        return cleanText;
                    }
                } catch (error) {
                    lastError = error;
                    console.log(`Proxy failed: ${proxyUrl} - ${error.message}`);
                    continue;
                }
            }
            
            throw new Error(`Alle proxies gefaald. Laatste fout: ${lastError?.message || 'Onbekende fout'}`);
        } catch (error) {
            throw new Error(`Fout bij ophalen van URL: ${error.message}`);
        }
    }

    // Scrape common subdomains
    async scrapeSubdomains(url) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const protocol = urlObj.protocol;
            
            // Only check most common subdomains
            const commonSubdomains = ['www', 'blog', 'docs'];
            
            let subdomainContent = '';
            let foundSubdomains = 0;
            
            // Limit to 2 subdomains to avoid overwhelming
            for (let subdomain of commonSubdomains.slice(0, 2)) {
                try {
                    const subdomainUrl = `${protocol}//${subdomain}.${domain}`;
                    console.log(`Trying subdomain: ${subdomainUrl}`);
                    
                    const content = await this.scrapeUrl(subdomainUrl);
                    
                    if (content && content.length > 100) {
                        subdomainContent += `\n--- ${subdomain.toUpperCase()} ---\n${content}\n`;
                        foundSubdomains++;
                        console.log(`Successfully scraped: ${subdomainUrl}`);
                    }
                } catch (error) {
                    console.log(`Subdomain failed: ${subdomain}.${domain} - ${error.message}`);
                    // Subdomain doesn't exist or can't be accessed, continue
                    continue;
                }
            }
            
            if (foundSubdomains > 0) {
                console.log(`Found ${foundSubdomains} subdomains`);
            }
            
            return subdomainContent;
        } catch (error) {
            console.log('Subdomain scraping failed:', error.message);
            // If subdomain scraping fails, return empty string
            return '';
        }
    }

    // Q&A Functionality with Local AI
    async askQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        
        if (!question) {
            this.showStatus('Voer een vraag in', 'error');
            return;
        }

        if (this.knowledgeBase.length === 0) {
            this.showStatus('Voeg eerst documenten toe aan de kennisbank', 'error');
            return;
        }

        if (!this.modelLoaded) {
            this.showStatus('AI model is nog niet geladen', 'error');
            return;
        }

        this.showStatus('AI denkt na over je vraag...', 'loading');
        document.getElementById('askBtn').disabled = true;

        try {
            const answer = await this.getLocalAIAnswer(question);
            this.displayAnswer(answer, question);
            this.showStatus('Antwoord gegenereerd!', 'success');
        } catch (error) {
            this.showStatus(`Fout bij genereren antwoord: ${error.message}`, 'error');
        } finally {
            document.getElementById('askBtn').disabled = false;
        }
    }

    async getLocalAIAnswer(question) {
        try {
            // Find the most relevant document using semantic similarity
            const relevantDoc = await this.findMostRelevantDocumentSemantic(question);
            
            if (!relevantDoc) {
                return {
                    answer: "Ik kan geen relevant antwoord vinden in de beschikbare documenten.",
                    confidence: 0,
                    source: "Geen bron gevonden"
                };
            }

            // Use simple text extraction for answer
            const answer = this.extractAnswerFromText(question, relevantDoc.content);
            
            return {
                answer: answer.text,
                confidence: answer.confidence,
                source: relevantDoc.source
            };
        } catch (error) {
            console.error('Error getting AI answer:', error);
            return {
                answer: "Er is een fout opgetreden bij het genereren van het antwoord.",
                confidence: 0,
                source: "Fout"
            };
        }
    }

    async findMostRelevantDocumentSemantic(question) {
        try {
            if (!this.model) {
                return this.findMostRelevantDocument(question);
            }

            // Get embeddings for the question
            const questionEmbedding = await this.model.embed([question]);
            
            let bestDoc = null;
            let bestScore = 0;

            // Compare with each document
            for (let doc of this.knowledgeBase) {
                // Get embeddings for document content (first 500 chars)
                const docText = doc.content.substring(0, 500);
                const docEmbedding = await this.model.embed([docText]);
                
                // Calculate cosine similarity
                const similarity = await this.cosineSimilarity(questionEmbedding, docEmbedding);
                
                if (similarity > bestScore) {
                    bestScore = similarity;
                    bestDoc = doc;
                }
            }

            return bestDoc;
        } catch (error) {
            console.error('Error in semantic search:', error);
            return this.findMostRelevantDocument(question);
        }
    }

    async cosineSimilarity(a, b) {
        // Calculate cosine similarity between two embeddings
        const dotProduct = tf.sum(tf.mul(a, b));
        const normA = tf.sqrt(tf.sum(tf.square(a)));
        const normB = tf.sqrt(tf.sum(tf.square(b)));
        const similarity = tf.div(dotProduct, tf.mul(normA, normB));
        
        const result = await similarity.data();
        return result[0];
    }

    extractAnswerFromText(question, content) {
        // Simple text extraction based on question keywords
        const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        
        let bestSentence = '';
        let bestScore = 0;
        
        for (let sentence of sentences) {
            const sentenceLower = sentence.toLowerCase();
            let score = 0;
            
            for (let word of questionWords) {
                if (sentenceLower.includes(word)) {
                    score += 1;
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestSentence = sentence.trim();
            }
        }
        
        if (bestSentence) {
            return {
                text: bestSentence,
                confidence: Math.min(bestScore / questionWords.length, 1)
            };
        }
        
        // Fallback: return first few sentences
        const fallback = sentences.slice(0, 2).join('. ').trim();
        return {
            text: fallback || "Geen specifiek antwoord gevonden in de tekst.",
            confidence: 0.3
        };
    }

    findMostRelevantDocument(question) {
        // Simple relevance scoring based on keyword matching
        let bestDoc = null;
        let bestScore = 0;

        for (let doc of this.knowledgeBase) {
            const score = this.calculateRelevanceScore(question, doc.content);
            if (score > bestScore) {
                bestScore = score;
                bestDoc = doc;
            }
        }

        return bestDoc;
    }

    calculateRelevanceScore(question, content) {
        const questionWords = question.toLowerCase().split(/\s+/);
        const contentWords = content.toLowerCase().split(/\s+/);
        
        let score = 0;
        for (let word of questionWords) {
            if (word.length > 3) { // Ignore short words
                const matches = contentWords.filter(w => w.includes(word)).length;
                score += matches;
            }
        }
        
        return score;
    }

    displayAnswer(answer, question) {
        const answerArea = document.getElementById('answer');
        
        if (typeof answer === 'string') {
            answerArea.innerHTML = `
                <div class="answer-content">
                    <h3>Vraag: ${question}</h3>
                    <p>${answer}</p>
                </div>
            `;
        } else {
            answerArea.innerHTML = `
                <div class="answer-content">
                    <h3>Vraag: ${question}</h3>
                    <p>${answer.answer}</p>
                    <div class="answer-source">
                        <strong>Bron:</strong> ${answer.source}<br>
                        <strong>Vertrouwen:</strong> ${Math.round(answer.confidence * 100)}%
                    </div>
                </div>
            `;
        }
        
        answerArea.classList.add('show');
    }

    // Knowledge Base Management
    loadKnowledgeBase() {
        const stored = localStorage.getItem('local_ai_qa_knowledge');
        return stored ? JSON.parse(stored) : [];
    }

    saveKnowledgeBase() {
        localStorage.setItem('local_ai_qa_knowledge', JSON.stringify(this.knowledgeBase));
    }

    updateKnowledgeDisplay() {
        const knowledgeList = document.getElementById('knowledgeList');
        
        if (this.knowledgeBase.length === 0) {
            knowledgeList.innerHTML = '<p>Nog geen documenten toegevoegd. Voeg tekst of URLs toe om te beginnen.</p>';
            return;
        }

        knowledgeList.innerHTML = this.knowledgeBase.map(item => `
            <div class="knowledge-item">
                <div>
                    <h4>${item.source}</h4>
                    <p>${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</p>
                    <div class="source">Toegevoegd: ${new Date(item.timestamp).toLocaleString()}</div>
                </div>
                <button class="delete-btn" onclick="localAI.deleteKnowledgeItem('${item.id}')">Verwijder</button>
            </div>
        `).join('');
    }

    deleteKnowledgeItem(id) {
        this.knowledgeBase = this.knowledgeBase.filter(item => item.id !== id);
        this.saveKnowledgeBase();
        this.updateKnowledgeDisplay();
        this.showStatus('Document verwijderd', 'success');
    }

    showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize the system
const localAI = new LocalAIQASystem();
