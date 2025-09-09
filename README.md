# Local AI Q&A Systeem

Een volledig offline AI Q&A applicatie die werkt met je eigen documenten en websites. Geen API keys, geen server deployment nodig!

## 🚀 Features

- **Volledig Offline**: AI model draait lokaal in je browser
- **Geen API Kosten**: Volledig gratis na eerste download
- **Privacy**: Geen data naar externe servers
- **Document Upload**: PDF, TXT, DOC bestanden + URLs
- **Web Scraping**: Haalt automatisch informatie van websites op
- **Local Storage**: Bewaart je kennisbank lokaal in de browser
- **Responsive Design**: Werkt op desktop en mobiel
- **Static Deployment**: Alleen HTML, CSS, JavaScript - geen server nodig!

## 📋 Vereisten

- **Geen API keys nodig!**
- **Eerste download**: ~250MB AI model (eenmalig)
- **Moderne browser**: Chrome, Firefox, Safari, Edge
- **Internet**: Alleen voor eerste model download

## 🛠️ Installatie & Gebruik

### Optie 1: Direct Gebruiken
1. Download alle bestanden (`index.html`, `styles.css`, `script.js`)
2. Open `index.html` in je browser
3. Wacht tot het AI model is gedownload (~250MB)
4. Begin met het toevoegen van documenten!

### Optie 2: GitHub Pages Deployment
1. Upload bestanden naar een GitHub repository
2. Ga naar Settings > Pages
3. Selecteer "Deploy from a branch" > "main"
4. Je site is live op `https://[username].github.io/[repository-name]`

### Optie 3: Netlify Deployment
1. Sleep de bestanden naar https://app.netlify.com/drop
2. Je site krijgt automatisch een URL
3. Optioneel: verbind met GitHub voor automatische updates

## 💡 Hoe het Werkt

1. **AI Model Laden**:
   - Bij eerste gebruik wordt het AI model gedownload (~250MB)
   - Model wordt lokaal opgeslagen in je browser
   - Daarna werkt alles volledig offline

2. **Documenten Toevoegen**:
   - Upload PDF, TXT, DOC bestanden
   - Plak tekst in het tekstveld
   - Of voeg URLs toe voor automatische scraping
   - Klik "Verwerk Documenten"

3. **Vragen Stellen**:
   - Type je vraag in het vraagveld
   - Klik "Vraag Stellen" of Ctrl+Enter
   - Lokale AI geeft antwoord gebaseerd op je documenten

4. **Kennisbank Beheren**:
   - Bekijk alle toegevoegde documenten
   - Verwijder documenten die je niet meer nodig hebt

## 🔧 Technische Details

- **Frontend**: Pure HTML, CSS, JavaScript (geen frameworks)
- **AI Model**: TensorFlow.js met Universal Sentence Encoder
- **Storage**: Browser localStorage voor persistentie
- **Web Scraping**: CORS proxy voor URL scraping
- **PDF Support**: PDF.js voor tekst extractie
- **Responsive**: Mobile-first design

## 🔒 Privacy & Security

- **Volledig Offline**: Geen data naar externe servers
- **Lokale AI**: Alle verwerking gebeurt in je browser
- **Geen Tracking**: Geen analytics of tracking
- **Lokale Opslag**: Documenten blijven in je browser
- **Geen API Keys**: Geen externe credentials nodig

## 🆘 Troubleshooting

**"Model download fout"**:
- Controleer je internetverbinding
- Probeer de pagina te refreshen
- Zorg dat je browser up-to-date is

**"CORS Error" bij URL scraping**:
- Sommige websites blokkeren scraping
- Probeer een andere URL of voeg tekst handmatig toe

**"Geen antwoord"**:
- Zorg dat je documenten hebt toegevoegd
- Stel specifiekere vragen
- Controleer of je vraag relevant is voor je documenten
- Wacht tot het AI model volledig is geladen

## 💰 Kosten

- **Volledig Gratis**: Geen API kosten
- **Eerste Download**: ~250MB (eenmalig)
- **Offline Gebruik**: Onbeperkt na download
- **Geen Abonnement**: Geen maandelijkse kosten

## 🎯 Gebruik Cases

- **Onderzoek**: Q&A over wetenschappelijke papers
- **Bedrijfsdocumenten**: Vragen over procedures en policies
- **Educatie**: Studiehulp met eigen materiaal
- **Content Creatie**: Research voor artikelen en blogs
- **Persoonlijke Kennisbank**: Organiseer en doorzoek je eigen informatie

## 🔄 Updates

Deze applicatie is volledig client-side, dus updates vereisen:
1. Download nieuwe bestanden
2. Vervang oude bestanden
3. Refresh je browser

Of bij GitHub Pages/Netlify: push nieuwe commits voor automatische updates.
