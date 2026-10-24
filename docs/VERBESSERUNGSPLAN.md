# Model Studio – Verbesserungsplan

Stand: 24.10.2026 · Status: Entwurf zur gemeinsamen Abstimmung

## So kannst du den Plan bearbeiten

Ändere, streiche oder ergänze die Vorschläge direkt. Die Checkboxen markieren später erledigte Arbeiten; sie sind aktuell keine Freigabe zur Umsetzung. Unter jedem Themenblock ist Platz für deine Wünsche.

- **P1:** Grundlage für eine deutlich bessere Bedienung.
- **P2:** Nächster sinnvoller Ausbau.
- **P3:** Optional, nach Klärung des tatsächlichen Bedarfs.

## 1. Grundlage und Grenzen der Prüfung

Geprüft wurden `dist/index.html`, `dist/style.css`, `dist/app.js` und `check-tables.cjs` im Projekt `C:\Users\alexa\OneDrive\Desktop\model-studio`.

Das Projekt ist derzeit ein browserbasierter Diagrammeditor mit BPMN, EPK, klassischem ER-Modell und tabellenbasiertem ER-Diagramm. Es bietet lokale Speicherung, JSON-Projektdateien und Bild-/PDF-Export. Im vorhandenen Ordner liegen die Anwendung unter `dist/` und ein kleiner Test für Tabellenfunktionen; eine gesonderte Quellstruktur oder Paketkonfiguration ist dort nicht vorhanden.

Die folgenden Befunde stammen aus der statischen Codeprüfung. Es gab keinen visuellen Browsertest und keine Tests mit echten Nutzern. Aussagen zur Gestaltung sind aus den Layout- und Stilregeln abgeleitete Bewertungen. Laufzeitverhalten, Kontraste und Darstellung auf echten Geräten müssen vor einer Umsetzung zusätzlich geprüft werden.

## 2. Meine wichtigste Empfehlung

Model Studio sollte sich wie ein klarer Arbeitsbereich zum Modellieren anfühlen. Der Einstieg erklärt den nächsten Schritt, die Zeichenfläche bekommt mehr Raum, und Eigenschaften erscheinen passend zur aktuellen Auswahl. Dekorative Texte treten zurück. Fachbegriffe bleiben verständlich und werden bei Bedarf erklärt.

Ich würde zuerst Bedienabläufe und Informationshierarchie verbessern und anschließend die visuelle Sprache darauf aufbauen. Eine reine Änderung der Farben würde die größten Schwierigkeiten nicht lösen.

**Deine Ergänzungen / abweichende Richtung:**

> Hier ergänzen …

## 3. Einstieg, Sprache und Orientierung — P1

**Befund:** Die Oberfläche ist englisch. Kürzel wie BPMN, EPK und ERM setzen Vorwissen voraus. Beim Start erscheint ein Beispielprozess; andere Modellarten besitzen zunächst leere Zeichenflächen. „New diagram“ leert das aktuelle Board, statt ein weiteres Diagramm anzulegen. Ein gemeinsamer Titel gilt für alle Boards.

**Vorschlag:**

- [ ] Zuerst Zielsprache festlegen; für eine deutschsprachige Zielgruppe alle Bedienelemente, Meldungen und Hilfen konsistent übersetzen.
- [ ] Einen schlanken Einstieg mit „Leeres Diagramm“, „Vorlage verwenden“ und „Projekt öffnen“ anbieten.
- [ ] Modellarten mit Namen und kurzer Erklärung darstellen, etwa „BPMN – Geschäftsprozesse“ und „ER-Diagramm – Datenbanktabellen“.
- [ ] Leere Zeichenflächen mit einer konkreten ersten Aktion versehen: „Ziehe ein Element auf die Fläche oder wähle eine Vorlage“.
- [ ] „Neue Zeichnung“ und „Zeichenfläche leeren“ als getrennte Aktionen behandeln. Falls zunächst nur ein Board je Modellart unterstützt wird, die Aktion ehrlich „Aktuelles Diagramm leeren“ nennen.
- [ ] Festlegen, ob ein Projekt mehrere Diagramme enthält. Bei mehreren Diagrammen benötigen diese eigene Namen und eine erkennbare Übersicht.

**Abnahme:** Ein neuer Nutzer kann ohne externe Anleitung eine passende Modellart wählen, zwei Elemente erstellen, verbinden und sein Projekt wieder öffnen.

**Deine Anpassungen:**

