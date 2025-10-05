# Dependency Graph

This document gives a high-level view of data and module relationships in the app.

```mermaid
flowchart TD
  subgraph Collections
    T[Topograms]
    N[Nodes]
    E[Edges]
    C[Comments]
    U[Users (Meteor.users)]
  end

  subgraph Server Startup
    Sidx[imports/startup/server/indexes.js]
    Sseed[imports/startup/server/seed.js]
    Sapi[imports/endpoints/api-jsonroutes.js]
    Spub[imports/api/topograms/server/publications.js\nimports/api/server/publications.js]
  end

  T -->|_id| N
  T -->|_id| E
  U -->|userId| T
  E -->|data.source/target = N.data.id| N

  Sidx --> T
  Sidx --> N
  Sidx --> E
  Sseed --> T
  Sseed --> N
  Sseed --> E
  Spub --> T
  Spub --> N
  Spub --> E
  Sapi --> T
  Sapi --> N
  Sapi --> E

  subgraph Methods Wrappers
    MTopo[imports/endpoints/topograms.js]
    MNodes[imports/endpoints/nodes.js]
    MEdges[imports/endpoints/edges.js]
  end

  MTopo --> T
  MNodes --> N
  MEdges --> E

  subgraph UI
    Net[Network.jsx]
    Geo[GeoMap/GeoNodes/GeoEdges]
    Charts[Charts.jsx]
  end

  N --> Net
  E --> Net
  N --> Geo
  E --> Geo
  N --> Charts
  E --> Charts
```
