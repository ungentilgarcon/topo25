# Meteor Upgrade Plan

Status: Baseline stabilized on Meteor 1.4.4.6 (branch: `chore/meteor-update-LATEST`). This document enumerates conflicts encountered when probing an update to Meteor 3.3.x and proposes a phased remediation plan.

## Current Baseline

- Meteor: 1.4.4.6 (`.meteor/release`)
- Adjustments made:
  - Pin `aldeed:simple-schema@=1.5.3`
  - Align `standard-minifier-css@1.3.5`, `standard-minifier-js@2.0.0`
  - `.babelrc`: Babel 6 plugins only (removed `@babel/plugin-proposal-class-properties`)
- Smoke test: App serves HTTP 200 at `/` with `MONGO_URL=mongodb://localhost:27017/Bandstour_results_meteor`.

## Enumerated Conflicts Targeting Meteor 3.3.x

Attempt: `meteor update --release 3.3.2 --allow-incompatible-update`

High-level themes:
- Core packages jump to modern versions (mongo 2.1.4, minimongo 2.0.x, blaze 3.x, spacebars 2.x, accounts-* 3.x, webapp 2.x, ecmascript 0.16.x).
- Several legacy Atmosphere packages hard-pin very old versions, creating conflicts.

Blocking examples (truncated):

- mongo / minimongo
  - Required by Meteor 3: `mongo@2.1.4`, `minimongo@~2.0.4`
  - Conflicts:
    - `aldeed:tabular@1.4.1` expects `mongo@1.0.7 || 1.0.8`
    - `babrahams:editable-text@0.9.13` expects `mongo@1.0.8`
    - `babrahams:undo-redo@0.4.1` expects `mongo@1.0.8`

- blaze / spacebars
  - Required by Meteor 3: `blaze@3.x`, `spacebars@2.0.0`
  - Conflicts:
    - `aldeed:tabular@1.4.1` requires `blaze@2.0.2 || 2.0.3`
    - `babrahams:editable-text@0.9.13` requires `blaze@2.0.3`, `spacebars@1.0.3`

- accounts
  - Required by Meteor 3: `accounts-base@~3.1.2`, `accounts-password@~3.2.1`
  - Conflicts:
    - `nimble:restivus@0.8.12` expects older `accounts-*`/`meteor`/`webapp`

- other pins
  - `dburles:mongo-collection-instances@0.3.5` (required by `editable-text`) conflicts; Meteor 3 expects `>=1.0.1`.
  - `webapp@~2.0.7` required by Meteor 3 conflicts with `simple:json-routes@2.1.0` pin to `webapp@1.1.4` via Restivus stack.

## Where these packages are used (code inventory)

- REST (Restivus):
  - `imports/endpoints/index.js`
    - `import { Restivus } from 'meteor/nimble:restivus'`
    - Uses `new Restivus({...})` and `Api.addRoute(...)` endpoints.

- Tabular (aldeed:tabular):
  - Declared in `.meteor/packages` (`aldeed:tabular@=1.4.1`).
  - Search did not show explicit `new Tabular.Table` in repo; likely defined in a missing file or via a dynamic import. Verify during migration.

- Inline editing & transactions (babrahams):
  - `babrahams:editable-text`:
    - CSS hook seen in `imports/css/topogram.scss` (`.editable-text:hover`).
  - `babrahams:transactions` and `babrahams:undo-redo`:
    - Comments/placeholders in `imports/api/nodes/nodesMethods.js` show `tx.start/tx.commit` commented out; actual runtime usage appears minimal.

- Mongo collection helpers:
  - `imports/api/helpers.js` uses `Mongo.Collection.get(name)` (from `dburles:mongo-collection-instances`).

- Schemas (aldeed:simple-schema, collection2):
  - `imports/api/*/*.js` use `new SimpleSchema(...)` and `attachSchema(...)` (e.g., `Topograms.js`, `Nodes.js`, `Edges.js`).

## Proposed Remediation (Phased)

Phase 1: Remove hard legacy constraints on 1.4.4.6 (new prep branch)

