# JSON API

The BandsTour fork exposes optional JSON endpoints for simple automation (auth, listing public resources, and CRUD for topograms/nodes/edges).

Enable by setting `USE_JSONROUTES=1` when starting Meteor.

Base URL: `${ROOT_URL}/api`

## Auth
- POST `/api/auth/login` — Body: `{ "email", "password" }` → `{ userId, token }`
- GET  `/api/whoami` — returns `{ userId }` if authenticated, otherwise `{}`

Authenticate by passing `X-Auth-Token` and `X-User-Id` headers.

## Topograms
- GET    `/api/topogramsPublic` — list public topograms
- POST   `/api/topograms` — create a new topogram
- GET    `/api/topograms/:id` — get details
- PATCH  `/api/topograms/:id` — update fields
- DELETE `/api/topograms/:id` — remove

## Nodes
- POST   `/api/topograms/:id/nodes` — create
- PATCH  `/api/topograms/:id/nodes/:nodeId` — update
- DELETE `/api/topograms/:id/nodes/:nodeId` — remove

## Edges
- POST   `/api/topograms/:id/edges` — create
- PATCH  `/api/topograms/:id/edges/:edgeId` — update
- DELETE `/api/topograms/:id/edges/:edgeId` — remove

See implementation: `imports/endpoints/api-jsonroutes.js`.
