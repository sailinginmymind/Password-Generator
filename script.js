/**
 * VIBE PASSWORD - LOGICA FUNZIONALE V1.8.5
 */

const charsets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+[]{}|;:,.<>?"
};

const feedbackPool = {
    weak: ["Livello: Imbarazzante.", "Pessima scelta.", "Troppo facile.", "Dici sul serio?"],
    medium: ["Accettabile.", "Potevi fare di meglio.", "Discreta.", "Standard."],
    strong: ["Solida crittografia.", "Ottima barriera.", "Password seria.", "Ben fatto."],
    unbreakable: ["Livello Dio.", "Inviolabile.", "Fortezza digitale.", "Codice fantasma."]
};

let hasGenerated = false;

/**
 * Gestisce l'attivazione visiva dei toggle
 */
function handleToggle(checkbox) {
    checkbox.parentElement.classList.toggle('active', checkbox.checked);
    updateUI();
}

/**
 * Recupera i caratteri selezionati
 */
function getActiveCharset() {
    let active = "";
    if (document.getElementById('opt-upper').checked) active += charsets.upper;
    if (document.getElementById('opt-lower').checked) active += charsets.lower;
    if (document.getElementById('opt-numbers').checked) active += charsets.numbers;
    if (document.getElementById('opt-symbols').checked) active += charsets.symbols;
    return active || charsets.lower;
}

/**
 * Stima il tempo di crack (Ricalibrato su 1 Triliardo di tentativi/sec)
 */
function estimateCrackTime(length, charsetSize) {
    const combinations = Math.pow(charsetSize, length);
    const speed = 1e12; 
    const seconds = combinations / speed;

    if (seconds < 1) return "Istante";
    if (seconds < 60) return Math.floor(seconds) + " secondi";
    if (seconds < 3600) return Math.floor(seconds / 60) + " minuti";
    if (seconds < 86400) return Math.floor(seconds / 3600) + " ore";
    if (seconds < 2592000) return Math.floor(seconds / 86400) + " giorni";
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + " mesi";
    
    const years = Math.floor(seconds / 31536000);
    if (years < 100) return years + " anni";
    if (years < 1000) return Math.floor(years / 100) + " secoli";
    
    if (length < 18) return "Millenni";
    if (length < 25) return "Eoni";
    if (length < 35) return "Ere Glaciali";
    return "Vita dell'Universo";
}

/**
 * Aggiorna l'interfaccia utente principale
 */
