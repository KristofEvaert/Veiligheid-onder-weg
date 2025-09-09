# Veiligheid op de Weg - AI Q&A Systeem

Een lokaal AI-aangedreven vraag-en-antwoord systeem voor verkeersveiligheid documenten. Het systeem werkt volledig offline en gebruikt TensorFlow.js voor intelligente documentverwerking.

## 🚀 Snelle Start

### 1. Installeer Dependencies
```bash
npm install
```

### 2. Plaats je PDF bestanden
- Maak een `pdfs` folder aan in de project root
- Plaats alle PDF bestanden over verkeersveiligheid in deze folder

### 3. Bouw de Kennisbank
```bash
npm run build
```
Dit proces:
- Leest alle PDF bestanden uit de `pdfs` folder
- Extraheert tekst uit elke PDF
- Splitst de tekst in beheersbare chunks
- Slaat alles op in `knowledge-base.json`

### 4. Start de Q&A Interface
```bash
npm start
```
- Open http://localhost:3000 in je browser
- Stel vragen over verkeersveiligheid!

## 📁 Project Structuur

```
veiligheidopde weg/
├── pdfs/                    # Plaats hier je PDF bestanden
├── knowledge-base.json      # Gegenereerde kennisbank (na build)
├── build-knowledge.js       # Script om PDFs te verwerken
├── server.js               # Express server voor Q&A interface
├── qa-interface.html       # Schone Q&A interface
├── qa-script.js           # AI logica voor Q&A
├── qa-styles.css          # Styling voor Q&A interface
└── package.json           # Dependencies
```

## 🎯 Features

- **Volledig Offline**: Geen API keys of internetverbinding nodig
- **PDF Verwerking**: Automatische tekst extractie uit PDF bestanden
- **Semantische Zoekfunctie**: Gebruikt Universal Sentence Encoder voor intelligente matching
- **Schone Interface**: Focus op Q&A zonder upload functionaliteit
- **Voorbeeld Vragen**: Voorgestelde vragen om te beginnen
- **Responsive Design**: Werkt op desktop en mobiel

## 🔧 Technische Details

- **AI Model**: Universal Sentence Encoder (TensorFlow.js)
- **PDF Verwerking**: pdf-parse (Node.js) voor betere compatibiliteit
- **Backend**: Express.js server
- **Frontend**: Vanilla JavaScript met TensorFlow.js
- **Data**: JSON-gebaseerde kennisbank

## 📝 Gebruik

### Kennisbank Bouwen
```bash
# Plaats PDFs in pdfs/ folder, dan:
npm run build
```

### Server Starten
```bash
npm start
# Open http://localhost:3000
```

### Voorbeeld Vragen
- "Wat zijn de snelheidslimieten in woonwijken?"
- "Wanneer moet je voorrang verlenen?"
- "Wat zijn de regels voor fietsers?"
- "Hoe werkt de verkeersdrempel?"

## 🔄 Workflow

1. **Voorbereiding**: Plaats PDF bestanden in `pdfs/` folder
2. **Build**: Run `npm run build` om kennisbank te genereren
3. **Deploy**: Run `npm start` om server te starten
4. **Gebruik**: Open browser en stel vragen!

## 🛠️ Aanpassingen

### Nieuwe PDFs Toevoegen
1. Plaats nieuwe PDF bestanden in `pdfs/` folder
2. Run `npm run build` opnieuw
3. Server herstarten met `npm start`

### Styling Aanpassen
- Bewerk `qa-styles.css` voor visuele aanpassingen
- Kleuren en thema's kunnen eenvoudig worden gewijzigd

## 🔒 Privacy & Beveiliging

- Alle verwerking gebeurt lokaal
- Geen data wordt naar externe servers gestuurd
- PDF bestanden blijven op je eigen server
- Volledige controle over je data

## 🌐 Browser Compatibiliteit

- Chrome/Edge: Volledige ondersteuning
- Firefox: Volledige ondersteuning
- Safari: Volledige ondersteuning
- Mobiele browsers: Ondersteund

## 🆘 Troubleshooting

**"Knowledge base not found"**:
- Run eerst `npm run build` om de kennisbank te genereren
- Zorg dat er PDF bestanden in de `pdfs/` folder staan

**"No PDF files found"**:
- Plaats PDF bestanden in de `pdfs/` folder
- Zorg dat bestanden de `.pdf` extensie hebben

**"Model download fout"**:
- Controleer je internetverbinding voor eerste download
- Probeer de pagina te refreshen

## 💰 Kosten

- **Volledig Gratis**: Geen API kosten
- **Eerste Download**: ~250MB AI model (eenmalig)
- **Offline Gebruik**: Onbeperkt na download
- **Geen Abonnement**: Geen maandelijkse kosten