> Zielgruppe / Sprache / gewünschter Einstieg: …

## 4. Aufbau des Arbeitsbereichs — P1

**Befund:** Kopfzeile und Navigation belegen zusammen 156 Pixel. Links und rechts stehen feste Seitenleisten. Hinweise und Werbetexte beanspruchen zusätzlichen Raum. Auf kleinen Geräten wird der Inspektor bei einer Auswahl als festes Overlay eingeblendet; eine eigene Schließen-Schaltfläche ist dafür nicht vorgesehen.

**Vorschlag:**

- [ ] Kopfbereich kompakter gestalten: Projektname und Speicherstatus links, Dateiaktionen und Export rechts.
- [ ] Die Modellart als klar erkennbaren Kontext darstellen; Modellwechsel und Zeichenwerkzeuge optisch trennen.
- [ ] Linke Werkzeugleiste einklappbar machen und Formen nach fachlicher Funktion gruppieren.
- [ ] Rechts einen kontextbezogenen, einklappbaren Inspektor anbieten. Ohne Auswahl reicht eine kurze Hilfe.
- [ ] Slogans wie „Room for the big picture“ durch konkrete Hilfen ersetzen oder entfernen.
- [ ] Auf kleinen Displays Eigenschaften als schließbares Panel mit eindeutiger Rückkehr zur Zeichenfläche darstellen.
- [ ] Editorhöhe und Mindestbreiten so überarbeiten, dass kurze Fenster und schmale Geräte sinnvoll bedienbar bleiben.

**Abnahme:** Bei 1366 × 768 Pixeln bleibt die Zeichenfläche der klare Mittelpunkt. Bei 390 Pixeln Breite sind Hauptaktionen erreichbar und Eigenschaften verdecken den Arbeitsbereich nicht dauerhaft.

**Deine Anpassungen:**

> Gewünschter Aufbau / Seitenleisten / mobile Nutzung: …

## 5. Neue visuelle Richtung — P1

**Befund:** Die Gestaltung nutzt fast durchgehend helle Grün- und Grautöne. Viele Hilfs- und Statusangaben sind nur 9–12 Pixel groß. Textzeichen dienen als Icons; die Palette verwendet für mehrere Formen keine eindeutig unterscheidbaren fachlichen Symbole. Die visuelle Hierarchie zwischen Hauptaktion, Werkzeug und Information ist schwach.

**Empfohlene Richtung: ruhiger, präziser Diagrammeditor.** Helle neutrale Flächen, deutliche Schrift, klare Konturen und eine einzelne Akzentfarbe für aktive Werkzeuge und Auswahl. Fachliche Farben gehören primär in das Diagramm.

| Bereich | Konkreter Entwurf |
| --- | --- |
| Grundflächen | Weiß für Panels, sehr helles neutrales Grau für den Arbeitsbereich |
| Akzent | Blau oder Petrol für Auswahl, Fokus und Hauptaktionen; endgültig nach deinem Geschmack |
| Schrift | Gut lesbare Systemschrift; reguläre Bedientexte etwa 14 Pixel, Hilfstexte möglichst 12–13 Pixel |
| Hierarchie | Wenige deutliche Überschriften; erklärende Untertitel nur dort, wo sie helfen |
| Icons | Einheitliche SVG-Icons mit Beschriftung oder zugänglichem Namen |
| Formen | Notationsgerechte Symbole, erkennbare Auswahlrahmen und Verbindungspunkte |
| Abstände | Einheitliches Raster, beispielsweise 4/8/12/16/24 Pixel |
| Zustände | Klar unterscheidbare Standard-, Hover-, Fokus-, Auswahl-, Fehler- und deaktivierte Zustände |

- [ ] Farben, Abstände, Typografie, Radien und Konturen als zentrale CSS-Variablen definieren.
- [ ] Zunächst einen visuellen Entwurf mit Beispielprozess und Tabellenmodell abstimmen.
- [ ] Text- und Bedienkontraste messen und Tastaturfokus deutlich sichtbar gestalten.
- [ ] Einen optionalen Dunkelmodus erst nach der Überarbeitung des hellen Designs bewerten — P3.

**Deine Designvorgaben:**

> Stil: …
>
> Wunschfarben / Farben, die du nicht möchtest: …
>
> Referenzen oder Beispiele: …
>
> Eher kompakt oder großzügig: …

## 6. Zeichnen, Verbinden und Navigation — P1

