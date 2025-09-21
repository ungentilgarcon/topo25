/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'
import { Meteor } from 'meteor/meteor'

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
  })
}
