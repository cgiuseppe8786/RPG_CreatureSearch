# RPG Creature Search

Questo progetto è stato realizzato come parte del percorso **"JavaScript Algorithms and Data Structures"** di [freeCodeCamp](https://www.freecodecamp.org/).

L’obiettivo è costruire un’interfaccia semplice e accessibile per **ricercare creature** per **nome o ID**, visualizzarne **statistiche base** e — quando disponibile — l’**abilità speciale**.  
L’applicazione è realizzata in **HTML**, **CSS** e **JavaScript puro**, con supporto **tema chiaro/scuro**, layout responsive e attenzione all’**accessibilità** (ARIA, tastiera, annunci non intrusivi).

---

### 🧠 Obiettivi

- Implementare una **ricerca robusta** (per nome o ID) con gestione degli errori
- Visualizzare **dettagli** della creatura: tipi, peso, altezza e **base stats**
- Mostrare l’**abilità speciale** quando presente
- Fornire un **catalogo completo** (collassabile) con **filtro client-side**
- Curare **accessibilità** (ruoli ARIA, aria-live, aria-expanded) e **usabilità da tastiera**
- Supportare **tema light/dark** con persistenza in `localStorage`
- Rispettare i requisiti dei **test automatici freeCodeCamp** (id, testi e comportamento)

---

### ⚙️ Funzionalità principali

- **Ricerca** per nome o ID con Enter/click (input `required` + validazione HTML5)
- **Dettaglio creatura**: nome, id, tipi (badge), peso/altezza e 6 statistiche base
- **Special Ability**: se disponibile, viene mostrata con card dedicata
- **Catalogo completo**:
  - Apertura/chiusura con bottone **collassabile** (`aria-expanded`)
  - **Caricamento lazy** al primo toggle e **cache in-memory**
  - **Filtro** per nome/ID in tempo reale
- **Tema** light/dark: sincronizzato alle preferenze di sistema, con **toggle** (click, Enter/Space)
- **Responsive**: griglie adattive (header, stats e catalogo si ridistribuiscono ≥ 820px)
- **Accessibilità**:
  - Aggiornamenti dei dettagli con `aria-live="polite"` (annunci non intrusivi)
  - Stato del pannello catalogo via `aria-expanded`
  - Focus management naturale e controlli tastiera

---

### 🧩 Architettura & Tecniche

- **Vanilla JS** modulare: funzioni pure per fetch, normalizzazione e render
- **Tolleranza al formato**: mapping difensivo delle statistiche (`statKeyMap`)
- **UI State**: reset coerente prima di ogni ricerca, indicatori di caricamento sul bottone
- **Performance**:  
  - **Lazy load** del catalogo solo quando serve  
  - **DocumentFragment** per renderizzare liste in modo efficiente  
  - **Cache in-memory** per evitare fetch ripetuti
- **Stile**: CSS custom properties per i temi, griglie responsive e micro-transizioni
- **Accessibilità**: ARIA semantico e supporto tastiera su elementi interattivi

---

### 🔗 API

- Base: `https://rpg-creature-api.freecodecamp.rocks/api`
- Endpoint usati (fallback automatico tra singolare/plurale):
  - `GET /creature/:query`
  - `GET /creatures/:query`
  - `GET /creature` _(tutte)_
  - `GET /creatures` _(tutte)_

> La query accetta nome o ID; i dati vengono **normalizzati** per tollerare piccole differenze di schema.

---

### 🚀 Avvio rapido

1. **Clona** o scarica il progetto.
2. Apri `index.html` direttamente nel browser **oppure** servi la cartella con un server statico (consigliato per CORS):
   - Python: `python -m http.server 8080`
   - Node (http-server): `npx http-server -p 8080`
3. Visita `http://localhost:8080` e prova a cercare per **nome** o **ID**.

---

### 🧪 Test & Requisiti freeCodeCamp

- Struttura DOM, `id` e comportamento sono pensati per allinearsi ai **test automatici**.  
- Il codice usa **validazione HTML5**, **annunci ARIA** e **stati controllati** per garantire esiti previsti.

---

### 📦 Struttura del progetto

```
.
├─ index.html    # Markup semanticamente annotato (ARIA, ruoli), include lo script
├─ styles.css    # Variabili di tema, griglie responsive, componenti UI
└─ script.js     # Logica: fetch, normalizzazione, render, catalogo e theme toggle
```

---

### 🌗 Scorciatoie da tastiera

- **Enter** nella barra di ricerca → avvia la ricerca
- **Enter/Space** sul **toggle tema** → alterna Light/Dark

---

### 🖼️ UI/UX Highlights

- **Catalogo collassabile** con **chevron** animato e contatori “N di Tot mostrati”
- **Badge** dei tipi con pill e bordo leggero
- **Card** abilità speciale con gradiente morbido
- **Feedback** hover/active sulle card del catalogo e focus evidente sugli input

---

### 🚀 Demo

👉 **Live Preview:** [https://cgiuseppe8786.github.io/RPG_CreatureSearch/](https://cgiuseppe8786.github.io/RPG_CreatureSearch/)

---

### 💻 Codice sorgente

📂 **Repository:** [https://github.com/cgiuseppe8786/RPG_CreatureSearch](https://github.com/cgiuseppe8786/RPG_CreatureSearch)

---

### 🧾 Licenza

Rilasciato sotto **licenza MIT**.  
Può essere utilizzato liberamente per scopi educativi e di portfolio.
