# BandsTour V4 — Changelog (2025)

This changelog summarizes all notable changes made in 2025 up to the V4 line, covering frontend modernization, UX polish, network/geomap fixes, and tooling/CI upgrades.

## Highlights

- React 18 + MUI v5 modernization with compatibility wrappers
- Cytoscape 3 upgrade with performance and visibility improvements
- Charts migration from C3 to Recharts with selection sync
- Safer Markdown rendering for SelectedItem (no raw HTML parsing)
- Leaflet/react-leaflet v4 migration for GeoMap + UI polish
- Robust isolate/focus behavior with layout + viewport fit
- CI bootstrap with ESLint 8 and Node LTS v20

---

## UI/UX

- TitleBox and Panels
  - Align TitleBox with side panel theme (dark/ivory/purple), raise z-index above overlays, and add subtle text-outline for stats.
  - Purple-themed action buttons ("Focus and rearrange" / "Focus only").
  - SidePanel polish: compact spacing; toolbar icons hover/ripple; submenu arrows repositioned and auto-close timers added.

- Network (Cytoscape)
  - Upgrade to Cytoscape 3; use canvas renderer; avoid visible startup animation.
  - Initial fit-on-mount (once) and reduced fit padding to use more screen.
  - Keep layout stable during time filtering by toggling display instead of add/remove.
  - Robust element sync: stable IDs (source|target), update data/position in batch, hide non-visible elements, update styles.
  - Isolate “Focus and rearrange”: include closedNeighborhood(), unlock, spread layout, show only subgraph, fit viewport.
  - Labels: slightly bigger by default; enlarge noticeably on hover and restore cleanly.
  - Panzoom positioning refined above timeline/overlays; higher z-index.

- Charts/Selection/Chips
  - Replace C3 donuts with Recharts; highlight selections; batch-toggle so multiple chips appear at once.
  - Chip font size finalized at 10px; Reset button and pop-out windows readable in dark theme.

- SelectedItem (notes)
  - Removed raw HTML parsing path (rehype-raw) to avoid ESM devlop runtime errors under Meteor.
  - Pre-convert <a href="URL">TEXT</a> to Markdown links and render via react-markdown + remark-gfm; open in new tab with rel security.

- GeoMap (Leaflet)
  - Migrate to react-leaflet v4; restore selection handling with eventHandlers.
  - Compact controls and dynamic bottom offsets based on timeline/legend; attribution always visible.
  - Chevron/antimeridian handling improved; split edges at date line and style glyphs for legibility.

---

## Tooling & Infrastructure

- Node LTS pinned to v20 via .nvmrc; engines specified.
- ESLint upgraded to v8 with @babel/eslint-parser; config simplified; CI jobs stabilized.
- CI bootstrap with GitHub Actions: lint, test, production audit, manual dispatch; green baseline.
- Meteor upgrades and schema migrations:
  - Gradual move to npm simpl-schema with compatibility shims; preserve legacy options/regex; load order fixed.
  - Remove outdated Atmosphere packages; add JSON API routes as default; document migration plan and phases.

---

## Detailed commit timeline (2025)

- 2025-10-03
  - fix/ux: TitleBox parity and readability; purple buttons; outlined stats.
  - fix(isolate): closedNeighborhood + spread layout + viewport fit; keep only subgraph visible.
  - fix(charts): batch-toggle selections for multi-chip behavior.
  - ux(chips): set chip text size to 10px (after interim 12px).
  - fix(selected-item): drop rehype-raw, convert anchors to Markdown links; avoid devlop ESM issues.
  - fix(network/geomap): panzoom placement; hide edges when endpoints hidden; fit-on-mount and better label scaling.
  - perf(cytoscape): preserve layout and reduce visible redraws; use canvas renderer.
  - chore(schemas): migrate to npm simpl-schema with shims; CI/dev stable.
  - docs: migration notes for Cytoscape v3 and Recharts; Node LTS and ESLint clarifications.

- 2025-10-02
  - Upgrade path React 16 -> 17 -> 18 with guarded fallbacks (createRoot or render).
  - Router migration to react-router v6 and compat shims; AppV6 wrappers; Link fixes.
  - Timeline slider migrated to MUI Slider; removed rc-slider/rc-tooltip; i18n and tooltip polish.
  - GeoMap migrated to react-leaflet v4; restored node/edge selection visuals and events.
  - Charts modernization: migrate from C3 to Recharts; interim compat kept for tests; remove legacy deps.
  - MUI v5 migration with local compat wrappers for Dialog/MenuItem/TextField; replace legacy RaisedButton; theme polish.
  - UI infra: redux-ui removed; local UI compat HOC + reducer; stabilize init.
  - CI bootstrap; ESLint 8; temp ignores to get green; follow-up cleanups.

- 2025-10-01
  - Early modernization groundwork: React 16 support, lifecycle migration, ref conversions, and MapScreenshots fixes.
  - Geo chevrons/dateline features and selection robustness; cleanup of invalid React patterns in map layers.
  - Pop-out windows for Charts and Legend; improved dark theme and tooltips.
  - Misc fixes: favicon, fonts, PropTypes, pane z-index, CORS/tiles; LFS for media.

- 2025-09-22
  - Meteor 3 prep: JSON API scaffolding and migration docs; Mongo 4.4 container; package and versions alignment.
  - README/docs overhaul and V0.3 release notes.

---

## Breaking changes

- Removed legacy Blaze/C3 stacks; code now targets React 18 + MUI v5 and Recharts.
- Router is react-router v6; legacy route hooks removed in favor of compat wrappers.
- Markdown stack pinned (react-markdown 8, remark-gfm 3) to avoid Meteor bundler ESM resolution issues.

## Upgrade notes

- Ensure Node 20 available (nvm use) and reinstall deps after pulling.
- If you had custom C3 usage, migrate to Recharts equivalents.
- Verify environment variables and USE_JSONROUTES defaults as noted in MIGRATION.md.

## Credits

Contributors: @ungentilgarcon, @gregory bahdé

---

Generated from Git history and docs references across 2025 dates.

---

## Conventional-commit categories

### Features (feat)
- Charts: migrate C3 → Recharts; selection highlighting and pop-out enhancements
- GeoMap: chevrons at antimeridian; UI toggles; compact controls and offsets
- UI: draggable/resizable popups for Charts and Legend; improved panels and menus
- Network: isolate “Focus and rearrange” workflow (closedNeighborhood + spread)

### Fixes (fix)
- SelectedItem: drop rehype-raw, convert anchors to Markdown to avoid ESM errors
- Cytoscape: stable IDs for edges; visibility sync; avoid startup animation
- GeoMap: robust selection rendering; guard invalid coords; attribution visibility
- Timeline/Router: v6 migration fixes; slider initialization and value guards

### Performance (perf)
- Cytoscape: keep layout stable by toggling display rather than remove/add; canvas renderer; fewer relayouts

### Refactors (refactor)
- UI compat layers for MUI v5; redux-ui removal; createRef/string-ref migrations

### Chore (chore)
- Node 20 via .nvmrc; ESLint 8; CI bootstrap; dependency cleanup
- Simpl-schema migration with shims and load-order fixes; Meteor package alignment

### Documentation (docs)
- Migration logs for React/MUI/Cytoscape/Charts; API and Quickstart updates
- README updates with V4 changelog link
