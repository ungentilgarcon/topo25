# BandsTour ( a heavily modded fork of Topogram)

[![Release V0.3](https://img.shields.io/badge/release-V0.3-blue)](https://github.com/ungentilgarcon/topo25/tree/V0.3)
[![Latest tag](https://img.shields.io/github/v/tag/ungentilgarcon/topo25?sort=semver&label=latest%20tag)](https://github.com/ungentilgarcon/topo25/tags)

Topogram is a web app to visualize the evolution of networks over time and space. This fork powers BandsTour and adds a JSON API and UI improvements.

- Current version: V0.3 (Meteor 2.13.x)
- Highlights in V0.3: non-blocking, draggable help popup; JSON API endpoints; migration groundwork. See the [Changelog](./CHANGELOG.md).

For background, see the original project: http://topogram.io

## Features

* time-based navigation in graph
* network layouts + geographic data
* online/real-time data update via API

![Screenshot Topogram](http://topogram.io/img/Topogram-Network.png)


## Download & Install

You need [Meteor JS](https://www.meteor.com/) to install Topogram.

Quick start (development):

1. Clone this repo
2. Install dependencies
3. Run Meteor

```
git clone https://github.com/ungentilgarcon/topo25.git
cd topo25/topogram
meteor npm install
# Optional: use a local MongoDB and enable JSON API endpoints
export MONGO_URL='mongodb://localhost:27018/Bandstour_results_meteor'
export USE_JSONROUTES=1
export ROOT_URL='http://localhost:3020'
meteor --port 3020
```

More details in docs/Quickstart.md.


### Troubleshooting

If you get a "Can't listen on port 3024" error (another process is using the port), free it with:

```sh
# Stop whatever is bound to 3024
lsof -ti :3024 | xargs -r kill -9
```

Then relaunch Meteor on the same port in one line:

```sh
PORT=3024 ROOT_URL=http://localhost:3024 MONGO_URL='mongodb://127.0.0.1:27018/Bandstour_results_meteor' USE_JSONROUTES=1 UPGRADE_PROBE=0 meteor --port 3024
```


### Test & Code quality

There is 2 sorts of tests here :

1. functional tests for the components in `/tests`
2. integration tests for the Meteor app located in ```specs```.

You can launch all tests using `gulp test` or `npm test`

You can also run the app in test mode to check integration as you develop

    npm test:meteor

Check for ESlint compliance

    npm run lint

### Deploy with Docker

You can use Docker to run in production.

1. build the Docker topogram/topogram container with `./build.sh`
1. fetch a mongo Docker container for the DB and run the app with `docker-compose up`


### Build the docs

All the docs will be built in the `.docs/` folder.

    gulp doc

### JSON API (optional)

This fork exposes a lightweight JSON API for basic operations (auth, listing public topograms, and CRUD for topograms/nodes/edges). The API is disabled by default and can be enabled by setting `USE_JSONROUTES=1` at runtime.

- Docs: docs/API.md
- Quick probe: `curl http://localhost:3020/api/whoami`

### Publishing instructions

This project is set up to automatically publish to npm. To publish:

1. Set the version number environment variable: export VERSION=1.2.3
1. Publish: ```gulp publish```

### Internationalization

Topogram supports internationalization. Please read our [i18n guidelines](https://github.com/topogram/topogram/wiki/App-translation) and feel free to add your own language by translating a file in `./i18n` folder!

---

Maintainer of this fork: @ungentilgarcon
