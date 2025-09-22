# Meteor Upgrade Plan

Status: Baseline stabilized on Meteor 1.4.4.6 (branch: `chore/meteor-update-LATEST`). This document enumerates conflicts encountered when probing an update to Meteor 3.3.x and proposes a phased remediation plan.

## Current Baseline

- Meteor: 1.4.4.6 (`.meteor/release`)
- Adjustments made:
  - Pin `aldeed:simple-schema@=1.5.3`
  - Align `standard-minifier-css@1.3.5`, `standard-minifier-js@2.0.0`
  - `.babelrc`: Babel 6 plugins only (removed `@babel/plugin-proposal-class-properties`)
- Smoke test: App serves HTTP 200 at `/` with `MONGO_URL=mongodb://localhost:27017/Bandstour_results_meteor`.
- Authentication: Login flow verified OK against external Mongo using Accounts password; pure-JS bcrypt is sufficient for correctness on this baseline (native module optional). (2025-09-22)

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
  - `imports/api/helpers.js` previously used `Mongo.Collection.get(name)` (from `dburles:mongo-collection-instances`). Refactored to direct collection map.

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

3) Remove unused babrahams inline-edit stack (Done)
  - Packages: `babrahams:editable-text`, `babrahams:transactions`, `babrahams:undo-redo`.
  - Rationale: No references found in app code (no `{{> editableText}}`, `Template.editableText`, or `tx.*`). Only a cosmetic CSS hover rule existed, which is harmless.
  - Impact: No functional changes expected. Perform a quick manual check for inline edits in node/edge UIs.
  - Rollback: `meteor add babrahams:editable-text babrahams:transactions babrahams:undo-redo`.

Run syntax (dev/test) on 1.4.4.6

Server with external Mongo and JSON API enabled:

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
- JSON API tests live under `imports/endpoints/` and are loaded via `tests/jsonroutes-loader.app-test.js` to ensure discovery by the Meteor 1.4/2.x test harness.
- Legacy `api.app-test.js` is skipped (describe.skip) to avoid `request` dependency issues.

### Update 2025-09-22: JSON API moved off simple:json-routes

- Replaced the feature-flagged scaffold that used `simple:json-routes` with a native `WebApp.connectHandlers` implementation in `imports/endpoints/api-jsonroutes.js`.
- All existing paths and behaviors are preserved (`/api`, `/api/topogramsPublic`, `/api/topograms`, nodes/edges subsets, etc.).
- Authentication header handling remains the same (`X-User-Id` and `X-Auth-Token` using `Accounts._hashLoginToken`).
- This removes the Atmosphere dependency and makes the JSON API Meteor 3–compatible.

New auth helpers (for end-to-end testing):

- POST `/api/auth/login` with `{ email, password }` (or `{ username, password }`) returns `{ userId, authToken }` suitable for `X-User-Id`/`X-Auth-Token` headers.
- GET `/api/whoami` returns `{ userId, username?, email? }` when valid auth headers are provided.

Quick smoke (requires Mongo 4.4 at 27018):

```sh
# Start
USE_JSONROUTES=1 API_DEBUG=1 \
MONGO_URL=mongodb://localhost:27018/Bandstour_results_meteor \
ROOT_URL=http://localhost:3020 meteor --port 3020

# In a second shell
base=http://localhost:3020
email="cli_$(date +%s)@test.local"; pass="pass1234"
curl -sS -X POST "$base/api/users" -H 'Content-Type: application/json' -d '{"email":"'"$email"'","password":"'"$pass"'"}'
login=$(curl -sS -X POST "$base/api/auth/login" -H 'Content-Type: application/json' -d '{"email":"'"$email"'","password":"'"$pass"'"}')
uid=$(echo "$login" | sed -n 's/.*"userId":"\([^"]*\)".*/\1/p'); tok=$(echo "$login" | sed -n 's/.*"authToken":"\([^"]*\)".*/\1/p')
curl -sS "$base/api/whoami" -H "X-User-Id: $uid" -H "X-Auth-Token: $tok"
```

3) babrahams packages
   - `editable-text`: replace inline editing with a small Blaze helper or React component.
   - `transactions` / `undo-redo`: remove if not actively used; otherwise implement a minimal undo stack for specific operations.

4) dburles helpers
  - Replaced `Mongo.Collection.get(name)` with a direct collection map. Package can be removed.

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

## Data Migration: Mongo 3.2 -> 4.4 container (2025-09-22)

Context: The legacy external Mongo at localhost:27017 is a Docker container (mongo:3.2) with DB `Bandstour_results_meteor`. Meteor 2.x+ requires a newer Mongo driver (wire protocol ≥ 6), so we provisioned a new container and migrated data.

