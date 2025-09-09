const express = require('express');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// API endpoint to get knowledge base
app.get('/api/knowledge', async (req, res) => {
    try {
        // Use the real traffic safety knowledge base
        const knowledgePath = './traffic-safety-knowledge.json';
        
        if (!await fs.pathExists(knowledgePath)) {
            return res.status(404).json({ 
                error: 'Traffic safety knowledge base not found.' 
            });
        }
        
        const knowledgeBase = await fs.readJson(knowledgePath);
        res.json(knowledgeBase);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint to check answers
app.get('/api/test/:question', async (req, res) => {
    try {
        const question = decodeURIComponent(req.params.question);
        console.log(`Testing question: ${question}`);
        
        // Simple keyword matching test
        const knowledgePath = './traffic-safety-knowledge.json';
        const knowledgeBase = await fs.readJson(knowledgePath);
        
        let bestDoc = null;
        let bestScore = 0;
        
        // Search first 100 documents for speed
        const searchLimit = Math.min(100, knowledgeBase.documents.length);
        
        for (let i = 0; i < searchLimit; i++) {
            const doc = knowledgeBase.documents[i];
            const score = calculateRelevanceScore(question, doc.content);
            if (score > bestScore) {
                bestScore = score;
                bestDoc = doc;
            }
        }
        
        if (bestDoc) {
            const answer = extractAnswerFromText(question, bestDoc.content);
            res.json({
                question: question,
                answer: answer.text,
                confidence: answer.confidence,
                source: bestDoc.source,
                score: bestScore
            });
        } else {
            res.json({
                question: question,
                answer: "Geen relevant antwoord gevonden",
                confidence: 0,
                source: "Geen bron",
                score: 0
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper functions for testing
function calculateRelevanceScore(question, content) {
    const questionWords = question.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    
    // Boost score for traffic safety related terms
    const trafficTerms = ['snelheid', 'limiet', 'woonwijk', 'verkeer', 'veiligheid', 'weg', 'fiets', 'voetganger', 'verkeerslicht', 'drempel', 'voorrang', 'regel'];
    const questionHasTrafficTerms = questionWords.some(word => trafficTerms.includes(word));
    
    if (questionHasTrafficTerms) {
        // Check if content also has traffic safety terms
        const contentHasTrafficTerms = trafficTerms.some(term => contentLower.includes(term));
        if (contentHasTrafficTerms) {
            score += 10; // Big boost for traffic safety content
        }
    }
    
    // Regular keyword matching
    for (let word of questionWords) {
        if (word.length > 3) {
            const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
            score += matches;
        }
    }
    
    // Penalty for irrelevant content
    const irrelevantTerms = ['arbeidswetgeving', 'concentratie', 'hulpdiensten', 'onderhoud', 'interventie'];
    const hasIrrelevantTerms = irrelevantTerms.some(term => contentLower.includes(term));
    if (hasIrrelevantTerms) {
        score -= 5;
    }
    
    return Math.max(0, score);
}

function extractAnswerFromText(question, content) {
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
    
    const fallback = sentences.slice(0, 2).join('. ').trim();
    return {
        text: fallback || "Geen specifiek antwoord gevonden in de tekst.",
        confidence: 0.3
    };
}

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'qa-interface.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Q&A Server running at http://localhost:${PORT}`);
    console.log(`📚 Make sure you've run 'npm run build' to create the knowledge base first!`);
});
