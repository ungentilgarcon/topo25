/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'

if (Meteor.isServer) {
  const http = Npm.require('http')
  const urlLib = Npm.require('url')
  const baseUrl = process.env.ROOT_URL ? process.env.ROOT_URL.replace(/\/$/, '') : `http://localhost:${process.env.PORT || 3000}`

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

  describe('API (JsonRoutes/Restivus parity)', function () {
    it('GET /api should respond 200 and contain API', (done) => {
      httpGet(`${baseUrl}/api/`).then(({ statusCode, body }) => {
        assert.equal(statusCode, 200)
        assert.include(body, 'API')
        done()
      }).catch(done)
    })

    it('GET /api/topogramsPublic should respond 200', (done) => {
      httpGet(`${baseUrl}/api/topogramsPublic`).then(({ statusCode }) => {
        assert.equal(statusCode, 200)
        done()
      }).catch(done)
    })

    it('GET /api/topograms should require auth (401)', (done) => {
      httpGet(`${baseUrl}/api/topograms`).then(({ statusCode }) => {
        assert.equal(statusCode, 401)
        done()
      }).catch(done)
    })
  })
}
