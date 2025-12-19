/* =====================================================
   App Registry
===================================================== */
const appRegistry = window.APP_REGISTRY || {};
console.log("apps loaded:", Object.keys(appRegistry));

/* =====================================================
   App Manifest Loader
   - Lädt pro App optional ein resources/<app>/application.js
===================================================== */
const loadedAppManifests = new Set();

function loadAppManifest(app) {
  return new Promise((resolve) => {
    if (!app?.path) return resolve(false);

    // Already loaded for this app id
    if (loadedAppManifests.has(app.id)) return resolve(true);

    const manifestUrl = `${app.path.replace(/\/$/, "")}/application.js`;

    // If script tag  da, mark as loaded
    const existing = document.querySelector(`script[data-app-manifest="${app.id}"]`);
    if (existing) {
      loadedAppManifests.add(app.id);
      return resolve(true);
    }

    const s = document.createElement("script");
    s.src = manifestUrl;
    s.defer = true;
    s.dataset.appManifest = app.id;

    s.onload = () => {
      loadedAppManifests.add(app.id);
      resolve(true);
    };
    s.onerror = () => {
      console.warn(`Could not load manifest for app '${app.id}' from`, manifestUrl);
      resolve(false);
    };

    document.head.appendChild(s);
  });
}

const HOST_STYLE_HREF = new URL("css/style.css", window.location.href).href;

function injectHostStylesIntoIframe(iframe) {
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      if (doc.querySelector('link[data-host-style="1"]')) return;

      const link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = HOST_STYLE_HREF;
      link.dataset.hostStyle = "1";

      (doc.head || doc.documentElement).appendChild(link);
    } catch (error) {
      console.warn("Could not inject host styles into iframe", error);
    }
  });
}

function resolveAppFile(app, file) {
  if (!app?.path || !file) return file;
  // absolute url umstrukturieren
  if (/^(https?:|file:|data:)/i.test(file) || file.startsWith("/")) return file;
  return `${app.path.replace(/\/$/, "")}/${file.replace(/^\//, "")}`;
}

// clamper damit fenster nicht aus rand moven
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// LOGIK Overlay Transition Close (Helper und Spotlight)
// Idee: CSS transition abwarten, danach immediateClose() ausführen
function closeOverlayAnimated(overlay, panel, immediateClose, afterClose) {
  if (!overlay) return;

  // Wenn hidden, dann callback
  if (overlay.hidden) {
    if (typeof afterClose === "function") afterClose();
    return;
  }

  overlay.classList.add("is-closing");

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    immediateClose();
    if (typeof afterClose === "function") afterClose();
  };

  // hotfix fallback
  const target = panel || overlay;
  const onEnd = (e) => {
    if (e && e.target !== target) return;
    target.removeEventListener("transitionend", onEnd);
    finish();
  };

  target.addEventListener("transitionend", onEnd);
  window.setTimeout(finish, 220);
}

/* =====================================================
   moeos global bar date time fctn
===================================================== */
const menuDateTimeEl = document.querySelector("#menu-datetime");

function updateMenuDateTime() {
  if (!menuDateTimeEl) return;

  const now = new Date();

  const formatted = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(now);

  menuDateTimeEl.textContent = formatted;
}

updateMenuDateTime();
setInterval(updateMenuDateTime, 10000);

/* =====================================================
   Spotlight DOM
===================================================== */
const spotlightOverlay = document.querySelector("#spotlight-overlay");
// scoped query: erst im Overlay suchen, sonst fallback
const spotlightBackdrop = spotlightOverlay?.querySelector(".spotlight-backdrop") || document.querySelector(".spotlight-backdrop");
const spotlightPanel = spotlightOverlay?.querySelector(".spotlight-panel") || document.querySelector(".spotlight-panel");
const spotlightInput = document.querySelector("#spotlight-input");
const spotlightResults = document.querySelector("#spotlight-results");

const spotlightItemTemplate = document.querySelector("#spotlight-item-template");

/* =====================================================
   Help DOM
===================================================== */
// scoped query wie bei Spotlight: erst im Overlay suchen, sonst fallback
const helpOverlay = document.querySelector("#help-overlay");
const helpBackdrop = helpOverlay?.querySelector(".help-backdrop") || document.querySelector(".help-backdrop");
const helpPanel = helpOverlay?.querySelector(".help-panel") || document.querySelector(".help-panel");
const helpCloseBtn = helpOverlay?.querySelector(".help-close") || document.querySelector(".help-close");
const menuHelpBtn = document.querySelector("#menu-help");

