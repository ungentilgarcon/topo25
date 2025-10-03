/*
  WebApp-based API scaffold: Non-destructive alternative to Restivus/JsonRoutes
  Default: Enabled by default. To temporarily disable during upgrade probes, set env UPGRADE_PROBE=1.
  Note: Mirrors a subset of existing endpoints.
*/

import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { WebApp } from 'meteor/webapp'

import { buildSuccessAnswer, buildErrorAnswer } from '/imports/api/responses'
import { Topograms, Nodes, Edges } from '/imports/api/collections.js'
import { createTopogram, togglePublicTopogram } from '/imports/endpoints/topograms.js'
import { createNodes, updateNode, deleteNodes } from '/imports/endpoints/nodes.js'
import { createEdges, updateEdge, deleteEdges } from '/imports/endpoints/edges.js'

const apiBase = '/api'
const apiDebug = (typeof process !== 'undefined' && process.env && process.env.API_DEBUG === '1')

function parseUrl(urlStr) {
  const { URL } = globalThis
  try {
    // ROOT_URL is required by Meteor, so absolute URL can be constructed
    const base = process.env.ROOT_URL || 'http://localhost:3000'
    return new URL(urlStr, base)
  } catch (e) {
    return null
  }
}

function sendJSON(res, { code = 200, data = {} }) {
  try {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  } catch (e) {
    try { res.end() } catch (e2) { /* noop */ }
  }
}

function matchPath(template, pathname) {
  // Convert templates like /api/topograms/:id/nodes to regex
  const keys = []
  const regexStr = template
    .replace(/\//g, '\\/')
    .replace(/:[^\/]+/g, (m) => {
      keys.push(m.slice(1))
      return '([^/]+)'
    }) + '$'
  const regex = new RegExp('^' + regexStr)
  const m = pathname.match(regex)
  if (!m) return null
  const params = {}
  keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]) })
  return params
}

function bufferJsonBody(req) {
  return new Promise((resolve) => {
    if (req.method === 'GET' || req.method === 'HEAD') return resolve(null)
    const contentType = req.headers['content-type'] || ''
    if (!/json|application\/(.*)json/i.test(contentType)) {
      // Still try to read body but do not parse as JSON
      let raw = ''
      req.on('data', (c) => { raw += c })
      req.on('end', () => resolve(raw))
      return
    }
    let body = ''
    req.on('data', (c) => { body += c })
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}) } catch (e) { resolve({}) }
    })
  })
}

async function attachUser(req) {
  try {
    const userId = req.headers['x-user-id'] || req.headers['x-userid']
    const token = req.headers['x-auth-token'] || req.headers['x-authtoken']
    if (userId && token) {
      const hashed = Accounts._hashLoginToken(token)
      const user = await Meteor.users.findOneAsync({
        _id: userId,
        'services.resume.loginTokens.hashedToken': hashed
      })
      req.userId = user ? user._id : null
      if (apiDebug) {
        // Avoid logging raw token; only log presence and userId match status
        // eslint-disable-next-line no-console
        console.log('[api] attachUser', { headerUserId: userId, matched: !!user })
      }
    } else {
      req.userId = null
    }
  } catch (e) {
    req.userId = null
  }
}

function requireAuth(req) {
  // In WebApp HTTP handlers there is no DDP/method context, so Meteor.userId() is invalid.
  // We only trust the user attached from headers via attachUser().
  return (req && req.userId) || null
}