**Befund:** Neue Elemente erscheinen anhand ihrer Anzahl an festen Koordinaten. Es gibt Rastereinrasten, aber keine Mehrfachauswahl oder Ausrichtungshilfen. Verbindungen entstehen über einen separaten Modus und zwei Klicks. Zoom verändert die ViewBox ab Ursprung; Verschieben der Ansicht fehlt. „Fit to view“ berücksichtigt die tatsächliche Größe des sichtbaren Bereichs und die Zentrierung nicht gezielt.

- [ ] Elemente per Drag-and-drop an der gewünschten Stelle ablegen; Klick als zugängliche Alternative behalten und im sichtbaren Bereich platzieren.
- [ ] Verbindungspunkte bei Auswahl oder Annäherung anzeigen. Quelle, Ziel und laufenden Verbindungsvorgang deutlich markieren.
- [ ] Den nächsten Schritt direkt anzeigen: „Zielelement auswählen · Esc zum Abbrechen“.
- [ ] Zoomen um Mausposition beziehungsweise Bildschirmmitte und Verschieben der Zeichenfläche ergänzen.
- [ ] „Alles anzeigen“ anhand der realen Fläche berechnen, einschließlich Beschriftungen und sinnvoller Ränder, und das Diagramm zentrieren.
- [ ] Mehrfachauswahl, gemeinsame Bewegung sowie Ausrichten und gleichmäßiges Verteilen ergänzen — P2.
- [ ] Verbindungslinien besser führen; überlappende und doppelte Verbindungen erkennen — P2.
- [ ] Optionales automatisches Layout und eine Miniübersicht für große Diagramme bewerten — P3.

**Abnahme:** Ein außerhalb der aktuellen Ansicht liegendes Element lässt sich über „Alles anzeigen“ wiederfinden. Ein-/Auszoomen verliert nicht den bearbeiteten Bereich. Ein Verbindungsvorgang lässt sich sichtbar abbrechen.

**Deine Anpassungen:**

> Wichtigste Zeichenfunktionen: …

## 7. Eigenschaften und Tabelleneditor — P1

**Befund:** Tabellen werden über Zeilen im Format `PK | id | INT` bearbeitet. Nutzer müssen Syntax und erlaubte Schlüssel kennen. Fehler erscheinen als kurzlebige Toastmeldung. Änderungen an Beschriftungen werden über `onchange` übernommen; zwischen sichtbarer Eingabe und gespeichertem Modell besteht dadurch ein eigener Übernahmeschritt. Doppelklick öffnet einen nativen Browser-Prompt.

- [ ] Tabellenfelder als echte Zeilen mit Eingaben für Name, Datentyp, Primär- und Fremdschlüssel darstellen.
- [ ] „Spalte hinzufügen“, Entfernen und Reihenfolge ändern direkt anbieten.
- [ ] Syntaxbasierte Eingabe optional als Expertenmodus erhalten — P2.
- [ ] Validierungsfehler direkt an der betroffenen Zeile erklären und problematische Eingaben zur Korrektur erhalten.
- [ ] Beschriftungen direkt am Element oder in einem klaren Eigenschaftenfeld bearbeiten; Browser-Prompts ersetzen.
- [ ] Übernahmeverhalten eindeutig machen und sicherstellen, dass Fokuswechsel, Auswahl und Speichern keine Eingaben verlieren.
- [ ] Eigenschaften je Elementtyp begrenzen: Tabellenhöhe wird beispielsweise automatisch berechnet; ein entsprechender Hinweis ist verständlicher als ein still ausgeblendetes Feld.
- [ ] Beziehungen verständlich benennen: Quell-/Zieltabelle, jeweilige Spalte und Kardinalität mit Beispiel erklären.

**Abnahme:** Eine Tabelle mit drei Spalten und einer Fremdschlüsselbeziehung kann ohne Kenntnis einer speziellen Textsyntax angelegt werden. Fehler bleiben sichtbar, bis sie korrigiert sind.

**Deine Anpassungen:**

> Benötigte Datentypen / gewünschte Tabellenfunktionen: …

## 8. Fachliche Modellqualität — P2

**Befund:** Die Anwendung bietet Formen und Verbindungen, prüft jedoch keine fachlichen Modellierungsregeln. „Pool / lane“ ist ein Rechteck mit Trennlinie; eine eigentliche Zuordnung von Elementen zu Lanes fehlt. Verbindungen sind weitgehend generisch. Das BPMN-Beispiel enthält einen Zweig ohne Endereignis.

