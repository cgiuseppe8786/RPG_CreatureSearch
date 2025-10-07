// =============================================================================
// Script principale dell'app "RPG Creature Search"
// - Nessuna dipendenza esterna: puro JavaScript per compatibilità e leggerezza.
// - Architettura modulare a funzioni pure per testabilità e riuso.
// - Gestione accessibilità: aria-live, aria-expanded, keyboard handlers.
// =============================================================================

// Utility di selezione (scopo locale; evita dipendenze tipo jQuery)
const $ = (sel) => document.querySelector(sel);

// ---------------- Riferimenti DOM: input e CTA ----------------
const input = $("#search-input");
const btn = $("#search-button");

// ---------------- Riferimenti DOM: campi dettaglio creatura ----------------
const elName = $("#creature-name");
const elId = $("#creature-id");
const elWeight = $("#weight");
const elHeight = $("#height");
const elTypes = $("#types");

const elHp = $("#hp");
const elAtk = $("#attack");
const elDef = $("#defense");
const elSpAtk = $("#special-attack");
const elSpDef = $("#special-defense");
const elSpeed = $("#speed");

// ---------------- Sezione "Special Ability" ----------------
const specialSection = $("#special-section");
const specialName = $("#special-name");
const specialDesc = $("#special-description");

// ---------------- Catalogo collassabile ----------------
const toggleCatalogBtn = $("#toggle-catalog");
const catalogPanel = $("#catalog-panel");
const catalogFilter = $("#catalog-filter");
const catalogGrid = $("#catalog-grid");
const catalogCount = $("#catalog-count");
const catalogCountLabel = $("#catalog-count-label");

// Cache in-memory del catalogo per evitare roundtrip ripetuti
let allCreaturesCache = null;

// -----------------------------------------------------------------------------
// resetUI()
// Ripristina la UI a stato neutro prima di una nuova ricerca.
// -----------------------------------------------------------------------------
function resetUI() {
  elName.textContent = "—";
  elId.textContent = "—";
  elWeight.textContent = "Weight: —";
  elHeight.textContent = "Height: —";
  elHp.textContent = "—";
  elAtk.textContent = "—";
  elDef.textContent = "—";
  elSpAtk.textContent = "—";
  elSpDef.textContent = "—";
  elSpeed.textContent = "—";
  elTypes.innerHTML = "";

  // Sezione speciale nascosta di default
  specialName.textContent = "—";
  specialDesc.textContent = "—";
  specialSection.hidden = true;
}

// -----------------------------------------------------------------------------
// Mappa normalizzata delle chiavi stats per robuste trasformazioni dagli endpoint
// Accetta sia formati { name, base_stat } che varianti { stat.name, value }
// -----------------------------------------------------------------------------
const statKeyMap = {
  hp: "hp",
  attack: "attack",
  defense: "defense",
  "special-attack": "special-attack",
  "special-defense": "special-defense",
  speed: "speed",
};

// -----------------------------------------------------------------------------
// extractStats(statsArray)
// Converte un array di statistiche dall'API in un oggetto normalizzato.
// - Tollerante a formati leggermente diversi.
// - Ritorna valori null se mancanti (UI mostra em dash).
// -----------------------------------------------------------------------------
function extractStats(statsArray) {
  const result = {
    hp: null,
    attack: null,
    defense: null,
    "special-attack": null,
    "special-defense": null,
    speed: null,
  };
  if (!Array.isArray(statsArray)) return result;

  for (const s of statsArray) {
    const name = String(s?.name ?? s?.stat?.name ?? "").toLowerCase();
    const value = Number(s?.base_stat ?? s?.value ?? s?.val ?? "");
    if (statKeyMap[name] && Number.isFinite(value)) {
      result[statKeyMap[name]] = value;
    }
  }
  return result;
}

// -----------------------------------------------------------------------------
// setLoading(isLoading)
// Feedback UI: disabilita il bottone e mostra stato di caricamento.
// -----------------------------------------------------------------------------
function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Searching..." : "Search";
}

// -----------------------------------------------------------------------------
// baseUrl()
// Punto di estensione centralizzato per cambiare ambiente/API facilmente.
// -----------------------------------------------------------------------------
function baseUrl() {
  return "https://rpg-creature-api.freecodecamp.rocks/api";
}

