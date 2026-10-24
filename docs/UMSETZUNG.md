# Umsetzung des Verbesserungsplans

Stand: 24.10.2026 · Version 2.0

## Umgesetzt

- [x] Deutschsprachige Oberfläche, klare Bezeichnungen und Einstieg mit Vorlage, leerem Diagramm oder Import.
- [x] Eigener Name für jedes der vier Diagramme und eindeutige Trennung zwischen Projektdatei und Diagrammexport.
- [x] Neutrales helles Design mit blauem Akzent, zentralen CSS-Variablen, einheitlichen SVG-Icons und sichtbaren Fokuszuständen.
- [x] Einklappbare Bibliothek und Eigenschaften; schließbare Panels auf kleinen Displays.
- [x] Klick und Drag-and-drop zum Hinzufügen, sichtbare Verbindungspunkte und Statushinweise zum Verbinden.
- [x] Zoomen um die Mausposition oder Ansichtmitte, Panning, zentriertes „Alles anzeigen“.
- [x] Mehrfachauswahl, gemeinsames Verschieben, Duplizieren, Ausrichten und Verteilen.
- [x] Orthogonale Verbindungen mit zur Zielseite passender Pfeilrichtung; doppelte gerichtete Verbindungen werden verhindert.
- [x] Tabelleneditor mit Spaltenzeilen, Datentypvorschlägen, PK/FK, Hinzufügen, Entfernen und Sortieren sowie optionalem Textmodus.
- [x] Anhaltende Tabellenfehler und Erhalt ungültiger Entwürfe während der Sitzung; gültige Bearbeitungen speichern unmittelbar.
- [x] Bearbeitung von Labels im Eigenschaftenbereich statt Browser-Prompts.
- [x] Ein Undo-Schritt pro Verschiebung; Auswahl erzeugt keinen Undo-Schritt. Textfelder bilden beim Verlassen einen gemeinsamen Undo-Schritt.
- [x] Getrennte Darstellung und Speicherung; gebündelte lokale Speicherung, sichtbarer Speicherstatus und Fehleranzeige.
- [x] Schema-Versionierung, zentrale Importvalidierung und Migration bisheriger Projektdateien.
- [x] Austauschdialog mit Datei-Sicherung, Wiederherstellung der letzten fünf Sitzungs-/Austauschstände.
- [x] Exportvorschau, SVG, PNG/JPEG/PDF, PNG/SVG-Transparenz und A4-Einstellungen; Ladezustand und dauerhafte Exportfehler.
- [x] Grundlegende Modellprüfung und geprüfte Beispielvorlagen; das BPMN-Beispiel endet auf beiden Pfaden.
- [x] BPMN-Bereiche mit Zuordnung vollständig darin liegender Elemente und gemeinsamer Bewegung.
- [x] Tastaturauswahl und -bewegung, Bearbeitung und Verbindung; Hilfe zu Kürzeln und Screenreader-Bezeichnungen für Werkzeuge.
- [x] Aufteilung in native JavaScript-Module und Erhalt der eigenständigen Offline-HTML.

## Bewusst zurückgestellt / fachliche Grenzen

- Vollständige BPMN-Lanes, Nachrichten- und Datenflüsse sowie eine formale Notationsvalidierung benötigen einen genauer definierten fachlichen Umfang. Die vorhandene Prüfung heißt deshalb ausdrücklich „grundlegende Strukturhinweise“.
- Ein Projekt enthält weiterhin genau ein Diagramm pro Modellart. Beliebig viele Diagramme je Art beziehungsweise eine Projektverwaltung sind ein eigener Ausbau.
- PDF bleibt ein Rasterexport. Für Vektorgrafik ist SVG vorhanden. Ein vektorbasiertes, mehrseitiges Drucklayout ist nicht implementiert.
- Linienführung vermeidet nicht automatisch sämtliche Hindernisse. Automatisches Layout und Miniübersicht bleiben optionale Erweiterungen.
- Dunkelmodus, SQL-/BPMN-Dateiexport und Zusammenarbeit im Netzwerk waren im Plan P3 beziehungsweise vom Bedarf abhängig und sind nicht enthalten.
- Ungültige Tabellenentwürfe bleiben im Arbeitsspeicher der laufenden Sitzung; die lokale Datei und Sicherungen enthalten nur gültige Modelle. Vor Neuladen muss ein ungültiger Entwurf korrigiert werden.

## Validierung

- Node-Prüfungen für Altdaten, alle Vorlagen, abgelehnte Importe, Historie, Verbindungen, Poolzuordnung, SVG-Escaping und lokale Sicherungen.
- Build-Prüfung für statische Assets und importfreie Offline-Datei; Serverprüfung einschließlich Schutz nicht öffentlicher Dateien.
- Echte Browserdurchläufe in isoliertem Microsoft Edge: Erstellung, Ziehen, Auswahl/Undo, Tabellenspalten, Fehlerkorrektur, Duplikate, Tastatur, Zoom, SVG/PNG/JPEG/PDF, Import/Abbrechen, Neuladen und Wiederherstellung.
- Zusätzliche Browserprüfungen für Drag-and-drop, Verbindungen, Mehrfachauswahl/Ausrichtung, Speicherfehler und Offline-HTML.
- Layoutprüfung bei 390, 683, 768, 1024 und 1366 Pixeln Breite, einschließlich schließbarer mobiler Panels.
- Desktop- und Mobilansicht visuell anhand von Browser-Screenshots kontrolliert.

Keine vollständige Screenreader-Abnahme, vollständige WCAG-Zertifizierung oder Prüfung auf allen Browser-Engines. Die Zwischenablage bleibt abhängig von der Browserberechtigung.

## Deine nächsten Ergänzungen

### Was soll angepasst werden?

- [ ] …
- [ ] …

### Welche zurückgestellten Funktionen brauchst du?

> …

### Designfeedback

> …
