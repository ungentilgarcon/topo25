import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
// During upgrade probes, avoid importing Restivus so we can remove the package safely
// import { Restivus } from 'meteor/nimble:restivus'

// Feature flags
// - USE_JSONROUTES: allow scaffolding a JsonRoutes-based API without removing Restivus yet
// - UPGRADE_PROBE: skip Restivus/JsonRoutes entirely and expose only a minimal health endpoint
const useJsonRoutes = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.useJsonRoutes) ||
  (typeof process !== 'undefined' && process.env && process.env.USE_JSONROUTES === '1')
const upgradeProbe = (typeof process !== 'undefined' && process.env && process.env.UPGRADE_PROBE === '1')

// import logger from '/imports/logger.js'

import { createNodes, updateNode, deleteNodes } from '/imports/endpoints/nodes.js'
import { createEdges, updateEdge, deleteEdges } from '/imports/endpoints/edges.js'

import {
  createTopogram,
  togglePublicTopogram
} from '/imports/endpoints/topograms.js'

import { buildSuccessAnswer, buildErrorAnswer } from '/imports/api/responses'
import { Topograms, Nodes, Edges } from '/imports/api/collections.js'

// In upgrade-probe mode, define only a tiny health route using WebApp and bail out
if (upgradeProbe) {
  try {
    // eslint-disable-next-line global-require
    const { WebApp } = require('meteor/webapp')
    WebApp.connectHandlers.use('/api', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: 'API works (upgrade probe minimal mode)' }))
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Upgrade probe health route failed to initialize:', e && e.message)
  }
  // Skip loading any additional API wiring in upgrade-probe mode
}

