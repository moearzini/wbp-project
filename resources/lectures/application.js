// resources/lectures/application.js
// Lectures-App-Manifest ohne fetch
// Wichtig: Page-`src` wird relativ zu DIESER Datei (application.js) aufgelöst!!!

(() => {
  const lectures = window.APP_REGISTRY?.lectures;
  if (!lectures) {
    console.warn("Lectures app not registered in APP_REGISTRY.");
    return;
  }

  // Base-URL = Ordner, in dem application.js liegt!!!!
  const scriptUrl = (document.currentScript && document.currentScript.src) ? document.currentScript.src : "";
  const baseUrl = scriptUrl ? new URL("./", scriptUrl).toString() : "";
  const rel = (p) => (baseUrl ? new URL(p, baseUrl).toString() : p);

  lectures.config = {
    id: "lectures",
    type: "lecture",
    title: "TwoNote – WebProg Vorlesungen",
    icon: "book",
    options: {
      searchable: true,
      window: { width: 1100, height: 650 }
    },
    sections: [
      {
        id: "vl1",
        title: "Vorlesung 1: Einführung",
        pages: [
          { id: "vl1-ueberblick", title: "Überblick & Ziel der Vorlesung", src: rel("content/vl1/ueberblick.html") },
          { id: "vl1-motivation-webapps", title: "Motivation: Dynamische Webanwendungen", src: rel("content/vl1/motivation-webapps.html") },
          { id: "vl1-webarchitektur", title: "Grundlegende Web-Architekturen", src: rel("content/vl1/webarchitektur.html") },
          { id: "vl1-javascript-einordnung", title: "JavaScript & Skriptsprachen – Einordnung", src: rel("content/vl1/javascript-einordnung.html") }
        ]
      },
      { id: "vl2", title: "Vorlesung 2: JavaScript Grundlagen I (Variablen & Programmstruktur)", pages: [
          { id: "vl2-tooling", title: "Setup & Editor: Visual Studio Code", src: rel("content/vl2/setup-editor.html") },
          { id: "vl2-variablen", title: "JavaScript Variablen & Bindungen", src: rel("content/vl2/variablen-bindungen.html") },
          { id: "vl2-programmstruktur", title: "Programmstruktur: Bedingungen & Schleifen", src: rel("content/vl2/programmstruktur.html") }
        ] },
      { id: "vl3", title: "Vorlesung 3: JavaScript Grundlagen II (Funktionen)", pages: [
          { id: "vl3-funktionen-basics", title: "Funktionen: Grundlagen & Syntax", src: rel("content/vl3/funktionen-grundlagen.html") },
          { id: "vl3-arrow-rest-spread", title: "Pfeilfunktionen, Rest & Spread", src: rel("content/vl3/arrow-rest-spread.html") },
          { id: "vl3-hof", title: "Higher-Order Functions (HOC)", src: rel("content/vl3/higher-order-functions.html") }
        ] },
      { id: "vl4", title: "Vorlesung 4: Strings & Eingaben (Formulare)", pages: [
          { id: "vl4-strings", title: "Strings: wichtige Operationen", src: rel("content/vl4/strings.html") },
          { id: "vl4-formulare", title: "Eingaben über Formulare", src: rel("content/vl4/formulare.html") }
        ] },
      { id: "vl5", title: "Vorlesung 5: Objekte (inkl. JSON, Klassen, this/bind)", pages: [
          { id: "vl5-objekte-basics", title: "Objekte: Properties, Methoden, this", src: rel("content/vl5/objekte-grundlagen.html") },
          { id: "vl5-prototypen-klassen", title: "Prototypen & Klassen", src: rel("content/vl5/prototypen-klassen.html") },
          { id: "vl5-json", title: "JSON: parse & stringify", src: rel("content/vl5/json.html") },
          { id: "vl5-collections", title: "Collections: Arrays & Sets", src: rel("content/vl5/collections.html") }
        ] },
      { id: "vl6", title: "Vorlesung 6: jQuery (Framework & DOM)", pages: [
          { id: "vl6-dom-bibliotheken", title: "DOM & JavaScript-Bibliotheken", src: rel("content/vl6/dom-bibliotheken.html") },
          { id: "vl6-jquery-selectors", title: "jQuery Basics: Selectors", src: rel("content/vl6/jquery-selectors.html") },
          { id: "vl6-jquery-dom-events", title: "jQuery: DOM-Manipulation & Events", src: rel("content/vl6/jquery-dom-events.html") }
        ] },
      { id: "vl7", title: "Vorlesung 7: Events, Window-Objekt & Navigation", pages: [
          { id: "vl7-events-js", title: "Event-Behandlung in JavaScript", src: rel("content/vl7/events-js.html") },
          { id: "vl7-events-jquery", title: "Event-Modell von jQuery", src: rel("content/vl7/events-jquery.html") },
          { id: "vl7-window", title: "Window-Objekt & Browser-Steuerung", src: rel("content/vl7/window-objekt.html") },
          { id: "vl7-navigation", title: "Interaktive Navigation (Akkordeon)", src: rel("content/vl7/navigation-accordion.html") }
        ] },
      { id: "vertiefung", title: "Vertiefung: CMS-Simulation (Manifest & App Registry)", pages: [
          { id: "cms-idee", title: "Idee: CMS-Simulation nur mit JavaScript", src: rel("content/vertiefung/cms-idee.html") },
          { id: "cms-manifest-registry", title: "Bausteine: Manifest, application.js & App Registry", src: rel("content/vertiefung/bausteine-manifest-registry.html") },
          { id: "cms-probleme-huerden", title: "Probleme & Hürden auf der Reise", src: rel("content/vertiefung/probleme-huerden.html") },
          { id: "cms-iframes", title: "Rendering: Pages als HTML via iframes", src: rel("content/vertiefung/rendering-iframes.html") }
        ] },
        { id: "empty", title: "Neuer Abschnitt", pages: [
        ] }
    ]
  };
})();