/* =====================================================
   Spotlight Core
===================================================== */
function resetSpotlightPosition() {
  if (!spotlightPanel) return;
  spotlightPanel.style.left = "";
  spotlightPanel.style.top = "";
  spotlightPanel.style.bottom = "";
  spotlightPanel.style.transform = "";
}

function getDockIconForApp(appId) {
  // Use the dock emoji/icon as the source of truth, so Spotlight matches the Dock style.
  const dockBtn = document.querySelector(`.dock-item[data-app="${appId}"]`);
  if (!dockBtn) return "";
  return (dockBtn.textContent || "").trim();
}

function getSearchableApps() {
  // nur apps + const searchable bool true
  return Object.values(appRegistry)
    .filter((a) => a && a.id && a.id !== "spotlight")
    .filter((a) => a.config?.options?.searchable === true);
}

function matchesQuery(app, q) {
  if (!q) return true;
  const hay = `${app.config?.title || ""} ${app.id || ""} ${(app.keywords || []).join(" ")}`
    .toLowerCase();
  return hay.includes(q);
}

function renderSpotlightResults(query) {
  if (!spotlightResults) return;

  const q = (query || "").trim().toLowerCase();
  const apps = getSearchableApps()
    .filter((app) => matchesQuery(app, q))
    .sort((a, b) => {
      const ta = (a.config?.title || a.id || "").toLowerCase();
      const tb = (b.config?.title || b.id || "").toLowerCase();
      return ta.localeCompare(tb);
    });

  spotlightResults.innerHTML = "";

  const renderSpotlightEmpty = (text) => {
    const p = document.createElement("p");
    p.style.color = "#6e6e73";
    p.style.margin = "10px 0 0";
    p.textContent = text;
    spotlightResults.appendChild(p);
  };

  // keine treffer fallback
  if (!spotlightItemTemplate) {
    renderSpotlightEmpty(
      apps.length ? apps.map((a) => a.config?.title || a.id).join(", ") : "Keine Apps gefunden."
    );
    return;
  }

  if (!apps.length) {
    renderSpotlightEmpty("Keine Apps gefunden.");
    return;
  }

  apps.forEach((app) => {
    const node = spotlightItemTemplate.content.firstElementChild.cloneNode(true);

    node.dataset.app = app.id;

    const iconEl = node.querySelector(".spotlight-item-icon");
    const titleEl = node.querySelector(".spotlight-item-title");

    if (iconEl) iconEl.textContent = getDockIconForApp(app.id) || "•";
    if (titleEl) titleEl.textContent = app.config?.title || app.id;

    spotlightResults.appendChild(node);
  });
}

function closeSpotlightImmediate() {
  if (!spotlightOverlay) return;
  spotlightOverlay.classList.remove("is-closing");
  spotlightOverlay.hidden = true;
  if (spotlightInput) spotlightInput.value = "";
  if (spotlightResults) spotlightResults.innerHTML = "";
}

// nutzt shared close helper (helper und spotlight gleiches verhalten)
function closeSpotlightAnimated(afterClose) {
  closeOverlayAnimated(spotlightOverlay, spotlightPanel, closeSpotlightImmediate, afterClose);
}

function openSpotlight() {
  if (!spotlightOverlay) return;
  spotlightOverlay.classList.remove("is-closing");
  spotlightOverlay.hidden = false;
  resetSpotlightPosition();
  if (spotlightInput) spotlightInput.value = "";
  renderSpotlightResults("");
  spotlightInput?.focus();
}

function toggleSpotlight() {
  spotlightOverlay?.hidden ? openSpotlight() : closeSpotlightAnimated();
}

/* =====================================================
   Help Core
===================================================== */
function openHelp() {
  if (!helpOverlay) return;
  helpOverlay.classList.remove("is-closing");
  helpOverlay.hidden = false;
}

function closeHelpImmediate() {
  if (!helpOverlay) return;
  helpOverlay.classList.remove("is-closing");
  helpOverlay.hidden = true;
}

// nutzt shared close helper
function closeHelpAnimated(afterClose) {
  closeOverlayAnimated(helpOverlay, helpPanel, closeHelpImmediate, afterClose);
}

// listener trigger für help
if (menuHelpBtn) {
  menuHelpBtn.addEventListener("click", () => {
    // edgecase spotlight schon offen - close & open
    if (spotlightOverlay && !spotlightOverlay.hidden) {
      closeSpotlightAnimated(() => openHelp());
      return;
    }
    openHelp();
  });
}

