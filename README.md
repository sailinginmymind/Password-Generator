# ⚡ Vibe Password 2.0 — PWA Password Generator

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-00ff41?style=flat-square&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Security: Client Side](https://img.shields.io/badge/Security-100%25_Client_Side-blue?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/Crypto)

**Vibe Password 2.0** è un generatore di password professionale con estetica Cyberpunk, progettato per essere ultra-sicuro, installabile come un'app nativa (PWA) e completamente funzionante offline.

---

## ✨ Caratteristiche principali

-   **🔒 Sicurezza Crittografica:** Utilizza l'API `window.crypto` per garantire una casualità reale (CSPRNG), superiore ai generatori standard.
-   **📱 PWA (Progressive Web App):** Installa l'app sulla schermata home del tuo smartphone o sul desktop. Funziona senza connessione internet.
-   **🚫 Filtro Caratteri Simili:** Opzione per escludere caratteri ambigui come `i, l, 1, L, o, 0, O` per evitare errori di lettura.
-   **📊 Analisi Tecnica:** Calcolo in tempo reale dell'entropia (bit) e stima del tempo necessario per un attacco brute-force (basato su 1 trilione di tentativi al secondo).
-   **🎨 Cyberpunk Vibe:** Interfaccia dinamica con switch tra tema "Neon Green" e "Cyber Pink".
-   **📋 Feedback Istantaneo:** Sistema di toast per la conferma di copia e barra della forza dinamica.

---

## 🛠️ Stack Tecnologico

Il progetto è realizzato in "Vanilla Tech", garantendo prestazioni massime e zero dipendenze esterne:

-   **HTML5** (Semantico & PWA-ready)
-   **CSS3** (Variabili, Flexbox, Grid, Animazioni)
-   **JavaScript (ES6+)** (Service Workers, Web Crypto API)

---

## 📂 Struttura del Progetto

```text
.
├── assets/
│   └── img/
│       └── favicon_io/     # Icone e Favicon per tutti i dispositivi
├── index.html              # Struttura principale
├── style.css               # Stile e temi Cyberpunk
├── script.js               # Logica di generazione e UX
├── manifest.json           # Configurazione PWA
└── sw.js                   # Service Worker per il supporto offline
