# Quickstart

This guide helps you get the BandsTour fork of Topogram running locally.

## Prerequisites
- Node.js (compatible with Meteor 2.13.x requirements)
- Meteor (2.13.x)
- MongoDB (optional if you want an external DB; Meteor includes one for dev)

## Clone and install

```
git clone https://github.com/ungentilgarcon/topo25.git
cd topo25/topogram
meteor npm install
```

## Run (UI only)

```
meteor --port 3020
```

Open http://localhost:3020

## Run with external MongoDB (JSON API is enabled by default)

```
export MONGO_URL='mongodb://localhost:27018/Bandstour_results_meteor'
export ROOT_URL='http://localhost:3020'
meteor --port 3020
```

Sanity checks:
- Who am I: `curl -i http://localhost:3020/api/whoami`
- Public topograms: `curl -s http://localhost:3020/api/topogramsPublic | jq .`

## Testing

- App tests: `npm test` (gulp)
- Meteor test mode: `npm run test:meteor`

## Linting

```
npm run lint
```

## Troubleshooting
- If Meteor warns about peer deps, install the suggested packages or re-run `meteor npm install`.
- If JSON API routes return 404, check logs for "Failed to initialize JSON API". During upgrade probes, the API is intentionally replaced by a minimal health route when `UPGRADE_PROBE=1` is set.
