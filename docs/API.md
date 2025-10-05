# JSON API

This fork exposes a lightweight JSON API for basic operations (auth, listing public topograms, and CRUD for topograms/nodes/edges). The API is enabled by default. To temporarily disable all custom API wiring during upgrade probes, start with `UPGRADE_PROBE=1`.

- Base URL: `${ROOT_URL}/api`
- Auth for protected routes: pass headers `X-User-Id` and `X-Auth-Token`.
- Source: `imports/endpoints/api-jsonroutes.js` and `imports/endpoints/*.js`

## Endpoints

### Health
- GET `/api` or `/api/`
	- 200 `{ "message": "API works" }`

### Auth
- POST `/api/auth/login`
	- Request JSON: `{ "email": "user@example.com", "password": "secret" }` or `{ "username": "foo", "password": "secret" }`
	- 200 `{ "userId": "...", "authToken": "..." }`
	- 401 `{ "error": "Unauthorized" }`

- GET `/api/whoami` (requires headers)
	- 200 `{ "userId": "...", "username": "...", "email": "..." }`
	- 401 `{ "error": "Unauthorized" }`

### Users
- POST `/api/users`
	- Request JSON: `{ "email": "user@example.com", "password": "secret", "username": "optional" }`
	- 201 `{ status: 'success', data: { _id: '...' } }` on creation
	- 403 `{ status: 'error', message: 'Unauthorized - Email already exists' }` if email exists

### Topograms
- GET `/api/topogramsPublic`
	- Public list: 200 `[ { ...topogram }, ... ]` where `sharedPublic` true

- POST `/api/topograms` (auth required)
	- Request JSON: `{ "title": "My Topogram" }`
	- 201 `{ status: 'success', data: { _id: '...' } }`

- GET `/api/topograms` (auth required)
	- 200 `{ status: 'success', data: [ ... ] }`

- POST `/api/topograms/getByName`
	- Request JSON: `{ "name": "Sample Topogram" }`
	- 200 `{ status: 'success', data: { ...topogram or null } }`

- POST `/api/topograms/:_id/public` (auth required)
	- 200 `{ status: 'success', data: { ...topogram } }` (toggles `sharedPublic`)

- GET `/api/topograms/:_id/nodes`
	- 200 `{ status: 'success', data: [ ...nodes for topogramId ] }`

- GET `/api/topograms/:_id/edges`
	- 200 `{ status: 'success', data: [ ...edges for topogramId ] }`

### Nodes
- POST `/api/nodes` (auth required)
	- Request JSON: `{ "topogramId": "...", "nodes": [ { "data": { "id": "node-a", "name": "Alpha", ... } }, ... ] }`
	- 201 `{ status: 'success', data: [ "mongoId1", "mongoId2", ... ] }`

- PUT `/api/nodes/:id` (auth required)
	- Path param `:id` is the node `data.id`
	- Request JSON: fields to update under the `data.*` namespace, for example `{ "name": "New name", "weight": 3 }`
	- 201 `{ status: 'success', data: <updateResult> }`

- POST `/api/nodes/delete` (auth required)
	- Request JSON: `{ "nodes": [ "mongoId1", "mongoId2" ] }`
	- 201 `{ status: 'success', data: <removeResult> }`

### Edges
- POST `/api/edges` (auth required)
	- Request JSON: `{ "topogramId": "...", "edges": [ { "data": { "id": "edge-ab", "source": "node-a", "target": "node-b", ... } }, ... ] }`
	- 201 `{ status: 'success', data: [ "mongoId1", "mongoId2", ... ] }`

- PUT `/api/edges/:id` (auth required)
	- Path param `:id` is the edge `data.id`
	- Request JSON: fields to update under the `data.*` namespace, for example `{ "name": "relates", "weight": 2 }`
	- 201 `{ status: 'success', data: <updateResult> }`

- POST `/api/edges/delete` (auth required)
	- Request JSON: `{ "edges": [ "mongoId1", "mongoId2" ] }`
	- 200 `{ status: 'success', data: <removeResult> }`

## Examples (PowerShell)

```powershell
# Login
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3020/api/auth/login -ContentType application/json -Body (@{ email = "me@example.com"; password = "secret" } | ConvertTo-Json)
$headers = @{ 'X-User-Id' = $login.userId; 'X-Auth-Token' = $login.authToken }

# Create topogram
Invoke-RestMethod -Method Post -Uri http://localhost:3020/api/topograms -Headers $headers -ContentType application/json -Body (@{ title = "My Topo" } | ConvertTo-Json)

# Bulk create nodes
$nodes = @{ topogramId = "<id>"; nodes = @(@{ data = @{ id = "node-a"; name = "Alpha" } }, @{ data = @{ id = "node-b"; name = "Bravo" } }) } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri http://localhost:3020/api/nodes -Headers $headers -ContentType application/json -Body $nodes
```

## Examples (curl)

```bash
# Login
curl -sS -X POST http://localhost:3020/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"me@example.com","password":"secret"}'

# Use jq to export headers (example)
USER_ID=$(curl -sS -X POST http://localhost:3020/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"me@example.com","password":"secret"}' | jq -r .userId)
TOKEN=$(curl -sS -X POST http://localhost:3020/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"me@example.com","password":"secret"}' | jq -r .authToken)

# Create a topogram
curl -sS -X POST http://localhost:3020/api/topograms \
	-H "X-User-Id: $USER_ID" -H "X-Auth-Token: $TOKEN" \
	-H 'Content-Type: application/json' \
	-d '{"title":"My Topo"}'

# Bulk create nodes
curl -sS -X POST http://localhost:3020/api/nodes \
	-H "X-User-Id: $USER_ID" -H "X-Auth-Token: $TOKEN" \
	-H 'Content-Type: application/json' \
	-d '{"topogramId":"<id>","nodes":[{"data":{"id":"node-a","name":"Alpha"}},{"data":{"id":"node-b","name":"Bravo"}}]}'
```
