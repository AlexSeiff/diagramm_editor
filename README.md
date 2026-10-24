# Model Studio

A browser-based editor for **BPMN, EPK, ERM, and table-based ER diagrams**. Create and connect shapes, define database tables with primary and foreign keys, and export diagrams as PNG, JPEG, or PDF.

## Features

- Separate canvases for business processes, event chains, conceptual entity relationships, and database tables.
- Drag shapes, edit labels and colors, resize elements, and connect them.
- Table columns with names, SQL data types, PK/FK markers, and automatically adjusted table height.
- Column-specific table relationships with `1`, `0..1`, `1..N`, and `0..N` cardinalities.
- Undo/redo, zoom, fit to view, and automatic browser-local saving.
- Editable JSON project import/export, including older Model Studio projects.
- PNG and JPEG downloads at 1×, 2×, or 3× resolution, plus PDF downloads.
- PNG clipboard copying when supported and permitted by the browser.
- Offline standalone HTML build. No external libraries, fonts, or runtime services.

## Run locally

Install [Node.js](https://nodejs.org/) 22 or later, then run:

```sh
git clone https://github.com/AlexSeiff/diagramm_editor.git
cd diagramm_editor
npm run dev
```

Open **http://localhost:5173**. No package installation is necessary because the project has no dependencies. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

You can also open `index.html` directly in a modern browser. A localhost server or HTTPS is recommended for clipboard support.

## Build and test

```sh
npm test
npm run build
npm run preview
```

The build creates `dist/` with a static website and **`dist/Model Studio.html`**, a self-contained file you can download, share, and open offline. Static assets use relative paths, so the app can be hosted in a subdirectory, including a GitHub Pages project site.

## How to use

1. Choose **BPMN**, **EPK**, **ERM**, or **ER diagram · Tables**.
2. Click a toolbox item to add it. Drag it to reposition it.
3. Select an element to edit its properties, or double-click to rename it.
4. Click **Connect**, then a source and destination shape. Select a connection to edit its label.
5. In table mode, select a connection to choose the source/destination columns and cardinalities.
6. Use **Save project** for editable JSON or **Export diagram** for PNG, JPEG, PDF, and image copying.

Table columns use one line per column in the inspector:

```text
PK | id | INT
FK | customer_id | INT
 | name | VARCHAR(255)
PK FK | order_id | INT
```

Click outside the column editor to apply changes. Column names must be unique within each table. Up to 40 columns are supported per table.

**Shortcuts:** Delete/Backspace removes the selection; Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z redoes; Escape returns to selection mode.

## Data and compatibility

Diagrams stay in your browser's local storage; the app does not upload them. Save JSON backups before clearing browser data or switching browsers or devices. Clipboard access depends on browser support and permissions. JPEG and PDF are downloads; clipboard images use PNG.

This is a visual modeling tool, not a BPMN execution engine, formal notation validator, or SQL schema generator. Table relationships use numeric cardinality labels. PDF exports contain a high-resolution image rather than editable vector objects.

Tests cover editor logic and export markup using a simulated DOM, plus standalone build integrity. They do not replace interactive browser testing of dragging, clipboard permissions, and raster/PDF rendering.

## Project structure

```text
index.html       App interface
style.css        Responsive styling
app.js           Editor, local storage, and export logic
scripts/         Dependency-free development server and build
tests/           Editor and build checks
```
