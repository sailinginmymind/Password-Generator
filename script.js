/**
 * VIBE PASSWORD 2.0 - LOGICA COMPLETA
 * - Filtro caratteri simili (opt-similar)
 * - Toast per feedback copia
 * - Shuffle, bias-free, BigInt per stima
 */

(function() {
    // ------------------------------ DOM elements ------------------------------
    const container = document.getElementById('main-container');
    const passwordDisplay = document.getElementById('password-display');
    const copyHintContainer = document.getElementById('copy-hint-container');
    const hintTextSpan = document.querySelector('.hint-text');
    const lengthSlider = document.getElementById('length-slider');
    const lengthVal = document.getElementById('length-val');
    const strengthBar = document.getElementById('strength-bar');
    const crackTimeDiv = document.getElementById('crack-time');
    const generateBtn = document.getElementById('generate-btn');
    const themeSwitch = document.getElementById('theme-switch');
    const infoBtn = document.getElementById('info-btn');
    const closeStatsBtn = document.getElementById('close-stats-btn');
    const statsOverlay = document.getElementById('stats-overlay');
    const statsDataDiv = document.getElementById('stats-data');
    const toastMsg = document.getElementById('toast-msg');

    // Checkbox
    const optUpper = document.getElementById('opt-upper');
    const optLower = document.getElementById('opt-lower');
    const optNumbers = document.getElementById('opt-numbers');
    const optSymbols = document.getElementById('opt-symbols');
    const optSimilar = document.getElementById('opt-similar');
    const allMainCheckboxes = [optUpper, optLower, optNumbers, optSymbols];
    const allCheckboxes = [...allMainCheckboxes, optSimilar];

    // ------------------------------ Costanti ------------------------------
    const charsets = {
        upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        lower: "abcdefghijklmnopqrstuvwxyz",
        numbers: "0123456789",
        symbols: "!@#$%^&*()_+[]{}|;:,.<>?"
    };

    // Insieme dei caratteri simili da escludere
    const similarChars = new Set(['i', 'l', '1', 'L', 'o', '0', 'O', '|']);

    const feedbackPool = {
        weak: ["Livello: Imbarazzante.", "Pessima scelta.", "Troppo facile.", "Dici sul serio?"],
        medium: ["Accettabile.", "Potevi fare di meglio.", "Discreta.", "Standard."],
        strong: ["Solida crittografia.", "Ottima barriera.", "Password seria.", "Ben fatto."],
        unbreakable: ["Livello Dio.", "Inviolabile.", "Fortezza digitale.", "Codice fantasma."]
    };

    let hasGenerated = false;
    let currentInterval = null;
    let currentPassword = "";

    // ------------------------------ Utility sicure (bias‑free) ------------------------------
    function secureRandomInt(max) {
        if (max <= 0) return 0;
        if (max === 1) return 0;
        const MAX_UINT32 = 4294967295;
        const maxValid = Math.floor(MAX_UINT32 / max) * max;
        let randomValue;
        do {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            randomValue = randomArray[0];
        } while (randomValue >= maxValid);
        return randomValue % max;
    }

    // Filtra i caratteri simili da una stringa se l'opzione è attiva
    function filterSimilarCharset(charsetString) {
        if (!optSimilar.checked) return charsetString;
        return charsetString.split('').filter(ch => !similarChars.has(ch)).join('');
    }

    // Restituisce il pool totale attivo (già filtrato)
    function getActiveCharset() {
        let active = "";
        if (optUpper.checked) active += filterSimilarCharset(charsets.upper);
        if (optLower.checked) active += filterSimilarCharset(charsets.lower);
        if (optNumbers.checked) active += filterSimilarCharset(charsets.numbers);
        if (optSymbols.checked) active += filterSimilarCharset(charsets.symbols);
        if (active === "") active = filterSimilarCharset(charsets.lower);
        return active;
    }

    // Restituisce le singole categorie (già filtrate) per la garanzia "almeno un carattere per categoria"
    function getFilteredCategories() {
        const cats = [];
        if (optUpper.checked) cats.push(filterSimilarCharset(charsets.upper));
        if (optLower.checked) cats.push(filterSimilarCharset(charsets.lower));
        if (optNumbers.checked) cats.push(filterSimilarCharset(charsets.numbers));
        if (optSymbols.checked) cats.push(filterSimilarCharset(charsets.symbols));
        if (cats.length === 0) cats.push(filterSimilarCharset(charsets.lower));
        return cats;
    }

    // ------------------------------ Calcolo forza (entropia) ------------------------------
    function getStrengthPercent(length, charsetSize) {
        const entropyBits = length * Math.log2(charsetSize);
        let percent = (entropyBits / 128) * 100;
        percent = Math.min(100, Math.max(0, percent));
        return percent;
    }

    function getStrengthLevel(percent) {
        if (percent < 25) return "weak";
        if (percent < 60) return "medium";
        if (percent < 85) return "strong";
        return "unbreakable";
    }

    // ------------------------------ Stima tempo crack con BigInt ------------------------------
    function estimateCrackTime(length, charsetSize) {
        const charsetSizeBI = BigInt(charsetSize);
        const lengthBI = BigInt(length);
        const speedBI = 1000000000000n; // 1 trilione al secondo
        
        let combinations = 1n;
        for (let i = 0n; i < lengthBI; i++) {
            combinations *= charsetSizeBI;
        }
        
        if (combinations < speedBI) {
            const seconds = Number(combinations);
            if (seconds < 1) return "Istante";
            if (seconds < 60) return `${Math.floor(seconds)} secondi`;
            if (seconds < 3600) return `${Math.floor(seconds / 60)} minuti`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore`;
            return `${Math.floor(seconds / 86400)} giorni`;
        }
        
        const secondsBI = combinations / speedBI;
        const seconds = Number(secondsBI);
        
        if (seconds < 60) return `${Math.floor(seconds)} secondi`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minuti`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} ore`;
        if (seconds < 2592000) return `${Math.floor(seconds / 86400)} giorni`;
        if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} mesi`;
        
        const years = seconds / 31536000;
        if (years < 100) return `${Math.floor(years)} anni`;
        if (years < 1000) return `${Math.floor(years / 100)} secoli`;
        
        if (length < 18) return "Millenni";
        if (length < 25) return "Eoni";
        if (length < 35) return "Ere Glaciali";
        return "Vita dell'Universo";
    }

    // ------------------------------ Aggiornamento UI ------------------------------
    function updateUI() {
        const length = parseInt(lengthSlider.value);
        lengthVal.innerText = length;
        
        if (length > 42) {
            passwordDisplay.className = 'small-font';
        } else if (length > 28) {
            passwordDisplay.className = 'medium-font';
        } else {
            passwordDisplay.className = '';
        }

        const percentage = ((length - lengthSlider.min) / (lengthSlider.max - lengthSlider.min)) * 100;
        lengthSlider.style.setProperty('--track-fill', `${percentage}%`);

        const activeCharset = getActiveCharset();
        const charsetSize = activeCharset.length;
        const strengthPercent = getStrengthPercent(length, charsetSize);
        
        const isPink = document.body.classList.contains('pink-theme');
        let dynamicColor, dynamicGlow;
        if (isPink) {
            const hue = 280 + (strengthPercent * 0.5);
            dynamicColor = `hsl(${hue}, 100%, 60%)`;
            dynamicGlow = `hsl(${hue}, 100%, 60%, 0.5)`;
        } else {
            const hue = Math.min(strengthPercent * 1.2, 120);
            dynamicColor = `hsl(${hue}, 100%, 50%)`;
            dynamicGlow = `hsl(${hue}, 100%, 50%, 0.5)`;
        }

        strengthBar.style.width = `${strengthPercent}%`;
        strengthBar.style.backgroundColor = dynamicColor;
        strengthBar.style.boxShadow = `0 0 15px ${dynamicGlow}`;

        if (hasGenerated) {
            crackTimeDiv.style.color = dynamicColor;
            crackTimeDiv.style.textShadow = `0 0 10px ${dynamicGlow}`;
            
            const level = getStrengthLevel(strengthPercent);
            const randomMsg = feedbackPool[level][Math.floor(Math.random() * feedbackPool[level].length)];
            const time = estimateCrackTime(length, charsetSize);
            
            crackTimeDiv.className = 'visible';
            crackTimeDiv.innerHTML = `<div>${randomMsg}</div><div style="font-size: 0.75rem; opacity: 0.8; margin-top: 4px;">Crack time: ${time}</div>`;
        }

        const statusBarMeta = document.getElementById('status-bar-color');
        if (statusBarMeta) {
            statusBarMeta.content = isPink ? "#ff00ff" : "#00ff41";
        }
    }

    // ------------------------------ Generazione password (con filtro similar) ------------------------------
    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const categories = getFilteredCategories();
        
        if (categories.length === 0) categories.push(filterSimilarCharset(charsets.lower));
        
        const finalLength = Math.max(length, categories.length);
        const totalCharset = categories.join('');
        const totalSize = totalCharset.length;
        
        // 1. Un carattere obbligatorio per ogni categoria (già filtrato)
        const passwordArray = [];
        for (const cat of categories) {
            const randomIndex = secureRandomInt(cat.length);
            passwordArray.push(cat.charAt(randomIndex));
        }
        
        // 2. Riempie i restanti caratteri usando il pool totale filtrato
        const remaining = finalLength - categories.length;
        for (let i = 0; i < remaining; i++) {
            const randomIndex = secureRandomInt(totalSize);
            passwordArray.push(totalCharset.charAt(randomIndex));
        }
        
        // 3. Shuffle (Fisher-Yates) con random sicuro
        for (let i = passwordArray.length - 1; i > 0; i--) {
            const j = secureRandomInt(i + 1);
            [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
        }
        
        return passwordArray.join('');
    }

    function startProgressiveAnimation(targetPassword) {
        if (currentInterval) clearInterval(currentInterval);
        
        const length = targetPassword.length;
        const charset = getActiveCharset();
        const charsetSize = charset.length;
        let step = 0;
        
        currentInterval = setInterval(() => {
            let displayText = "";
            for (let i = 0; i < length; i++) {
                if (i < step) {
                    displayText += targetPassword[i];
                } else {
                    displayText += charset.charAt(secureRandomInt(charsetSize));
                }
            }
            passwordDisplay.innerText = displayText;
            if (step >= length) {
                clearInterval(currentInterval);
                currentInterval = null;
                currentPassword = targetPassword;
            }
            step += 0.5;
        }, 30);
    }

    function generate() {
        hasGenerated = true;
        
        generateBtn.classList.remove('btn-animate');
        void generateBtn.offsetWidth;
        generateBtn.classList.add('btn-animate');
        
        container.classList.remove('pulse-active');
        void container.offsetWidth;
        container.classList.add('pulse-active');
        
        copyHintContainer.classList.remove('hidden');
        
        const newPassword = generatePassword();
        startProgressiveAnimation(newPassword);
        updateUI();
    }

    // ------------------------------ Toast ------------------------------
    function showToast(message = "Password copiata!") {
        if (!toastMsg) return;
        toastMsg.textContent = message;
        toastMsg.classList.add('show');
        setTimeout(() => {
            toastMsg.classList.remove('show');
        }, 2000);
    }

    // ------------------------------ Copia con fallback e toast ------------------------------
    function fallbackCopy(text, onSuccess) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, text.length);
        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy error:', err);
        }
        document.body.removeChild(textarea);
        if (success) {
            onSuccess();
        } else {
            alert('Impossibile copiare la password. Copiala manualmente.');
        }
    }

    function copyToClipboard() {
        if (!hasGenerated || currentPassword === "" || passwordDisplay.innerText === "GENERA") return;

        const textToCopy = currentPassword;

        const copySuccess = () => {
            showToast("Password copiata!");
            // Opzionale: animazione veloce sull'hint
            if (hintTextSpan) {
                const originalText = hintTextSpan.innerText;
                hintTextSpan.innerText = "✓ COPIATA!";
                setTimeout(() => {
                    if (hintTextSpan) hintTextSpan.innerText = originalText;
                }, 800);
            }
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy)
                .then(copySuccess)
                .catch(err => {
                    console.error('Clipboard API fallita, provo fallback:', err);
                    fallbackCopy(textToCopy, copySuccess);
                });
        } else {
            fallbackCopy(textToCopy, copySuccess);
        }
    }

    // ------------------------------ Gestione checkbox (impedisci deselezione totale categorie principali) ------------------------------
    function handleCheckboxChange(clickedCheckbox) {
        if (allMainCheckboxes.includes(clickedCheckbox)) {
            const checkedCount = allMainCheckboxes.filter(cb => cb.checked).length;
            if (checkedCount === 0 && !clickedCheckbox.checked) {
                clickedCheckbox.checked = true;
                return;
            }
        }
        const parentLabel = clickedCheckbox.closest('.option-item');
        if (parentLabel) {
            if (clickedCheckbox.checked) {
                parentLabel.classList.add('active');
            } else {
                parentLabel.classList.remove('active');
            }
        }
        updateUI();
        if (hasGenerated && currentPassword) {
            // Aggiorna il tempo di crack senza rigenerare la password
            const length = parseInt(lengthSlider.value);
            const charset = getActiveCharset();
            const strengthPercent = getStrengthPercent(length, charset.length);
            const level = getStrengthLevel(strengthPercent);
            const randomMsg = feedbackPool[level][Math.floor(Math.random() * feedbackPool[level].length)];
            const time = estimateCrackTime(length, charset.length);
            crackTimeDiv.innerHTML = `<div>${randomMsg}</div><div style="font-size: 0.75rem; opacity: 0.8; margin-top: 4px;">Crack time: ${time}</div>`;
        }
    }

    // ------------------------------ Overlay statistiche con BigInt ------------------------------
    function updateStatsData() {
        const length = parseInt(lengthSlider.value);
        const charset = getActiveCharset();
        const size = charset.length;
        
        const sizeBI = BigInt(size);
        let combinationsBI = 1n;
        for (let i = 0; i < length; i++) {
            combinationsBI *= sizeBI;
        }
        
        let combinationsFormatted;
        if (combinationsBI > 1e15) {
            const exponent = Math.floor(Math.log10(Number(combinationsBI)));
            const mantissa = Number(combinationsBI) / Math.pow(10, exponent);
            combinationsFormatted = mantissa.toFixed(2) + " x 10^" + exponent;
        } else {
            combinationsFormatted = combinationsBI.toLocaleString('it-IT');
        }
        
        const time = estimateCrackTime(length, size);
        const entropyBits = length * Math.log2(size);
        const entropyRounded = Math.floor(entropyBits);
        
        statsDataDiv.innerHTML = `
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
                <span class="stats-value">${entropyRounded} Bits</span>
                <p class="entropy-note">Sopra i 60 bit la password è considerata sicura contro attacchi moderni.</p>
            </div>
        `;
    }

    function toggleStats(show) {
        if (show) {
            updateStatsData();
            statsOverlay.classList.add('active');
        } else {
            statsOverlay.classList.remove('active');
        }
    }

    // ------------------------------ Tema ------------------------------
    function toggleTheme() {
        const isPink = document.body.classList.toggle('pink-theme');
        localStorage.setItem('vibe-theme', isPink ? 'pink' : 'green');
        updateUI();
    }

    // ------------------------------ Event listeners ------------------------------
    function bindEvents() {
        generateBtn.addEventListener('click', generate);
        passwordDisplay.addEventListener('click', copyToClipboard);
        themeSwitch.addEventListener('click', toggleTheme);
        infoBtn.addEventListener('click', () => toggleStats(true));
        closeStatsBtn.addEventListener('click', () => toggleStats(false));
        statsOverlay.addEventListener('click', (e) => {
            if (e.target === statsOverlay) toggleStats(false);
        });
        
        lengthSlider.addEventListener('input', () => {
            updateUI();
            if (hasGenerated && currentPassword) {
                const length = parseInt(lengthSlider.value);
                const charset = getActiveCharset();
                const strengthPercent = getStrengthPercent(length, charset.length);
                const level = getStrengthLevel(strengthPercent);
                const randomMsg = feedbackPool[level][Math.floor(Math.random() * feedbackPool[level].length)];
                const time = estimateCrackTime(length, charset.length);
                crackTimeDiv.innerHTML = `<div>${randomMsg}</div><div style="font-size: 0.75rem; opacity: 0.8; margin-top: 4px;">Crack time: ${time}</div>`;
            }
        });
        
        allCheckboxes.forEach(cb => {
            cb.addEventListener('change', function() {
                handleCheckboxChange(this);
            });
        });
    }

    function init() {
        if (localStorage.getItem('vibe-theme') === 'pink') {
            document.body.classList.add('pink-theme');
        }
        bindEvents();
        updateUI();
        copyHintContainer.classList.add('hidden');
        const defaultPass = generatePassword();
        currentPassword = defaultPass;
        passwordDisplay.innerText = defaultPass;
        hasGenerated = true;
        updateUI();
    }
    
    // Registrazione Service Worker per PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrato con successo:', reg.scope))
            .catch(err => console.error('Errore registrazione Service Worker:', err));
    });
}

    init();
})();