# GTR4 Amazfit App - ZeppOS 3.0

### 🚀 App di Sviluppo per Amazfit GTR4 con ZeppOS 3.0

Questo progetto è una raccolta di applicazioni personalizzate sviluppate per l'orologio **Amazfit GTR4** utilizzando **ZeppOS 3.0** e **JavaScript**.

## 📌 Descrizione
Il progetto include quattro applicazioni con funzionalità diverse:
- **Ricerca Pullman**: Mostra i pullman in arrivo ad una fermata specifica tramite API.
- **Ricezione Immagini**: App per ricevere e visualizzare immagini inviate dal telefono.
- **Test App 1**: Applicazione di test per le funzionalità di base.
- **Test App 2**: Applicazione di test per la sincronizzazione di dati.

## 🔧 Tecnologie utilizzate
- ZeppOS SDK 3.0
- JavaScript (ES6)
- CSS per la UI
- JSON per la gestione dei dati

## 📁 Struttura del progetto
```
├─ gttApp/
│  ├─ app.js            # Logica principale
│  ├─ ui.js             # Interfaccia utente
│  └─ config.json       # Configurazioni API
├─ image dowloader/
│  ├─ app.js            # Ricezione e visualizzazione immagini
│  ├─ ui.js             # Interfaccia utente
│  └─ config.json       # Configurazioni immagine
├─ test-app-1/
│  ├─ app.js            # Test funzionalità base
└─ test-app-2/
   ├─ app.js            # Test sincronizzazione dati
```

## ⚙️ Installazione
1. Clonare la repository:
```bash
  git clone https://github.com/albertobor/gtr4-zepp-app.git
  cd gtr4-zepp-app
```
2. Installare le dipendenze ZeppOS:
```bash
  npm install
```
3. Build dell'app:
```bash
  npm run build
```
4. Caricare l'app tramite **Zepp Developer Center**

## 🎯 Funzionalità
- Ricerca pullman in tempo reale
- Ricezione immagini
- Widget frequenza cardiaca (Test App 1)
- Sincronizzazione dati (Test App 2)

## 🔑 Configurazione
Modifica il file `config.json` di ogni app per personalizzare le impostazioni e le notifiche.

## 📌 To-Do List
- [ ] Sincronizzazione con app Zepp

## 📄 Licenza
Questo progetto è distribuito sotto licenza **MIT**.

---
Made with ❤️ by Alberto Bor