// If not using JsonRoutes scaffold, set up existing Restivus API (default)
export let Api
if (!upgradeProbe && !useJsonRoutes) {
  // Global API configuration
  try {
    // eslint-disable-next-line global-require
    const { Restivus } = require('meteor/nimble:restivus')
    Api = new Restivus({
      apiPath: 'api',
      useDefaultAuth: true,
      prettyJson: true,
      onLoggedIn() {
        // logger.log(this.user.username + ' (' + this.userId + ') logged in')
      },
      onLoggedOut() {
        // logger.log(this.user.username + ' (' + this.userId + ') logged out')
      }
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Restivus not installed; skipping legacy API. Set USE_JSONROUTES=1 or install nimble:restivus.')
  }
}

// Home
if (Api) {
  Api.addRoute('',
    { authRequired: false },
    { get() { return { 'message' : 'API works' } } }
  )

  Api.addRoute('topogramsPublic', { authRequired: false }, {
    get() {
      return Topograms.find({ 'sharedPublic': 1 }).fetch()
    }
  })
}

// Generates: POST on /api/users and GET, DELETE /api/users/:id for
if (Api) {
  Api.addCollection(Meteor.users, {
    excludedEndpoints: [ 'put','delete','patch'],
    routeOptions: {
      authRequired: true
    },
    endpoints: {
      post: {
        authRequired: false,
        action() {
          const data = this.bodyParams
          const user = Meteor.users.find({ 'emails.address': data.email }).fetch()
          if (user.length) {
            const err = buildErrorAnswer({
              statusCode : 403,
              message: 'Unauthorized - Email already exists'
            })
            return err
          }
          else {
            Accounts.createUser(data)
            const user = Meteor.users.findOne({ 'emails.address': data.email })
            return buildSuccessAnswer({
              statusCode : 201,
              data : { '_id' : user._id }
            })
          }
        }
      },
      delete: {
        roleRequired: 'admin'
      }
    }
  })
}

// Topograms
if (Api) {
  Api.addCollection(Topograms, {
    routeOptions: {
      authRequired: true
    },
    endpoints: {
      post: {
        action() {
          const data = createTopogram({
            title : this.bodyParams.title,
            userId: this.userId
          })
          if (typeof(data.body) !== 'undefined' && data.body.status === 'error') return data
          return buildSuccessAnswer({ statusCode : 201, data })
        }
      },
      getAll: {
        action() {
          const data = Topograms.find().fetch()
          return buildSuccessAnswer({ statusCode : 200, data })
        }
      }
      // ,delete: {}
    }
  })
}

if (Api) {
  Api.addRoute('topograms/getByName', {
    post: {
      authRequired: false,
      action() {
        const title = this.bodyParams.name
        return buildSuccessAnswer({
          'statusCode': 200,
          'data' : Topograms.findOne({ "title":title })
        })
      }
    }
  })
}

if (Api) {
  Api.addRoute('topograms/:_id/public', {
    post: {
      authRequired: true,
      action() {
        const _id = this.urlParams._id
        //console.log(_id);
        togglePublicTopogram({ topogramId : _id })
        return {
          'status': 'success',
          'data' : Topograms.findOne(_id)
        }
      }
    }
  })
}

// Nodes
if (Api) {
  Api.addCollection(Nodes, {
    routeOptions: { authRequired: false },
    endpoints: {
      post: {
        authRequired: true,
        action() {
          const topogramId = this.bodyParams.topogramId

          // parse Date object from JSON
          const nodes = this.bodyParams.nodes
            .map( n=> {
              const { data } = n
              if (data.start) data.start = new Date(n.data.start)
              if (data.end) data.end = new Date(n.data.end)
              return { data }
            })

          const data = createNodes(topogramId, nodes)
          return buildSuccessAnswer({ statusCode : 201, data })
        }
      },
      put : {
        authRequired: true,
        action() {
          const nodeId = this.urlParams.id
          const data = this.bodyParams
          const res = updateNode(nodeId, data)
          return buildSuccessAnswer({ statusCode : 201, data : res })
        }
      }
    }
  })
}

if (Api) {
  Api.addRoute('nodes/delete', {
    post : {
      authRequired: true,
      action() {
        const nodeIds = this.bodyParams.nodes
        const data = deleteNodes(nodeIds)
        // Nodes.find({ '_id' : { $in : ids } }).fetch()
        return buildSuccessAnswer({ statusCode : 201, data })
      }
    }
  })
}

if (Api) {
  Api.addRoute('topograms/:_id/nodes', {
    get: {
      authRequired: false,
      action() {
        const _id = this.urlParams._id
        const data = Nodes.find({ 'topogramId' : _id }).fetch()
        return buildSuccessAnswer({ data })
      }
    }
  })
}

// Edges
if (Api) {
  Api.addCollection(Edges, {
    routeOptions: { authRequired: false },
    endpoints: {
      post: {
        authRequired: true,
        action() {
          const topogramId = this.bodyParams.topogramId
          const edges = this.bodyParams.edges
          .map( n=> {
            const { data } = n
            if (data.start) data.start = new Date(n.data.start)
            if (data.end) data.end = new Date(n.data.end)
            return { data }
          })

          const data = createEdges( topogramId, edges )
          return buildSuccessAnswer({ statusCode : 201, data })
        }
      },
      put : {
        authRequired: true,
        action() {
          const edgeId = this.urlParams.id
          const data = this.bodyParams
          const res = updateEdge(edgeId, data)
          return buildSuccessAnswer({ statusCode : 201, res })
        }
      }
    }
  })
}

if (Api) {
  Api.addRoute('edges/delete', {
    post : {
      authRequired: true,
      action() {
        const edgeIds = this.bodyParams.edges
        const data = deleteEdges(edgeIds)
        // Edges.find({ '_id' : { $in : ids } }).fetch()
        return buildSuccessAnswer({ data })
      }
    }
  })
}

if (Api) {
  Api.addRoute('topograms/:_id/edges', {
    get: {
      authRequired: false,
      action() {
        const _id = this.urlParams._id
        const data = Edges.find({ 'topogramId' : _id }).fetch()
        return buildSuccessAnswer({ data })
      }
    }
  })
}

// If JsonRoutes scaffold is enabled, set up parallel endpoints (scaffold only)
if (!upgradeProbe && useJsonRoutes) {
  try {
    // Lazy load to avoid adding server-only deps unless enabled
    // eslint-disable-next-line global-require
    const { setupJsonApi } = require('/imports/endpoints/api-jsonroutes.js')
    setupJsonApi()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('JsonRoutes scaffold failed to initialize:', e && e.message)
  }
}
