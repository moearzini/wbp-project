# WBP Project – JavaScript App Registry & CMS-Simulation

Dieses Projekt entstand im Rahmen des Moduls **Web Programming (WBP)** und zeigt eine
JavaScript-basierte Anwendung mit mehreren Apps, die über eine zentrale App Registry
verwaltet und geladen werden.

## Ziel des Projekts
Ziel war es, zentrale Konzepte moderner Webanwendungen zu verstehen und praktisch
umzusetzen – insbesondere:
- modulare App-Strukturen
- Trennung von Struktur, Logik und Content
- serverloses Arbeiten (file://)
- CMS-ähnliche Organisation von Inhalten

## Architekturüberblick
- **APP_REGISTRY (index.html)**  
  Zentrale Registrierung aller Apps (Lectures & Tools)

- **application.js (pro App)**  
  JavaScript-basiertes Manifest zur Konfiguration der jeweiligen App

- **iframe-Rendering**  
  Inhalte und Tools werden gekapselt über iframes geladen

- **Keine JSON-Manifeste, kein Backend**  
  Bewusste Entscheidung zugunsten eines rein clientseitigen Ansatzes

## Enthaltene Apps
- **Lectures-App**  
  Vorlesungsnotizen mit CMS-ähnlicher Struktur (Sections & Pages)

- **Tool-Apps**
  - Währungsrechner
  - Buchstaben-Counter
  - Kontakte
  - Accordeon-Demo
  - GitHub-Übersichtsseite (mit externem Link zum Repository)

## Hinweise
- Das Projekt ist vollständig **ohne Webserver** lauffähig
- Externe Seiten wie GitHub können aus Sicherheitsgründen nicht direkt
  in iframes eingebettet werden