export function setupJsonApi() {
  // Single middleware that handles all /api/* routes
  WebApp.connectHandlers.use(async (req, res, next) => {
    const url = parseUrl(req.url)
    if (!url) return next()
    const pathname = url.pathname.replace(/\/$/, '') || '/'
    if (!pathname.startsWith(apiBase)) return next()

    // Normalize: allow both /api and /api/
    const p = pathname === apiBase ? apiBase + '/' : pathname

    // Prepare request context
  await attachUser(req)
    req.body = await bufferJsonBody(req)

    // Routing
    // Health
    if (req.method === 'GET' && (p === `${apiBase}` || p === `${apiBase}/`)) {
      return sendJSON(res, { data: { message: 'API works' } })
    }

    // Auth: login -> returns token compatible with Meteor headers
    if (req.method === 'POST' && p === `${apiBase}/auth/login`) {
      const body = req.body || {}
      const identifier = (body.user && (body.user.email || body.user.username)) || body.email || body.username
      const password = body.password
      if (!identifier || !password) {
        return sendJSON(res, { code: 400, data: { error: 'Missing credentials' } })
      }
      const user = await Meteor.users.findOneAsync({
        $or: [
          { 'emails.address': identifier },
          { username: identifier }
        ]
      })
      if (!user) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
  const check = await Accounts._checkPasswordAsync(user, password)
  if (check && check.error) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const stamped = Accounts._generateStampedLoginToken()
      // In Meteor 3, some internals may be async; await just in case
      await Promise.resolve(Accounts._insertLoginToken(user._id, stamped))
      return sendJSON(res, { code: 200, data: { userId: user._id, authToken: stamped.token } })
    }

    // Auth: whoami -> returns current user basic info (requires headers)
    if (req.method === 'GET' && p === `${apiBase}/whoami`) {
      const userId = requireAuth(req)
      if (!userId) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
  const u = await Meteor.users.findOneAsync(userId, { fields: { username: 1, emails: 1 } })
      const email = (u && u.emails && u.emails[0] && u.emails[0].address) || null
      return sendJSON(res, { data: { userId, username: u && u.username, email } })
    }

    // Public topograms
    if (req.method === 'GET' && p === `${apiBase}/topogramsPublic`) {
      const list = await Topograms.find({ sharedPublic: { $in: [true, 1] } }).fetchAsync()
      return sendJSON(res, { data: Array.isArray(list) ? list : [] })
    }

    // Users (create)
    if (req.method === 'POST' && p === `${apiBase}/users`) {
      const data = req.body || {}
      const existing = await Meteor.users.find({ 'emails.address': data.email }).fetchAsync()
      if (existing && existing.length) {
        return sendJSON(res, { code: 403, data: buildErrorAnswer({ statusCode: 403, message: 'Unauthorized - Email already exists' }) })
      }
      await Accounts.createUser(data)
      const created = await Meteor.users.findOneAsync({ 'emails.address': data.email })
      return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: { _id: created && created._id } }) })
    }

    // Dev helpers (only when API_DEBUG=1)
    if (apiDebug) {
      // GET /api/dev/user-by-email?email=...
      if (req.method === 'GET' && p === `${apiBase}/dev/user-by-email`) {
        const email = url.searchParams.get('email')
        const u = email ? await Meteor.users.findOneAsync({ 'emails.address': email }) : null
        return sendJSON(res, { data: { found: !!u, user: u && { _id: u._id, username: u.username, emails: u.emails } } })
      }
      // POST /api/dev/seed-user -> { email, password, username? }
      if (req.method === 'POST' && p === `${apiBase}/dev/seed-user`) {
        const { email, password, username } = req.body || {}
        if (!email || !password) return sendJSON(res, { code: 400, data: { error: 'Missing email/password' } })
        const exists = await Meteor.users.findOneAsync({ 'emails.address': email })
        if (exists) return sendJSON(res, { code: 200, data: { userId: exists._id, note: 'already-existed' } })
        const userId = await Accounts.createUser({ email, password, ...(username ? { username } : {}) })
        return sendJSON(res, { data: { userId } })
      }
    }

    // Topograms
    if (req.method === 'POST' && p === `${apiBase}/topograms`) {
      const userId = requireAuth(req)
      if (!userId) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const result = createTopogram({ title: (req.body && req.body.title) || '', userId })
      if (result && result.body && result.body.status === 'error') {
        return sendJSON(res, { code: 400, data: result })
      }
      return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
    }

    if (req.method === 'GET' && p === `${apiBase}/topograms`) {
      if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const data = await Topograms.find().fetchAsync()
      return sendJSON(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
    }

    if (req.method === 'POST' && p === `${apiBase}/topograms/getByName`) {
      const title = req.body && req.body.name
      const data = await Topograms.findOneAsync({ title })
      return sendJSON(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
    }

    {
      const params = matchPath(`${apiBase}/topograms/:_id/public`, p)
      if (req.method === 'POST' && params) {
        if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
        const { _id } = params
        togglePublicTopogram({ topogramId: _id })
        const data = await Topograms.findOneAsync(_id)
        return sendJSON(res, { data: { status: 'success', data } })
      }
    }

    // Nodes
    if (req.method === 'POST' && p === `${apiBase}/nodes`) {
      if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const topogramId = req.body && req.body.topogramId
      const nodes = (req.body && req.body.nodes || []).map(n => {
        const { data } = n
        if (data && data.start) data.start = new Date(n.data.start)
        if (data && data.end) data.end = new Date(n.data.end)
        return { data }
      })
      const data = createNodes(topogramId, nodes)
      return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
    }

    {
      const params = matchPath(`${apiBase}/nodes/:id`, p)
      if (req.method === 'PUT' && params) {
        if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
        const nodeId = params.id
        const _data = req.body || {}
        const result = updateNode(nodeId, _data)
        return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
      }
    }

    if (req.method === 'POST' && p === `${apiBase}/nodes/delete`) {
      if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const nodeIds = (req.body && req.body.nodes) || []
      const data = deleteNodes(nodeIds)
      return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
    }

    {
      const params = matchPath(`${apiBase}/topograms/:_id/nodes`, p)
      if (req.method === 'GET' && params) {
        const { _id } = params
        const data = await Nodes.find({ topogramId: _id }).fetchAsync()
        return sendJSON(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
      }
    }

    // Edges
    if (req.method === 'POST' && p === `${apiBase}/edges`) {
      if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const topogramId = req.body && req.body.topogramId
      const edges = (req.body && req.body.edges || []).map(n => {
        const { data } = n
        if (data && data.start) data.start = new Date(n.data.start)
        if (data && data.end) data.end = new Date(n.data.end)
        return { data }
      })
      const data = createEdges(topogramId, edges)
      return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data }) })
    }

    {
      const params = matchPath(`${apiBase}/edges/:id`, p)
      if (req.method === 'PUT' && params) {
        if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
        const edgeId = params.id
        const _data = req.body || {}
        const result = updateEdge(edgeId, _data)
        return sendJSON(res, { code: 201, data: buildSuccessAnswer({ statusCode: 201, data: result }) })
      }
    }

    if (req.method === 'POST' && p === `${apiBase}/edges/delete`) {
      if (!requireAuth(req)) return sendJSON(res, { code: 401, data: { error: 'Unauthorized' } })
      const edgeIds = (req.body && req.body.edges) || []
      const data = deleteEdges(edgeIds)
      return sendJSON(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
    }

    {
      const params = matchPath(`${apiBase}/topograms/:_id/edges`, p)
      if (req.method === 'GET' && params) {
        const { _id } = params
        const data = await Edges.find({ topogramId: _id }).fetchAsync()
        return sendJSON(res, { data: buildSuccessAnswer({ statusCode: 200, data }) })
      }
    }

    // Unhandled API route
    return next()
  })
}