- [ ] Festlegen, ob ein einfacher Lerneditor oder ein fachlich belastbares Modellierungswerkzeug das Ziel ist.
- [ ] BPMN-Pools und Lanes als Container mit zugeordneten Elementen behandeln, falls vollständige Prozessmodellierung gewünscht ist.
- [ ] Fachliche Verbindungstypen und zulässige Kombinationen pro Notation definieren.
- [ ] Eine Prüffunktion mit nachvollziehbaren Hinweisen zu unverbundenen Elementen, offenen Pfaden oder unvollständigen Beziehungen ergänzen.
- [ ] Warnungen zum betreffenden Element navigierbar machen; bewusst unfertige Diagramme weiterhin bearbeiten lassen.
- [ ] Vorlagen fachlich überprüfen und je Modellart mindestens ein vollständiges, verständliches Beispiel anbieten.

**Deine Anpassungen:**

> Lernhilfe oder professioneller Editor? Welche Regeln sind zwingend? …

## 9. Speichern, Öffnen und Rückgängig — P1

**Befund:** Der gesamte Zustand liegt unter einem einzelnen LocalStorage-Schlüssel. „Save project“ lädt JSON herunter; die automatische Speicherung betrifft nur diesen Browser. Öffnen ersetzt den aktuellen Zustand ohne vorgelagerten Hinweis. Beim bloßen Anklicken eines Elements entsteht bereits ein Undo-Schritt. Während des Verschiebens wird bei jedem Rendern gespeichert.

- [ ] „Automatisch in diesem Browser gespeichert“ und „Projektdatei herunterladen“ sprachlich klar unterscheiden.
- [ ] Den letzten erfolgreichen Speicherzeitpunkt und Speicherfehler dauerhaft erkennbar machen.
- [ ] Vor dem Ersetzen eines Projekts eine klare Entscheidung einschließlich Sicherungsmöglichkeit anbieten.
- [ ] Undo-Schritte nach tatsächlichen Bearbeitungen bilden: eine Verschiebung ist eine Aktion, reine Auswahl keine.
- [ ] Titeländerungen ebenfalls in das festgelegte Rückgängig-Konzept aufnehmen.
- [ ] Speichern bündeln und Zeichnen von dauerhafter Speicherung trennen, damit große Modelle flüssig bleiben.
- [ ] Importdaten zentral und vollständig validieren, einschließlich eindeutiger IDs, positiver Größen, Tabellenstruktur und gültiger Referenzen.
- [ ] Wiederherstellbare lokale Versionen oder mehrere lokale Projekte ergänzen — P2.

**Abnahme:** Auswahl verbraucht keinen Undo-Schritt. Nach Neuladen erscheint der zuletzt bestätigte Bearbeitungsstand. Ein Importfehler verändert das bestehende Projekt nicht. Speicherprobleme verschwinden nicht unbemerkt.

**Deine Anpassungen:**

> Gewünschtes Speicherverhalten / mehrere Projekte / Sicherungen: …

## 10. Export und Weitergabe — P2

**Befund:** PNG, JPEG und PDF sind vorhanden. Das PDF enthält ein Rasterbild und keine Vektorgrafik. Es gibt keine Exportvorschau, Seiteneinstellung oder SVG-Option. Exportgrenzen werden primär anhand der Elemente berechnet; lange Beschriftungen benötigen eine zusätzliche Prüfung.

- [ ] Exportvorschau mit sichtbarem Ausschnitt anbieten.
- [ ] SVG als skalierbares Format ergänzen.
- [ ] Für PDF Papierformat, Ausrichtung und Anpassung auf die Seite anbieten; vektorbasierten Export bei Bedarf prüfen.
- [ ] Hintergrund, Ränder und Auflösung verständlich einstellbar machen.
- [ ] Export während der Verarbeitung mit Ladezustand und Schutz vor Mehrfachklicks versehen.
- [ ] Lange Labels und sehr große Diagramme gezielt auf abgeschnittene Inhalte prüfen.
- [ ] SQL- oder BPMN-Dateiexport erst nach Bestätigung des Bedarfs und der fachlichen Anforderungen planen — P3.

**Deine Anpassungen:**

> Benötigte Exportformate / Druckanforderungen: …

## 11. Tastatur und Zugänglichkeit — P1/P2