// Close 
if (helpBackdrop) helpBackdrop.addEventListener("click", () => closeHelpAnimated());
if (helpCloseBtn) helpCloseBtn.addEventListener("click", () => closeHelpAnimated());

// click outside (ui ux)
if (spotlightBackdrop) {
  spotlightBackdrop.addEventListener("click", () => closeSpotlightAnimated());
}
/* =====================================================
   Spotlight Input + Results
===================================================== */
if (spotlightInput) {
  spotlightInput.addEventListener("input", () => {
    renderSpotlightResults(spotlightInput.value);
  });

  spotlightInput.addEventListener("keydown", (e) => {
    // enter öffnet erste app direkt
    if (e.key === "Enter") {
      const first = spotlightResults?.querySelector(".spotlight-item[data-app]");
      if (first) {
        e.preventDefault();
        const appId = first.dataset.app;
        closeSpotlightAnimated(() => openWindow(appId));
      }
    }
  });
}

if (spotlightResults) {
  spotlightResults.addEventListener("click", (e) => {
    const btn = e.target.closest(".spotlight-item[data-app]");
    if (!btn) return;

    const appId = btn.dataset.app;
    closeSpotlightAnimated(() => openWindow(appId));
  });
}

/* =====================================================
   Spotlight Drag TODO FIX! NICHT LÖSBAR
===================================================== */
if (spotlightPanel) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let initialized = false;

  spotlightPanel.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;

    const tag = e.target.tagName.toLowerCase();
    if (tag === "input" || e.target.closest("#spotlight-results")) return;

    e.preventDefault();
    dragging = true;
    initialized = false;

    const rect = spotlightPanel.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    spotlightPanel.classList.add("dragging");
    spotlightPanel.setPointerCapture(e.pointerId);
  });

  spotlightPanel.addEventListener("pointermove", (e) => {
    if (!dragging) return;

    if (!initialized) {
      const rect = spotlightPanel.getBoundingClientRect();
      spotlightPanel.style.left = `${rect.left}px`;
      spotlightPanel.style.top = `${rect.top}px`;
      spotlightPanel.style.bottom = "auto";
      spotlightPanel.style.transform = "none";
      initialized = true;
    }

    const maxX = window.innerWidth - spotlightPanel.offsetWidth;
    const maxY = window.innerHeight - spotlightPanel.offsetHeight;

    const nextLeft = clamp(e.clientX - offsetX, 0, Math.max(0, maxX));
    const nextTop = clamp(e.clientY - offsetY, 0, Math.max(0, maxY));

    spotlightPanel.style.left = `${nextLeft}px`;
    spotlightPanel.style.top = `${nextTop}px`;
  });

  const stopDrag = (e) => {
    dragging = false;
    initialized = false;
    spotlightPanel.classList.remove("dragging");
    if (e?.pointerId != null) {
      try {
        spotlightPanel.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }
  };

  spotlightPanel.addEventListener("pointerup", stopDrag);
  spotlightPanel.addEventListener("pointercancel", stopDrag);
}

/* =====================================================
   Spotlight Schnellbefehle shortcuts
===================================================== */
document.addEventListener("keydown", (event) => {
  // Cmd + Shift + Space
  if (event.metaKey && event.shiftKey && event.code === "Space") {
    event.preventDefault();
    toggleSpotlight();
  }

  // Escape schließt Spotlight oder Help
  if (event.code === "Escape" && spotlightOverlay && !spotlightOverlay.hidden) {
    closeSpotlightAnimated();
  }

  if (event.code === "Escape" && helpOverlay && !helpOverlay.hidden) {
    closeHelpAnimated();
  }
});

/* =====================================================
   Window Manager
===================================================== */
const windowManager = document.querySelector("#window-manager");
let topZ = 10;
let windowCount = 0;
const openWindows = new Map(); // appId -> window element

function bringToFront(win) {
  topZ += 1;
  win.style.zIndex = String(topZ);
}