1) RESTivus replacement
   - Replace Restivus endpoints with `simple:json-routes` (JsonRoutes) or native `webapp` handlers.
   - Keep routes and handlers equivalent; leave old code in comments for reference.
  - 2025-09-21: Implemented a feature-flagged JsonRoutes scaffold (default remains Restivus). Enable with `USE_JSONROUTES=1` or `Meteor.settings.public.useJsonRoutes = true`.
  - Added minimal server tests for `/api`, `/api/topogramsPublic`, and a protected route auth check; added an authenticated POST `/api/topograms` test using `X-User-Id` and `X-Auth-Token` headers.
  - Refactored tests to avoid the deprecated `request` library (which pulled in `tough-cookie`/`psl` causing syntax errors). Switched to Node's built-in `http` client.

2) Tabular replacement/upgrade
  - Audit result (2025-09-21): No occurrences of `Tabular.Table`, `new Tabular.Table`, or tabular templates/helpers were found under `imports/` or `client/`. The package appears unused.
  - Action: Removed `aldeed:tabular@=1.4.1` from `.meteor/packages` in branch `chore/m3-prep-phase1`. If any hidden/legacy references surface, re-introduce via a scoped upgrade or replace with a small Blaze/React table.

Run syntax (dev/test) on 1.4.4.6

Server with external Mongo and JsonRoutes enabled:

```sh
USE_JSONROUTES=1 \
MONGO_URL=mongodb://localhost:27017/Bandstour_results_meteor \
ROOT_URL=http://localhost:3000 \
meteor --port 3000
```

Full-app server tests (headless), against external Mongo:

```sh
USE_JSONROUTES=1 \
MONGO_URL=mongodb://localhost:27017/Bandstour_results_meteor \
ROOT_URL=http://localhost:3010 \
meteor test --once --full-app --driver-package dispatch:mocha --port 3010
```

Notes:
- Internal Meteor Mongo can fail on this legacy stack; always pass `MONGO_URL` to use the external container.
- JsonRoutes tests live under `imports/endpoints/` and are loaded via `tests/jsonroutes-loader.app-test.js` to ensure discovery by the Meteor 1.4 test harness.
- Legacy `api.app-test.js` is skipped (describe.skip) to avoid `request` dependency issues.

3) babrahams packages
   - `editable-text`: replace inline editing with a small Blaze helper or React component.
   - `transactions` / `undo-redo`: remove if not actively used; otherwise implement a minimal undo stack for specific operations.

4) dburles helpers
   - Replace `Mongo.Collection.get(name)` usages with direct imports of collection modules to remove `dburles:mongo-collection-instances` dependency.

5) Schemas
   - Keep `aldeed:simple-schema@1.5.3` on 1.4.4.6 for now. Plan to migrate to `simpl-schema` (npm) in later phases.

Deliverables for Phase 1:
- New branch (e.g., `chore/m3-prep-phase1`) with:
  - New REST handlers (JsonRoutes/webapp) mirroring existing endpoints.
  - Replacements for tabular (or upgrades) and editable-text.
  - Removal of `dburles:mongo-collection-instances` usages via direct collection imports.
  - App builds and serves; functional parity verified for endpoints and UI areas touched.

Phase 2: Jump to Meteor 2.x
- Update `.meteor/release` to a stable 2.x.
- Resolve package bumps (blaze 3.x, spacebars 2.x, webapp 2.x, ecmascript 0.16.x, etc.).
- Fix build/runtime issues and re-test.

Phase 3: Jump to Meteor 3.x
- Update to Meteor 3.3.x.
- Finalize package updates, remove compatibility shims.
- Full regression pass.

## Risks / Considerations
- Some packages may have no maintained upgrades; replacements will be custom code or npm-based alternatives.
- Inline editing UX parity should be validated post-replacement.
- Rest routes must be tested against any external clients/scripts.

## Open Questions
- Is tabular functionality still in active use in the UI? If yes, preference for replacement (npm DataTables vs. custom Blaze/React table)?
- Any external systems consuming the Restivus endpoints beyond the frontend? If yes, provide a list to test against.

---

This document will be updated as we implement Phase 1 and discover additional constraints.