function updateUI() {
    const slider = document.getElementById('length-slider');
    const val = parseInt(slider.value);
    const display = document.getElementById('password-display');
    const bar = document.getElementById('strength-bar');
    const crackText = document.getElementById('crack-time');
    
    document.getElementById('length-val').innerText = val;
    
    const percentage = ((val - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--track-fill', `${percentage}%`);

    // Gestione dimensione font responsiva
    if (val > 42) {
        display.className = 'small-font';
    } else if (val > 28) {
        display.className = 'medium-font';
    } else {
        display.className = '';
    }

    const activeCharset = getActiveCharset();
    const charsetSize = activeCharset.length;

    const activeCount = [
        document.getElementById('opt-upper').checked,
        document.getElementById('opt-lower').checked,
        document.getElementById('opt-numbers').checked,
        document.getElementById('opt-symbols').checked
    ].filter(Boolean).length;

   // --- LOGICA GRADIENTE DINAMICO ---
    const score = val * (activeCount * 0.5);
    const strengthPercent = Math.min((score / 60) * 100, 100);
    
    // Controlliamo se il tema attuale è Pink
    const isPink = document.body.classList.contains('pink-theme');
    
    let dynamicColor, dynamicGlow;

    if (isPink) {
        // Nel tema Pink, il gradiente va dal Viola al Rosa acceso
        // Hue 280 (Viola) -> Hue 330 (Rosa)
        const hue = 280 + (strengthPercent * 0.5); 
        dynamicColor = `hsl(${hue}, 100%, 60%)`;
        dynamicGlow = `hsl(${hue}, 100%, 60%, 0.5)`;
    } else {
        // Tema Green standard (Rosso -> Verde)
        const hue = Math.min(strengthPercent * 1.2, 120); 
        dynamicColor = `hsl(${hue}, 100%, 50%)`;
        dynamicGlow = `hsl(${hue}, 100%, 50%, 0.5)`;
    }

    // Applichiamo larghezza e colori alla barra
    bar.style.width = `${strengthPercent}%`;
    bar.style.backgroundColor = dynamicColor;
    bar.style.boxShadow = `0 0 15px ${dynamicGlow}`;
    
    if (hasGenerated) {
        crackText.style.color = dynamicColor;
        crackText.style.textShadow = `0 0 10px ${dynamicGlow}`;

        let state = "unbreakable";
        if (strengthPercent < 30) state = "weak";
        else if (strengthPercent < 60) state = "medium";
        else if (strengthPercent < 85) state = "strong";
        
        const time = estimateCrackTime(val, charsetSize);
        const randomMsg = feedbackPool[state][Math.floor(Math.random() * feedbackPool[state].length)];
        
        crackText.className = `visible`; 
        crackText.innerHTML = `<div>${randomMsg}</div><div style="font-size: 0.75rem; opacity: 0.8; margin-top: 4px;">Crack time: ${time}</div>`;
    }
    // Aggiorna il colore della barra di stato del telefono
const statusBar = document.getElementById('status-bar-color');
if (statusBar) {
    // Se il tema è pink, usa il rosa, altrimenti il verde
    statusBar.content = document.body.classList.contains('pink-theme') ? "#ff00ff" : "#00ff41";
}
}

/**
 * Genera la password con animazioni
 */
function generate() {
    hasGenerated = true;
    const container = document.getElementById('main-container');
    // Selettore aggiornato per pescare il tasto corretto
    const btn = document.querySelector('.main-generate') || document.querySelector('button[onclick="generate()"]');
    const length = document.getElementById('length-slider').value;
    const display = document.getElementById('password-display');
    const currentCharset = getActiveCharset();
    
    // MOSTRA IL SUGGERIMENTO SOTTO LA PASSWORD
    const hint = document.getElementById('copy-hint-container');
    if (hint) hint.classList.remove('hidden');

    btn.classList.remove('btn-animate');
    void btn.offsetWidth; 
    btn.classList.add('btn-animate');

    container.classList.remove('pulse-active');
    void container.offsetWidth; 
    container.classList.add('pulse-active');

    updateUI();

    let finalPass = "";
    for (let i = 0; i < length; i++) {
        finalPass += currentCharset.charAt(Math.floor(Math.random() * currentCharset.length));
    }

    let step = 0;
    const timer = setInterval(() => {
        display.innerText = finalPass.split("").map((char, index) => {
            if (index < step) return char;
            return currentCharset.charAt(Math.floor(Math.random() * currentCharset.length));
        }).join("");
        
        if (step >= length) {
            clearInterval(timer);
            // Opzionale: puoi aggiungere una classe qui se vuoi un effetto finale
        }
        step += 0.5;
    }, 30);
}

/**
 * Copia negli appunti
 */
function copyToClipboard() {
    const display = document.getElementById('password-display');
    const hintContainer = document.getElementById('copy-hint-container');
    const text = display.innerText;
    
    // Evita di copiare se non c'è ancora una password
    if (["GENERA", "COPIATA!", "In attesa..."].includes(text) || !hasGenerated) return;
    
    navigator.clipboard.writeText(text).then(() => {
        const oldText = text;
        const hintTextElement = hintContainer.querySelector('.hint-text');
        const oldHint = hintTextElement ? hintTextElement.innerText : "CLICCA PER COPIARE";

        // Feedback visivo 1: Sul display della password
        display.innerText = "COPIATA!";
        display.style.color = "#fff"; // Flash bianco per risaltare

        // Feedback visivo 2: Sul suggerimento sotto
        if (hintTextElement) {
            hintTextElement.innerText = "PASSWORD NEGLI APPUNTI!";
            hintTextElement.style.color = "#fff";
        }

        setTimeout(() => { 
            // Ripristina la password originale (se l'utente non ne ha già generata un'altra)
            if (display.innerText === "COPIATA!") {
                display.innerText = oldText;
                display.style.color = ""; 
            }
            
            // Ripristina il suggerimento originale
            if (hintTextElement) {
                hintTextElement.innerText = oldHint;
                hintTextElement.style.color = "";
            }
        }, 1200);
    }).catch(err => {
        console.error('Errore nella copia: ', err);
    });
}

/**
 * Gestione Schermata Analisi Tecnica (Overlay)
 */
function toggleStats(show) {
    const overlay = document.getElementById('stats-overlay');
    if (show) {
        updateStatsData();
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

function updateStatsData() {
    const length = parseInt(document.getElementById('length-slider').value);
    const charset = getActiveCharset();
    const size = charset.length;
    const combinations = Math.pow(size, length);
    
    const combinationsFormatted = combinations > 1e15 
        ? combinations.toExponential(2).replace('e+', ' x 10^') 
        : Math.floor(combinations).toLocaleString('it-IT');
    
    const time = estimateCrackTime(length, size);
    const entropy = Math.floor(length * Math.log2(size));

    document.getElementById('stats-data').innerHTML = `
        <div class="stats-item">
            <span class="stats-label">Potenza Set</span>
            <span class="stats-value">${size} simboli</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Combinazioni</span>
            <span class="stats-value">${combinationsFormatted}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Tempo stimato</span>
            <span class="stats-value">${time}</span>
        </div>
        <div class="stats-item">
            <span class="stats-label">Entropia Bit</span>
            <span class="stats-value">${entropy} Bits</span>
            <p class="entropy-note">Sopra i 60 bit la password è considerata sicura contro attacchi moderni.</p>
        </div>
        
    
    `;
}

// Inizializzazione
// Inizializzazione al caricamento della pagina
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('vibe-theme') === 'pink') {
        document.body.classList.add('pink-theme');
    }
    updateUI();
});/**
 * Gestione Cambio Tema (Skin)
 */
function toggleTheme() {
    const isPink = document.body.classList.toggle('pink-theme');
    localStorage.setItem('vibe-theme', isPink ? 'pink' : 'green');
    updateUI(); // Forza l'aggiornamento dei colori della barra
}