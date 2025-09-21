/*
  JsonRoutes scaffold: Non-destructive alternative to Restivus
  Enabled via:
    - Meteor.settings.public.useJsonRoutes = true
    - or env USE_JSONROUTES=1
  Note: This is a scaffold only; mirrors a subset of existing endpoints.
*/

import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { WebApp } from 'meteor/webapp'
import { JsonRoutes } from 'meteor/simple:json-routes'

import { buildSuccessAnswer, buildErrorAnswer } from '/imports/api/responses'
import { Topograms, Nodes, Edges } from '/imports/api/collections.js'
import { createTopogram, togglePublicTopogram } from '/imports/endpoints/topograms.js'
import { createNodes, updateNode, deleteNodes } from '/imports/endpoints/nodes.js'
import { createEdges, updateEdge, deleteEdges } from '/imports/endpoints/edges.js'

const apiPath = '/api'

function requireAuth(req) {
  const userId = (req && req.userId) || (Meteor.userId && Meteor.userId())
  return userId
}

export function setupJsonApi() {
  // Parse JSON bodies so req.body is available
  if (JsonRoutes.Middleware && JsonRoutes.Middleware.parseJsonBody) {
    JsonRoutes.Middleware.use(JsonRoutes.Middleware.parseJsonBody)
  }

  // Attach user context using Meteor login token headers (compatible with DDP/rest)
  JsonRoutes.Middleware.use((req, res, next) => {
    try {
      const userId = req.headers['x-user-id'] || req.headers['x-userid']
      const token = req.headers['x-auth-token'] || req.headers['x-authtoken']
      if (userId && token) {
        // Validate token: Accounts._hashLoginToken is available on server
        const hashed = Accounts._hashLoginToken(token)
        const user = Meteor.users.findOne({
          _id: userId,
          'services.resume.loginTokens.hashedToken': hashed
        })
        if (user) {
          req.userId = user._id
        } else {
          req.userId = null
        }
      } else {
        req.userId = null
      }
    } catch (e) {
      req.userId = null
    }
    next()
  })

  // Health
  JsonRoutes.add('GET', `${apiPath}/`, (req, res) => {
    JsonRoutes.sendResult(res, { data: { message: 'API works' } })
  })

  // Public topograms
  JsonRoutes.add('GET', `${apiPath}/topogramsPublic`, (req, res) => {
    const data = Topograms.find({ sharedPublic: 1 }).fetch()
    JsonRoutes.sendResult(res, { data })
  })

  // Users (partial: create)
  JsonRoutes.add('POST', `${apiPath}/users`, (req, res) => {
    const data = req.body || {}
    const existing = Meteor.users.find({ 'emails.address': data.email }).fetch()
    if (existing.length) {
      JsonRoutes.sendResult(res, { code: 403, data: buildErrorAnswer({ statusCode: 403, message: 'Unauthorized - Email already exists' }) })
      return
    }
    Accounts.createUser(data)
    const user = Meteor.users.findOne({ 'emails.address': data.email })
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: { _id: user._id } }) })
  })

  // Topograms collection (subset)
  JsonRoutes.add('POST', `${apiPath}/topograms`, (req, res) => {
    const result = createTopogram({ title: (req.body && req.body.title) || '', userId: requireAuth(req) })
    if (result && result.body && result.body.status === 'error') {
      JsonRoutes.sendResult(res, { code: 400, data: result })
      return
    }
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
  })

  JsonRoutes.add('GET', `${apiPath}/topograms`, (req, res) => {
    const data = Topograms.find().fetch()
    JsonRoutes.sendResult(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
  })

  JsonRoutes.add('POST', `${apiPath}/topograms/getByName`, (req, res) => {
    const title = req.body && req.body.name
    const data = Topograms.findOne({ title })
    JsonRoutes.sendResult(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
  })

  JsonRoutes.add('POST', `${apiPath}/topograms/:_id/public`, (req, res) => {
    const { _id } = req.params
    togglePublicTopogram({ topogramId: _id })
    const data = Topograms.findOne(_id)
    JsonRoutes.sendResult(res, { data: { status: 'success', data } })
  })

  // Nodes subset
  JsonRoutes.add('POST', `${apiPath}/nodes`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const topogramId = req.body && req.body.topogramId
    const nodes = (req.body && req.body.nodes || []).map(n => {
      const { data } = n
      if (data && data.start) data.start = new Date(n.data.start)
      if (data && data.end) data.end = new Date(n.data.end)
      return { data }
    })
    const data = createNodes(topogramId, nodes)
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
  })

  JsonRoutes.add('PUT', `${apiPath}/nodes/:id`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const nodeId = req.params.id
    const _data = req.body || {}
    const result = updateNode(nodeId, _data)
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
  })

  JsonRoutes.add('POST', `${apiPath}/nodes/delete`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const nodeIds = (req.body && req.body.nodes) || []
    const data = deleteNodes(nodeIds)
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
  })

  JsonRoutes.add('GET', `${apiPath}/topograms/:_id/nodes`, (req, res) => {
    const { _id } = req.params
    const data = Nodes.find({ topogramId: _id }).fetch()
    JsonRoutes.sendResult(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
  })

  // Edges subset
  JsonRoutes.add('POST', `${apiPath}/edges`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const topogramId = req.body && req.body.topogramId
    const edges = (req.body && req.body.edges || []).map(n => {
      const { data } = n
      if (data && data.start) data.start = new Date(n.data.start)
      if (data && data.end) data.end = new Date(n.data.end)
      return { data }
    })
    const data = createEdges(topogramId, edges)
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
  })

  JsonRoutes.add('PUT', `${apiPath}/edges/:id`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const edgeId = req.params.id
    const _data = req.body || {}
    const result = updateEdge(edgeId, _data)
    JsonRoutes.sendResult(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
  })

  JsonRoutes.add('POST', `${apiPath}/edges/delete`, (req, res) => {
    if (!requireAuth(req)) return JsonRoutes.sendResult(res, { code: 401, data: { error: 'Unauthorized' } })
    const edgeIds = (req.body && req.body.edges) || []
    const data = deleteEdges(edgeIds)
    JsonRoutes.sendResult(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
  })

  JsonRoutes.add('GET', `${apiPath}/topograms/:_id/edges`, (req, res) => {
    const { _id } = req.params
    const data = Edges.find({ topogramId: _id }).fetch()
    JsonRoutes.sendResult(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
  })
}
