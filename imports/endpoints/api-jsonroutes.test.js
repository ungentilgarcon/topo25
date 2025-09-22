/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'
import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

import { Topograms } from '/imports/api/collections.js'
import { createTopogram } from '/imports/endpoints/topograms.js'

if (Meteor.isServer) {
  const http = Npm.require('http')
  const urlLib = Npm.require('url')

  function httpGet(rawUrl) {
    const url = urlLib.parse(rawUrl)
    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.path,
      method: 'GET',
      headers: { Accept: 'application/json' }
    }
    return new Promise((resolve, reject) => {
      const req = http.request(opts, (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => { body += chunk })
        res.on('end', () => resolve({ statusCode: res.statusCode, body }))
      })
      req.on('error', reject)
      req.end()
    })
  }

  function httpRequest(method, rawUrl, { headers = {}, json } = {}) {
    const url = urlLib.parse(rawUrl)
    const payload = json ? JSON.stringify(json) : null
    const opts = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.path,
      method,
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers
      }
    }
    return new Promise((resolve, reject) => {
      const req = http.request(opts, (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', chunk => { body += chunk })
        res.on('end', () => resolve({ statusCode: res.statusCode, body }))
      })
      req.on('error', reject)
      if (payload) req.write(payload)
      req.end()
    })
  }

  describe('JsonRoutes scaffold (feature-flag)', function () {
    const base = process.env.ROOT_URL ? process.env.ROOT_URL.replace(/\/$/, '') : `http://localhost:${process.env.PORT || 3000}`

    beforeEach(() => {
      Topograms.remove({})
    })

    it('GET /api should return health payload', function (done) {
      httpGet(`${base}/api/`).then(({ statusCode, body }) => {
        assert.equal(statusCode, 200)
        const data = JSON.parse(body)
        assert.isObject(data)
        assert.equal(data.message, 'API works')
        done()
      }).catch(done)
    })

    it('GET /api/topogramsPublic returns array', function (done) {
      httpGet(`${base}/api/topogramsPublic`).then(({ statusCode, body }) => {
        assert.equal(statusCode, 200)
        const data = JSON.parse(body)
        assert.ok(Array.isArray(data))
        done()
      }).catch(done)
    })

    it('GET /api/topograms requires auth (401)', function (done) {
      httpGet(`${base}/api/topograms`).then(({ statusCode }) => {
        assert.equal(statusCode, 401)
        done()
      }).catch(done)
    })

    it('POST /api/topograms should work with auth (201)', function (done) {
      const email = `user${Date.now()}@test.local`
      const password = 'pass1234'
      const userId = Accounts.createUser({ email, password })
      const stamped = Accounts._generateStampedLoginToken()
      Accounts._insertLoginToken(userId, stamped)
      const token = stamped.token

      httpRequest('POST', `${base}/api/topograms`, {
        headers: { 'X-User-Id': userId, 'X-Auth-Token': token },
        json: { title: 'from-test' }
      }).then(({ statusCode, body }) => {
        assert.equal(statusCode, 201)
        // body may be wrapped; just ensure it's JSON parseable
        try { JSON.parse(body) } catch (e) { assert.fail('Response not JSON') }
        done()
      }).catch(done)
    })

    it('POST /api/auth/login returns token and GET /api/whoami works', function (done) {
      const email = `user${Date.now()}@test.local`
      const password = 'pass1234'
      Accounts.createUser({ email, password })

      httpRequest('POST', `${base}/api/auth/login`, { json: { email, password } })
        .then(({ statusCode, body }) => {
          assert.equal(statusCode, 200)
          const data = JSON.parse(body)
          assert.isString(data.userId)
          assert.isString(data.authToken)
          return httpRequest('GET', `${base}/api/whoami`, {
            headers: { 'X-User-Id': data.userId, 'X-Auth-Token': data.authToken }
          })
        })
        .then(({ statusCode, body }) => {
          assert.equal(statusCode, 200)
          const me = JSON.parse(body)
          assert.equal(typeof me.userId, 'string')
          done()
        })
        .catch(done)
    })
  })
}
