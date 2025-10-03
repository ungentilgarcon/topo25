# UI/React Migration Log (2025-10-02)

This document tracks the ongoing React + MUI modernization for the Meteor app.

## Completed work

- React 18 upgrade with safe bootstrap
  - Added a guarded createRoot shim in `client/main.js` that tries `react-dom/client` and falls back to legacy `ReactDOM.render` when unavailable.
  - Removed requires to internal `react-dom` CJS paths to avoid Meteor unresolved module warnings.
  - Optional StrictMode toggle via `window.__REACT_STRICT_MODE__` to surface legacy patterns when desired.

- Material-UI (MUI) v5 adoption via a compatibility layer
  - Introduced @mui/material v5 with Emotion.
  - Added compat wrappers to bridge Material-UI 0.19 APIs: DialogCompat, MenuItemCompat, TextFieldCompat, SubheaderCompat, IconButtonCompat, CardCompat suite, DrawerCompat, ToolbarCompat, DividerCompat, CheckboxCompat, ChipCompat, DatePickerCompat, SnackbarCompat.
  - Replaced most legacy svg-icons with @mui/icons-material.
  - Migrated key UI surfaces: Auth screens, Side panel/actions, UserMenu (legacy IconMenu → MUI Menu), Charts/Legend/SelectionChips/PanelFilters, QueryBox (AutoComplete → Autocomplete), TopogramList (GridList/Toggle removed → CSS grid + CheckboxCompat), ChartOptions cleanup.
  - Removed legacy MuiThemeProvider; using MUI v5 provider only.

- Redux UI compatibility (redux-ui removal)
  - Implemented a local legacy UI compatibility module `imports/client/legacyUi` exporting `uiReducer` and a `@ui()` HOC.
  - The reducer supports: UI_MERGE, UI_SET, UI_INIT; evaluates function defaults during init.
  - The HOC overlays defaults on first render and now only dispatches `__initUI` if any default key is missing in the current UI state.
  - Wired `ui: uiReducer` in the root reducer and removed the old redux-ui dependency/provider.

- Topogram views hardening (fix infinite update loop)
  - Guarded componentDidUpdate across these components to only initialize once when source props are available:
    - `TopogramViewComponent.jsx`
    - `TopogramViewComponentForNetScreenshots.jsx`
    - `TopogramViewComponentForMapScreenshots.jsx`
    - `TopogramViewComponentForMapScreenshotsNoTiles.jsx`
    - `TopogramViewComponentForMapScreenshotsNoTilesWithMainVenuesHighlighted.jsx`
  - Time range guards: set `minTime`/`maxTime` only when they’re null in UI and the prop values exist; set `valueRange` only when any bound is null and times are present.
  - Weight guards: set `minWeight`/`maxWeight` only when null and numeric props exist.
  - Categories guard: set `selectedNodeCategories` only if `nodeCategories.length > 0` and the UI list is empty.
  - Result: resolves “Maximum update depth exceeded” on `/topograms/:id` in React 18.

## Current status

- App runs under React 18 + MUI v5 via the compat layer.
- Legacy warnings from `react-router@3` and `react-intl@2` are expected and non-blocking.
- UI init loops eliminated; startup with external Mongo is stable; JSON API is enabled by default.

## How to run (local Meteor; no Docker)

- Default dev (JSON API is enabled by default; Mongo on port 27018 recommended):
  - `MONGO_URL=mongodb://127.0.0.1:27018/topogram ROOT_URL=http://localhost:3020 meteor --port 3020`

- Probe mode (minimal health-only API):
  - `UPGRADE_PROBE=1 MONGO_URL=mongodb://127.0.0.1:27018/topogram ROOT_URL=http://localhost:3020 meteor --port 3020`

## Known issues / limitations

- Legacy context warnings
  - RouterContext (react-router v3) and IntlProvider (react-intl v2) use legacy childContextTypes and emit warnings under React 18.
  - Plan to migrate to react-router v6 and react-intl v5+ later; these are not runtime blockers.

- String refs warning
  - Network component uses string refs (e.g., `ref="graph"`); this is safe for now but should be migrated to `createRef`.

## Next steps

Short term
1) Coalesce Topogram initializations into a single `updateUI({ ... })` per component to further reduce render churn.
2) Migrate string refs to `createRef` in `imports/client/ui/components/network/Network.jsx` and any similar cases.
3) Add a minimal ErrorBoundary around Topogram routes to present user-friendly errors without blank screens.

Medium term
4) Router migration v3 → v6 under a feature flag; replace `<RouterContext>` with `<BrowserRouter>/<Routes>`.
5) react-intl v2 → v5+ migration; update polyfills and components.
6) Sweep and remove remaining `material-ui` 0.x stray imports (if any) and the dependency once fully unused.

Performance/UX
7) Memoize filtered nodes/edges by `[valueRange, selectedNodeCategories]` to reduce Cytoscape churn.
8) Debounce slider/option-driven updates to avoid rapid reflows.
9) UI polish under MUI v5: consistent typography, Drawer visuals, menu paper colors, submenu a11y.

## Change log highlights

- React bootstrap: guarded createRoot with fallback; StrictMode opt-in flag.
- Legacy UI replacement: new `imports/client/legacyUi` with reducer + HOC (init overlay; init only when needed).
- Topogram guard fixes: null-safe checks, presence checks, categories length > 0; all variants aligned.
- Warnings addressed: removed internal `react-dom` requires; cut default init dispatches to reduce connect churn.
