class VeiligheidQA {
    constructor() {
        this.knowledgeBase = [];
        this.model = null;
        this.modelLoaded = false;
        this.initializeEventListeners();
        this.loadKnowledgeBase();
        this.loadModel();
    }

    async loadKnowledgeBase() {
        try {
            console.log('Loading knowledge base...');
            const response = await fetch('/api/knowledge');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.knowledgeBase = data.documents || [];
            
            console.log(`Knowledge base loaded: ${this.knowledgeBase.length} documents`);
            
            // Update UI
            document.getElementById('documentCount').textContent = this.knowledgeBase.length;
            
            if (this.knowledgeBase.length === 0) {
                this.showStatus('Geen documenten gevonden in kennisbank', 'error');
            }
            
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            this.showStatus(`Fout bij laden kennisbank: ${error.message}`, 'error');
        }
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
            document.getElementById('modelStatusText').textContent = 'Klaar voor vragen';
            
        } catch (error) {
            console.error('Model loading error:', error);
            this.showStatus(`Fout bij laden AI model: ${error.message}`, 'error');
        }
    }

    initializeEventListeners() {
        document.getElementById('askBtn').addEventListener('click', () => this.askQuestion());
        
        // Enter key support
        document.getElementById('questionInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.askQuestion();
            }
        });
    }

    async askQuestion() {
        const question = document.getElementById('questionInput').value.trim();
        
        if (!question) {
            this.showStatus('Voer een vraag in', 'error');
            return;
        }

        if (this.knowledgeBase.length === 0) {
            this.showStatus('Geen documenten beschikbaar in de kennisbank', 'error');
            return;
        }

        if (!this.modelLoaded) {
            this.showStatus('AI model is nog niet geladen', 'error');
            return;
        }

        this.showStatus('AI denkt na over je vraag...', 'loading');
        document.getElementById('askBtn').disabled = true;

        try {
            const answer = await this.getAIAnswer(question);
            this.displayAnswer(answer, question);
            this.showStatus('Antwoord gegenereerd!', 'success');
        } catch (error) {
            this.showStatus(`Fout bij genereren antwoord: ${error.message}`, 'error');
        } finally {
            document.getElementById('askBtn').disabled = false;
        }
    }

    async getAIAnswer(question) {
        try {
            // Find the most relevant document using semantic similarity
            const relevantDoc = await this.findMostRelevantDocumentSemantic(question);
            
            if (!relevantDoc) {
                return {
                    answer: "Ik kan geen relevant antwoord vinden in de beschikbare documenten over verkeersveiligheid.",
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

    showStatus(message, type) {
        const status = document.getElementById('modelStatus');
        status.textContent = message;
        status.className = `status ${type}`;
        
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 3000);
        } else {
            status.style.display = 'block';
        }
    }
}

// Global function for example questions
function fillQuestion(question) {
    document.getElementById('questionInput').value = question;
    document.getElementById('questionInput').focus();
}

// Initialize the system
const veiligheidQA = new VeiligheidQA();
