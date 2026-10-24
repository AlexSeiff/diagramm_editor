# Model Studio

Ein deutschsprachiger Diagrammeditor für **BPMN, EPK, ER-Modelle und Datenbanktabellen**. Ohne Anmeldung, ohne externe Dienste und ohne Laufzeit-Abhängigkeiten.

## Lokal starten

Node.js ab Version 22 installieren und im Projektordner ausführen:

```sh
npm run dev
```

Dann `http://localhost:5173` öffnen. Eine Paketinstallation ist für die Anwendung nicht nötig. Unter Windows bei gesperrten PowerShell-Skripten `npm.cmd` verwenden.

## Funktionen

- Klarer Einstieg mit leerem Diagramm, Vorlage oder Projektdatei.
- Vier getrennte, individuell benennbare Diagramme je Projekt.
- Einklappbare Bibliothek und kontextbezogene Eigenschaften, auch auf schmalen Geräten.
- Elemente durch Klick oder Drag-and-drop hinzufügen, verschieben, duplizieren und löschen.
- Verbindungen über Verbindungspunkt, Werkzeug oder Tastatur erstellen; doppelte gerichtete Verbindungen werden verhindert.
- Mehrfachauswahl, gemeinsames Verschieben, Ausrichten und Verteilen.
- BPMN-Bereiche mit geometrischer Zuordnung: vollständig darin platzierte Elemente bewegen sich mit dem Bereich.
- Tabelleneditor mit Spaltenzeilen, Datentypen, PK/FK, Sortierung und optionaler Texteingabe.
- Spaltenbezogene Tabellenbeziehungen mit Kardinalitäten.
- Tastaturbedienung, zentrierter Zoom, Verschieben der Ansicht und „Alles anzeigen“.
- Grundlegende Modellhinweise mit Navigation zum betroffenen Element.
- Undo/Redo für Modelländerungen, einschließlich Projekt- und Diagrammnamen.
- Automatische Browserspeicherung, sichtbare Speicherfehler und fünf lokale Wiederherstellungsstände.
- Validierter JSON-Import mit Unterstützung bisheriger Projektdateien; Sicherungsoption vor dem Ersetzen.
- Exportvorschau, SVG, PNG, JPEG und PDF; transparente PNG/SVG sowie A4-PDF im Hoch-/Querformat.
- Eigenständige Offline-HTML-Datei im Build.

## Bedienung

1. Modellart wählen und eine Vorlage verwenden oder Elemente hinzufügen.
2. Ein Element auswählen: Rechts öffnet sich der Eigenschaftenbereich. Mit Enter oder Doppelklick die Beschriftung bearbeiten.
3. „Verbinden“ wählen, Quelle und Ziel anklicken. Alternativ den sichtbaren Verbindungspunkt eines Elements verwenden.
4. In Tabellen Spalten direkt bearbeiten. Fehler werden anhaltend angezeigt; nur gültige Spalten werden in das gespeicherte Modell übernommen. Ungültige Entwürfe bleiben während der laufenden Sitzung beim Wechsel der Auswahl erhalten.
5. „Projektdatei“ lädt das ganze Projekt als weiterbearbeitbare JSON-Datei herunter. „Exportieren“ exportiert nur das aktuelle Diagramm.

| Tastenkürzel | Aktion |
| --- | --- |
| Strg/Cmd + Z | Rückgängig |
| Strg/Cmd + Umschalt + Z | Wiederholen |
| Strg/Cmd + D | Auswahl duplizieren |
| Umschalt + Klick | Mehrfachauswahl |
| Strg/Cmd + A | Alle Elemente auswählen |
| Pfeiltasten | Auswahl um 10 Pixel verschieben |
| Umschalt + Pfeiltasten | Auswahl um 1 Pixel verschieben |
| Enter / F2 | Eigenschaften der fokussierten Auswahl bearbeiten |
| C, dann Enter | Verbindung am fokussierten Element beginnen; mit Tab das Ziel fokussieren und Enter drücken |
| Leertaste + Ziehen | Ansicht verschieben |
| Strg/Cmd + Mausrad | Um die Mausposition zoomen |
| Mausrad | Ansicht verschieben |
| Entf / Rücktaste | Auswahl löschen |
| Esc | Verbindung oder Verschiebung abbrechen, Auswahl aufheben |

## Build und Tests

```sh
npm test
npm run build
npm run preview
```

`dist/` enthält die statische Website und **`Model Studio.html`** zum direkten Offline-Öffnen. Die Quelldateien verwenden ES-Module und benötigen deshalb einen lokalen Server; die gebündelte Offline-Datei benötigt keinen Server. Der Build löst die explizit gelisteten lokalen Module auf; ein Framework oder externer Bundler ist nicht erforderlich.

Die Node-Tests prüfen Migrationen, Importvalidierung, Undo/Redo, Beziehungen, Pools, SVG-Ausgabe, Sicherungen, Build und Server. Die optionale Browserprüfung benötigt eine separat verfügbare Playwright-Installation und einen laufenden Entwicklungsserver:

```sh
npm run test:browser
```

Alternativ `PLAYWRIGHT_MODULE` auf den Pfad einer vorhandenen Playwright-Installation setzen. `BROWSER_CHANNEL=msedge` verwendet das installierte Edge; ohne Angabe verwendet Playwright sein Chromium. `TEST_URL` überschreibt den Server, `SCREENSHOT_DIR` aktiviert Bildschirmaufnahmen. Die Browserprüfung verwendet ausschließlich isolierte Testprofile.

## Daten und Grenzen

Projekte bleiben im lokalen Speicher des jeweiligen Browsers. Alte Daten unter `model-studio-v1` werden gelesen und nicht gelöscht; neue Änderungen werden versioniert unter `model-studio-v2` gespeichert. Sicherungen entstehen beim Sitzungsstart sowie vor Austausch, Leeren oder Wiederherstellung. Sie ersetzen keine heruntergeladenen Projektdateien. Inkonsistente gespeicherte Daten werden nicht automatisch überschrieben; eine gültige importierte Datei ermöglicht den Neustart.

Die Modellprüfung bietet grundlegende Hinweise, keine vollständige BPMN-/EPK-Konformitätsprüfung. Pools sind visuelle Bereiche mit Elementzuordnung; verschachtelte Lanes, Message-Flows und ausführbare BPMN-Dateien sind nicht implementiert. Verbindungen werden orthogonal geführt, aber nicht automatisch um sämtliche Hindernisse gelegt. PDF enthält ein hochauflösendes Rasterbild; SVG ist das skalierbare Vektorformat. Kopieren in die Zwischenablage hängt von Browserfreigabe und sicherem Kontext ab.

Optionale Erweiterungen und der umgesetzte Umfang stehen in [docs/UMSETZUNG.md](docs/UMSETZUNG.md). Der ursprüngliche, weiterhin editierbare Plan liegt in [docs/VERBESSERUNGSPLAN.md](docs/VERBESSERUNGSPLAN.md).

## Struktur

```text
index.html       Oberfläche und Dialoge
style.css        Designvariablen und responsive Gestaltung
app.js           Interaktion und Ansichtssteuerung
src/model.js     Datenmodell, Validierung, Vorlagen, Historie
src/render.js    SVG-Darstellung und Exportgrenzen
src/storage.js   Speicherung und Wiederherstellungsstände
src/export.js    Bild-, SVG- und PDF-Ausgabe
src/icons.js     Einheitliche SVG-Symbole
scripts/         Statischer Entwicklungsserver und Offline-Build
tests/           Modell-, Build-, Server- und Browserprüfungen
docs/            Verbesserungsplan und Umsetzungsstand
```
