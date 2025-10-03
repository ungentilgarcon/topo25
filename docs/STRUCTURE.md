# Project Structure

This document explains the folder layout and key components of the BandsTour (Topogram fork) app.

```
/topogram
  ├─ .meteor/                 # Meteor app metadata and package versions
  ├─ imports/
  │   ├─ api/                 # Collections, publications, methods, endpoints
  │   ├─ client/
  │   │   ├─ helpers/         # UI helpers (colors, utils)
  │   │   ├─ ui/              # React UI components
  │   │   │   ├─ components/  # Leaf components (charts, map, network, panels)
  │   │   │   ├─ pages/       # Route-level pages
  │   │   │   └─ styles/      # CSS and theme overrides
  │   ├─ startup/             # App startup (client/server)
  │   └─ ...
  ├─ public/                  # Static assets (images, videos)
  ├─ server/                  # Server entrypoints (Meteor)
  ├─ i18n/                    # Translations
  ├─ docs/                    # Documentation (API, quickstart, migrations)
  ├─ package.json             # NPM dependencies and scripts
  ├─ README.md                # Top-level docs
  └─ CHANGELOG*.md            # Changelogs
```

## Key UI modules

- Network (Cytoscape) — `imports/client/ui/components/network/`
  - `Cytoscape.jsx`: wrapper around Cytoscape v3 with element syncing and fit/layout management
  - `Network.jsx`: integrates events, selection, and fits; bridges app UI ↔ graph
  - `NetworkDefaultStyle.js`: runtime stylesheet setup (sizes, colors, hover)

- Geo Map (Leaflet) — `imports/client/ui/components/geoMap/`
  - `GeoMap.jsx`: react-leaflet v4 map container, nodes and edges layers
  - `GeoMapOptions.jsx`: toggles and options for map display (chevrons, offsets)

- Charts (Recharts) — `imports/client/ui/components/charts/`
  - `Charts.jsx`: donut charts and interactions that reflect selection

- Title and Panels — `imports/client/ui/components/titlebox/`, `SidePanel/`
  - `TitleBox.jsx`: title, summary stats, and action buttons
  - `SidePanel.jsx`: options and settings panels with MUI v5 compat theme

## Data and API

- Collections and schema validation live under `imports/api/`.
- JSON API endpoints are provided (see `docs/API.md`).

## Build and tooling

- Meteor manages runtime Node; tooling Node is pinned via `.nvmrc` (Node 20).
- ESLint 8 configured with `@babel/eslint-parser`; see CI config for checks.

## Tests

- Functional component tests under `tests/` (if present).
- Meteor integration tests under `specs/`.