**Befund:** Elemente im SVG besitzen keinen eigenen Tastaturzugang. Die Zeichenfläche wird als Bild ausgezeichnet, obwohl sie interaktiv ist. Mehrere Symbolbuttons benötigen eindeutigere zugängliche Namen. Ein Fokusstil existiert bereits, ebenso Undo/Redo über Strg/Cmd+Z und Umschalt; die Kernarbeit bleibt jedoch stark mausabhängig.

- [ ] Icon-Schaltflächen eindeutig beschriften und Werkzeugzustände zugänglich auszeichnen — P1.
- [ ] Tabs, Panels, Dialoge und Eingaben mit konsistenter Fokusführung bedienen lassen — P1.
- [ ] Elemente per Tastatur auswählen, verschieben, umbenennen und verbinden können — P2.
- [ ] Sichtbare Hilfe zu Tastenkürzeln anbieten — P2.
- [ ] Lange Beschriftungen, vergrößerten Browsertext und die Nutzung bei 200 % Zoom prüfen — P1.
- [ ] Nicht ausschließlich Farbe zur Vermittlung von Auswahl, Fehlern oder Modellbedeutung verwenden — P1.

**Deine Anpassungen:**

> Besondere Anforderungen / Geräte / Eingabemethoden: …

## 12. Technische Grundlage für die Überarbeitung — P1/P2

**Befund:** Die Logik liegt in einer einzelnen Datei. Tabellenfunktionen werden durch nachträgliches Ersetzen bestehender Funktionen ergänzt. Rendern aktualisiert zugleich SVG, Inspektor und Speicherung. Das erschwert gezielte Erweiterungen und verlässliche Eingabeabläufe.

- [ ] Eine nachvollziehbare Quellstruktur für Zustand, Modelltypen, Darstellung, Eingaben, Speicherung und Export anlegen.
- [ ] Zentrale Datenvalidierung und versionierte Migrationen für ältere Projektdateien definieren.
- [ ] Rendering, Auswahlzustand, Eigenschaftenbearbeitung und Speicherung voneinander entkoppeln.
- [ ] Vorhandene Funktionalität durch gezielte Prüfungen für Import/Export, Migration, Undo/Redo und Tabellenbeziehungen absichern.
- [ ] Browserprüfungen für die wichtigsten vollständigen Nutzerabläufe und Bildschirmgrößen ergänzen.
- [ ] Zunächst prüfen, ob native JavaScript-Module ausreichen. Ein Frameworkwechsel ist keine Voraussetzung für das Redesign.

**Deine Anpassungen:**

> Technische Vorgaben / Hosting / gewünschte Bibliotheken: …

## 13. Empfohlene Reihenfolge

| Phase | Ergebnis | Voraussetzung für den nächsten Schritt |
| --- | --- | --- |
| 1. Zielbild | Zielgruppe, Sprache, Kernfunktionen und Designrichtung festlegen | Deine Ergänzungen zu diesem Plan |
| 2. Designentwurf | Neuer Arbeitsbereich mit Beispielprozess und Tabellenansicht | Aufbau, Lesbarkeit und Stil abgestimmt |
| 3. Bediengrundlage | Navigation, Erstellen, Verbinden, Eigenschaften, Zoom und Undo verbessern | Kernabläufe erfolgreich geprüft |
| 4. Verlässlichkeit | Speicherung, Import, Wiederherstellung und Export überarbeiten | Bestehende Dateien bleiben verwendbar |
| 5. Fachlicher Ausbau | Notationsprüfung, weitere Vorlagen und Komfortfunktionen | Umfang pro Modellart entschieden |

Nicht alle Vorschläge müssen umgesetzt werden. Für eine erste deutlich bessere Version würde ich Phase 1–4 priorisieren und den fachlichen Ausbau nach deinem Einsatzbereich begrenzen.

## 14. Deine Entscheidungen und Ergänzungen

### Zielgruppe und Einsatz

- Wer verwendet das Tool? …
- Welche Modellart ist am wichtigsten? …
- Welche drei Abläufe müssen besonders einfach sein? …
- Desktop, Tablet oder Smartphone? …

### Unbedingt umsetzen

- [ ] …
- [ ] …
- [ ] …

### Später umsetzen

- [ ] …
- [ ] …

### Nicht gewünscht

- …

### Weitere Ideen

- …

### Freigabe für den nächsten Arbeitsschritt

> Gewünschte nächste Phase und Umfang: …

Die Anwendung wurde im Rahmen dieser Prüfung nicht verändert.