Steps performed:

1) Identify the old source
- docker ps shows `mongodb-32` at 0.0.0.0:27017.
- DBs include `Bandstour_results_meteor`.

2) Dump the old DB
- Inside the old container: `mongodump --db Bandstour_results_meteor --out /dump`.
- Copied to host: `/home/g/gitrep3/TOPOTEST2025/_mongo_dumps/bandstour-20250922/dump` (≈1.6GB).

3) Start new Mongo 4.4 on 27018
- Command used: `docker run -d --name mongodb-44 -p 27018:27017 -v /home/g/gitrep3/TOPOTEST2025/_mongo_data/mongodb-44:/data/db mongo:4.4`.

4) Restore into the new container
- Copied dump into container: `docker cp .../dump mongodb-44:/dump`.
- Restored: `mongorestore --drop --nsInclude=Bandstour_results_meteor.* /dump`.
- Verified counts: edges=1,634,273; nodes=1,168,198; topograms=5,696; users=1.

5) Point the app to the new Mongo
- Use: `MONGO_URL=mongodb://localhost:27018/Bandstour_results_meteor`.
- In upgrade-probe mode (Meteor 2.x), start example:
  - `UPGRADE_PROBE=1 USE_JSONROUTES=0 ROOT_URL=http://localhost:3020 meteor --port 3020`.

6) Rollback / switch back
- To revert to old DB, change MONGO_URL to `mongodb://localhost:27017/Bandstour_results_meteor` and ensure the old container `mongodb-32` is running.

Notes:
- The new container persists data under `_mongo_data/mongodb-44`.
- Keep the dated dump under `_mongo_dumps/bandstour-20250922/` for audit/backup.
- For production, consider Mongo 5.0/6.0+ with replica set and proper auth; 4.4 chosen here for compatibility and quick unblock.

## Upgrade Probe Status (Meteor 2.x) and Next Steps

- App successfully starts on Meteor 2.13.3 with UPGRADE_PROBE enabled and a minimal native `/api` route via `webapp`.
- Restivus/JsonRoutes code paths are guarded and do not execute in probe mode.
- External Mongo is now `mongodb://localhost:27018/Bandstour_results_meteor` (MongoDB 4.4).
- Unit/integration tests: migrated runner to `meteortesting:mocha` (for 2.x). A full test harness refresh will follow in the Meteor 3 phase.

Planned sequence toward Meteor 3.3.x:
1) Replace legacy Atmosphere UI/DB helpers with npm alternatives while still on Meteor 2.13.3.
  - sergeyt:typeahead → npm typeahead (or React/MUI Autocomplete if feasible without large UI churn).
  - mikowals:batch-insert / udondan:bulk-collection-update → plain bulkWrite/OrderedBulkOperation helpers.
  - raix:handlebar-helpers → local helpers or npm equivalents.
  - fortawesome:fontawesome → npm `@fortawesome/*` packages.
  - aldeed:simple-schema → npm `simpl-schema` + collection2-core or direct validation.
2) Stabilize on Meteor 2.x with the above replacements, re-run tests.
3) Attempt `meteor update --release 3.3.x` with `--allow-incompatible-update`, resolve remaining breaks (ecmascript, webapp, accounts), and migrate the test driver (`zodern:mocha`).

### sergeyt:typeahead replacement (applied)

Context:
- Searches confirm no usages under `client/` or `imports/` (`Meteor.typeahead`, `.typeahead(...)`, `tt-*` classes).
- To unblock Meteor 3, we removed the Atmosphere package and added a small shim to ensure compatibility if hidden call sites exist.

Implementation:
1) Removed `sergeyt:typeahead` from `.meteor/packages` and `.meteor/versions`.
2) Added npm `corejs-typeahead@^1.3.4` to `package.json` (latest compatible with our legacy npm engine).
3) Added `imports/startup/client/typeahead-shim.js` which:
   - imports `meteor/jquery` and `corejs-typeahead` so `$.fn.typeahead` is registered on Meteor's jQuery (prevents dual jQuery instances),
   - exposes a minimal `Meteor.typeahead(element, opts)` wrapper as a safeguard.
4) Imported the shim from `imports/startup/client/routes.jsx` to ensure early registration.

Rollback:
- Re-add `sergeyt:typeahead` to `.meteor/packages` if a regression is discovered and we need a quick temporary restore.

Branching:
- Work will proceed on a new branch `chore/m3-prep-meteor3` dedicated to Meteor 3 preparation.
