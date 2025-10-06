// Register API
// This defines all the collections, publications and methods that the application provides
// as an API to the client.

// config accounts
// import '/imports/accounts.js'

// methods
import '/imports/api/edges/edgesMethods.js'
import '/imports/api/nodes/nodesMethods.js'
import '/imports/api/topograms/topogramsMethods.js'
import '/imports/api/users/userMethods.js'
// import '/imports/api/comments/commentsMethods.js'

// some helpers
import '/imports/api/helpers.js'

// publications
import '/imports/api/topograms/server/publications.js'
import '/imports/api/server/publications.js'

// plugins
import '/imports/version.js'
import '/imports/startup/server/plugins/collection2-shim.js'
import '/imports/startup/server/indexes.js'

// JSON API
import '/imports/endpoints'

// Dev-only seed data for local testing (no-op in prod unless METEOR_SEED=1)
import '/imports/startup/server/seed.js'