function enableWindowDrag(win, header) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let activePointerId = null;

  header.style.cursor = "grab";

  const stop = () => {
    dragging = false;
    header.style.cursor = "grab";
    if (activePointerId === null) return;
    try {
      header.releasePointerCapture(activePointerId);
    } catch (_) {}
    activePointerId = null;
  };

  header.addEventListener("pointerdown", (e) => {
    // nur linksklick primary
    if (e.button !== 0) return;
    // ignore traffic-light buttons
    if (e.target.closest(".control")) return;

    dragging = true;
    activePointerId = e.pointerId;
    header.style.cursor = "grabbing";

    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    header.setPointerCapture(e.pointerId);
    bringToFront(win);
    e.preventDefault();
  });

  header.addEventListener("pointermove", (e) => {
    if (!dragging || e.pointerId !== activePointerId) return;

    const maxX = window.innerWidth - win.offsetWidth;
    const maxY = window.innerHeight - win.offsetHeight;

    const x = clamp(e.clientX - offsetX, 0, Math.max(0, maxX));
    const y = clamp(e.clientY - offsetY, 0, Math.max(0, maxY));

    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
  });

  header.addEventListener("pointerup", stop);
  header.addEventListener("pointercancel", stop);
  header.addEventListener("lostpointercapture", stop);
}

function renderLecturesApp(app, container) {
  container.innerHTML = "";

  const layout = document.createElement("div");
  layout.className = "lecture-layout";

  const sectionsEl = document.createElement("div");
  sectionsEl.className = "lecture-sections";

  const pagesEl = document.createElement("div");
  pagesEl.className = "lecture-pages";

  const contentEl = document.createElement("div");
  contentEl.className = "lecture-content";


  layout.appendChild(sectionsEl);
  layout.appendChild(pagesEl);
  layout.appendChild(contentEl);
  container.appendChild(layout);

  const sections = app.config?.sections || [];
  let activeSectionId = sections[0]?.id || null;
  let activePageId = sections[0]?.pages?.[0]?.id || null;

  const getActiveSection = () => sections.find((s) => s.id === activeSectionId) || null;
  const getActivePage = () => {
    const section = getActiveSection();
    return section?.pages?.find((p) => p.id === activePageId) || null;
  };

  const setActive = (sectionId, pageId) => {
    activeSectionId = sectionId;
    const section = getActiveSection();

    // preselect erste seite (ui ux)
    const hasPage = section?.pages?.some((p) => p.id === pageId);
    activePageId = hasPage ? pageId : (section?.pages?.[0]?.id || null);

    renderSections();
    renderPages();
    renderContent();
  };

  const renderSections = () => {
    sectionsEl.innerHTML = "";

    const title = document.createElement("div");
    title.className = "lecture-pane-title";
    title.textContent = "Sections";
    sectionsEl.appendChild(title);

    sections.forEach((section) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lecture-item";
      if (section.id === activeSectionId) btn.classList.add("active");
      btn.textContent = section.title;

      btn.addEventListener("click", () => {
        setActive(section.id, activePageId);
      });

      sectionsEl.appendChild(btn);
    });
  };

  const renderPages = () => {
    pagesEl.innerHTML = "";

    const title = document.createElement("div");
    title.className = "lecture-pane-title";
    title.textContent = "Pages";
    pagesEl.appendChild(title);

    const section = getActiveSection();
    const pages = section?.pages || [];

    if (!pages.length) {
      const empty = document.createElement("div");
      empty.className = "lecture-empty";
      empty.textContent = "No pages in this section.";
      pagesEl.appendChild(empty);
      return;
    }

    pages.forEach((page) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lecture-item";
      if (page.id === activePageId) btn.classList.add("active");
      btn.textContent = page.title;

      btn.addEventListener("click", () => {
        setActive(activeSectionId, page.id);
      });

      pagesEl.appendChild(btn);
    });
  };

  const renderContent = () => {
    contentEl.innerHTML = "";

    const page = getActivePage();
    if (!page) {
      contentEl.innerHTML = "<p style='color:#6e6e73'>Bitte wählen Sie eine Seite aus.</p>";
      return;
    }
    

    const body = document.createElement("div");
    body.className = "lecture-content-body";

    // Check HTML-Datei -> Wenn da laden per iframe
    if (page.src) {
      const iframe = document.createElement("iframe");
      iframe.className = "lecture-page-frame";
      iframe.src = page.src;
      iframe.setAttribute("title", page.title || "Lecture Page");
      iframe.setAttribute("loading", "lazy");

      injectHostStylesIntoIframe(iframe);
      body.innerHTML = "";
      body.appendChild(iframe);
    } else {
      body.innerHTML = page.content || "<p>Seite leer.</p>";
    }

    contentEl.appendChild(body);
  };

  // trigger render
  renderSections();
  renderPages();
  renderContent();

  // if config is empty
  if (!sections.length) {
    contentEl.innerHTML =
      "<p style='color:#6e6e73'>Keinen Abschnitt gefunden. Check application.js</p>";
  }
}