// -----------------------------------------------------------------------------
// fetchCreature(queryRaw)
// Effettua una ricerca singola (by name o ID) provando più endpoint compatibili.
// - Strategia "best-effort": tenta /creature/:q e /creatures/:q.
// - Lancia errore se non trova match (gestito a monte).
// -----------------------------------------------------------------------------
async function fetchCreature(queryRaw) {
  const query = String(queryRaw).trim().toLowerCase();
  if (!query) return null;

  const endpoints = [
    `${baseUrl()}/creature/${encodeURIComponent(query)}`,
    `${baseUrl()}/creatures/${encodeURIComponent(query)}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) return res.json();
    } catch (_) {
      // Silenzio gli errori di rete per resilienza; si prosegue con l'altro endpoint
    }
  }
  throw new Error("Creature not found");
}

// -----------------------------------------------------------------------------
// fetchAllCreatures()
// Recupera l'intero catalogo (lazy load, cache in-memory).
// - Tenta sia /creature che /creatures senza parametri.
// - Ritorna [] in fallback per semplificare chiamanti.
// -----------------------------------------------------------------------------
async function fetchAllCreatures() {
  if (allCreaturesCache) return allCreaturesCache;

  const endpoints = [
    `${baseUrl()}/creature`,   // senza parametro: tutte
    `${baseUrl()}/creatures`,  // variante plurale
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          allCreaturesCache = data;
          return data;
        }
      }
    } catch (_) {
      // Ignoro e provo endpoint successivo
    }
  }

  allCreaturesCache = [];
  return allCreaturesCache;
}

// -----------------------------------------------------------------------------
// renderCreature(creature)
// Scrive i dati della creatura negli elementi della UI.
// - Gestione robusta dei falsy e dei non numerici.
// - Sezione "Special Ability" mostrata solo se presenti dati.
// -----------------------------------------------------------------------------
function renderCreature(creature) {
  const name = String(creature?.name ?? "");
  const id = Number(creature?.id ?? "");
  const weight = Number(creature?.weight ?? "");
  const height = Number(creature?.height ?? "");

  elName.textContent = name ? name.toUpperCase() : "—";
  elId.textContent = Number.isFinite(id) ? `#${id}` : "—";
  elWeight.textContent = Number.isFinite(weight) ? `Weight: ${weight}` : "Weight: —";
  elHeight.textContent = Number.isFinite(height) ? `Height: ${height}` : "Height: —";

  const stats = extractStats(creature?.stats);
  elHp.textContent = stats.hp ?? "—";
  elAtk.textContent = stats.attack ?? "—";
  elDef.textContent = stats.defense ?? "—";
  elSpAtk.textContent = stats["special-attack"] ?? "—";
  elSpDef.textContent = stats["special-defense"] ?? "—";
  elSpeed.textContent = stats.speed ?? "—";

  // Tipi (badge)
  elTypes.innerHTML = "";
  const typesArr = Array.isArray(creature?.types) ? creature.types : [];
  for (const t of typesArr) {
    const typeName = String(t?.name ?? "").toUpperCase();
    if (!typeName) continue;
    const span = document.createElement("span");
    span.className = "type-pill";
    span.textContent = typeName;
    elTypes.appendChild(span);
    // NB: se necessario, qui potrei mappare colori/icone per type
  }

  // Abilità speciale (render condizionale)
  const special = creature?.special;
  const sName = String(special?.name ?? "");
  const sDesc = String(special?.description ?? "");
  if (sName || sDesc) {
    specialName.textContent = sName || "—";
    specialDesc.textContent = sDesc || "—";
    specialSection.hidden = false;
  } else {
    specialSection.hidden = true;
  }
}

// -----------------------------------------------------------------------------
// onSearch()
// Gestisce il flusso di ricerca:
// - Validazione HTML5 (required).
// - Reset UI + spinner testuale sul bottone.
// - Fetch dati + render + gestione errori user-friendly.
// -----------------------------------------------------------------------------
async function onSearch() {
  if (!input.checkValidity()) {
    input.reportValidity();
    return;
  }

  resetUI();
  setLoading(true);

  try {
    const data = await fetchCreature(input.value);
    renderCreature(data);
  } catch (err) {
    alert("Creature not found");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

/* ===========================
   Catalogo: UI e interazioni
   =========================== */

// -----------------------------------------------------------------------------
// toggleCatalog(open)
// Mostra/nasconde il pannello e sincronizza aria-expanded per accessibilità.
// -----------------------------------------------------------------------------
function toggleCatalog(open) {
  const willOpen = open ?? catalogPanel.hidden;
  catalogPanel.hidden = !willOpen;
  toggleCatalogBtn.setAttribute("aria-expanded", String(willOpen));
}

// -----------------------------------------------------------------------------
// renderCatalog(list)
// Costruzione efficiente del DOM (DocumentFragment) per liste medie.
// Ogni card è cliccabile e richiama onSearch con name o id.
// -----------------------------------------------------------------------------
function renderCatalog(list) {
  catalogGrid.innerHTML = "";
  const frag = document.createDocumentFragment();

  list.forEach((item) => {
    const id = Number(item?.id ?? "");
    const name = String(item?.name ?? "");

    const div = document.createElement("div");
    div.className = "catalog-item";
    div.setAttribute("role", "listitem");
    div.title = name ? `${name} (#${id})` : `#${id}`;

    const left = document.createElement("span");
    left.className = "name";
    left.textContent = name ? name.toUpperCase() : "—";

    const right = document.createElement("span");
    right.className = "id";
    right.textContent = Number.isFinite(id) ? `#${id}` : "—";

    div.appendChild(left);
    div.appendChild(right);

    div.addEventListener("click", () => {
      if (name) {
        input.value = name;
      } else if (Number.isFinite(id)) {
        input.value = String(id);
      }
      onSearch();
      // UX: riportiamo l'utente in cima alla pagina per vedere il dettaglio.
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    frag.appendChild(div);
  });

  catalogGrid.appendChild(frag);
}

// -----------------------------------------------------------------------------
// updateCatalogCounters(total, filtered)
// Aggiorna contatori globale e filtrato per feedback all'utente.
// -----------------------------------------------------------------------------
function updateCatalogCounters(total, filtered) {
  catalogCount.textContent = `${filtered} of ${total} shown`;
  catalogCountLabel.textContent = total ? `(${total})` : "";
}

// -----------------------------------------------------------------------------
// ensureCatalogLoaded()
// Caricamento lazy del catalogo al primo toggle; caching in-memory.
// -----------------------------------------------------------------------------
async function ensureCatalogLoaded() {
  if (!allCreaturesCache) {
    const list = await fetchAllCreatures();
    renderCatalog(list);
    updateCatalogCounters(list.length, list.length);
  }
}

// Toggle del catalogo: apertura chiama lazy load
toggleCatalogBtn.addEventListener("click", async () => {
  const willOpen = catalogPanel.hidden;
  toggleCatalog(willOpen);
  if (willOpen) {
    await ensureCatalogLoaded();
  }
});

// Filtro in tempo reale sul catalogo (client-side, case-insensitive)
catalogFilter.addEventListener("input", () => {
  const q = catalogFilter.value.trim().toLowerCase();
  const list = allCreaturesCache || [];
  const filtered = !q
    ? list
    : list.filter((c) => {
        const name = String(c?.name ?? "").toLowerCase();
        const idStr = String(c?.id ?? "");
        return name.includes(q) || idStr.includes(q);
      });

  renderCatalog(filtered);
  updateCatalogCounters(list.length, filtered.length);
});

/* ===========================
   Theme toggle (persistenza)
   ===========================
   - Priorità: localStorage -> preferenza OS -> default (dark).
   - Aggiorna iconcina e data-theme; tastiera supportata (Enter/Space).
*/
(function initThemeToggle() {
  const themeBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Inizializza da localStorage o preferenze OS
  const saved = localStorage.getItem("theme");
  if (saved) {
    body.dataset.theme = saved;
    themeBtn.textContent = saved === "dark" ? "☀️" : "🌙";
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    body.dataset.theme = prefersDark ? "dark" : "light";
    themeBtn.textContent = prefersDark ? "☀️" : "🌙";
  }

  function toggleTheme() {
    const isDark = body.dataset.theme === "dark";
    body.dataset.theme = isDark ? "light" : "dark";
    localStorage.setItem("theme", body.dataset.theme);
    themeBtn.textContent = isDark ? "🌙" : "☀️";
  }

  themeBtn.addEventListener("click", toggleTheme);
  themeBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") toggleTheme();
  });
})();

/* ===========================
   Inizializzazione interazioni
   =========================== */
btn.addEventListener("click", onSearch);

// UX: Enter dentro input attiva la ricerca
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") onSearch();
});

// Stato iniziale coerente e catalogo lazy (chiuso di default)
window.addEventListener("DOMContentLoaded", () => {
  input.value = "";
  resetUI();
  // Il catalogo viene caricato solo al primo toggle per ridurre il TTI.
});