function renderToolApp(app, container) {
  container.innerHTML = "";

  const entry = app.config?.entry;
  if (!entry || entry.type !== "html" || !entry.file) {
    const p = document.createElement("p");
    p.style.color = "#6e6e73";
    p.textContent = "Keine Tool Einstellungen. Check application.js.";
    container.appendChild(p);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.className = "tool-frame";

  const src = resolveAppFile(app, entry.file);
  iframe.src = src;

  // HOTFIX INJECT CHILD (iframe)
  iframe.addEventListener("load", () => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      // Nur einmal injizieren
      if (doc.getElementById("embedded-tool-style")) return;

      const style = doc.createElement("style");
      style.id = "embedded-tool-style";
      style.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: inherit; }
        body { min-height: 100%; }
      `;

      (doc.head || doc.documentElement).appendChild(style);

      // Hook für dein eigenes Tool-CSS (style.css) innerhalb des Tools
      doc.documentElement.classList.add("embedded");
    } catch (e) {
      console.warn("Injection failed check doc:", e);
    }
  });

  iframe.setAttribute("title", app.config?.title || app.id);
  iframe.setAttribute("loading", "lazy");

  container.appendChild(iframe);
}

function renderAppContent(app, container) {
  container.innerHTML = "";

  if (app.type === "lecture" && app.id === "lectures") {
    renderLecturesApp(app, container);
    return;
  }

  if (app.type === "tool") {
    renderToolApp(app, container);
    return;
  }

  const p = document.createElement("p");
  p.textContent = `App loaded: ${app.config?.title || app.id}`;
  container.appendChild(p);
}

async function openWindow(appId) {
  if (!windowManager) return;

  const existing = openWindows.get(appId);
  if (existing) {
    bringToFront(existing);
    return;
  }

  const app = appRegistry[appId];
  if (!app) return;

  // Load per-app manifest (application.js) wenn verfügbar
  await loadAppManifest(app);

  windowCount += 1;

  const win = document.createElement("div");
  win.className = "window";
  win.dataset.appId = appId;

  const w = app.config?.options?.window?.width ?? 700;
  const h = app.config?.options?.window?.height ?? 500;
  win.style.width = `${w}px`;
  win.style.height = `${h}px`;

  // Fenster Starter POSI FIX
  // Platz reservieren für top menue und dock
  const offset = 20 * (windowCount % 10);
  const marginLeft = 20;
  const marginTop = 44;
  const marginRight = 20;
  const marginBottom = 120;

  const maxX = Math.max(marginLeft, window.innerWidth - w - marginRight);
  const maxY = Math.max(marginTop, window.innerHeight - h - marginBottom);

  const startX = 80 + offset;
  const startY = 60 + offset;

  win.style.left = `${clamp(startX, marginLeft, maxX)}px`;
  win.style.top = `${clamp(startY, marginTop, maxY)}px`;

  bringToFront(win);

  const header = document.createElement("div");
  header.className = "window-header";

  const controls = document.createElement("div");
  controls.className = "window-controls";

  ["red", "yellow", "green"].forEach((color) => {
    const btn = document.createElement("button");
    btn.className = `control ${color}`;
    if (color === "red") {
      btn.addEventListener("click", () => {
        openWindows.delete(appId);
        win.remove();
      });
    }
    controls.appendChild(btn);
  });

  const title = document.createElement("div");
  title.className = "window-title";
  title.textContent = app.config?.title || app.id;

  header.appendChild(controls);
  header.appendChild(title);

  const content = document.createElement("div");
  content.className = "window-content";
  if (appId === "lectures") content.classList.add("window-content--lectures");
  renderAppContent(app, content);

  win.appendChild(header);
  win.appendChild(content);

  enableWindowDrag(win, header);
  openWindows.set(appId, win);

  win.addEventListener("mousedown", () => bringToFront(win));
  windowManager.appendChild(win);
}

/* =====================================================
   Dock generierer
===================================================== */
document.querySelectorAll(".dock-item").forEach((item) => {
  item.addEventListener("click", () => {
    const appId = item.dataset.app;

    if (appId === "spotlight") {
      toggleSpotlight();
      return;
    }

    openWindow(appId);
  });
});
