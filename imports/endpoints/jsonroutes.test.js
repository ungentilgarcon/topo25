/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'

if (Meteor.isServer) {
  const request = Npm.require('request')
  const baseUrl = `http://localhost:${process.env.PORT || 3000}`

  describe('API (JsonRoutes/Restivus parity)', function () {
    it('GET /api should respond 200 and contain API', (done) => {
      request.get(`${baseUrl}/api/`, (err, res, body) => {
        assert.isNull(err)
        assert.equal(res && res.statusCode, 200)
        assert.include(body, 'API')
        done()
      })
    })

    it('GET /api/topogramsPublic should respond 200', (done) => {
      request.get(`${baseUrl}/api/topogramsPublic`, (err, res) => {
        assert.isNull(err)
        assert.equal(res && res.statusCode, 200)
        done()
      })
    })

    it('GET /api/topograms should require auth (401)', (done) => {
      request.get(`${baseUrl}/api/topograms`, (err, res) => {
        // Restivus returns 401 with JSON { error: 401 } or similar
        // JsonRoutes returns 401 with { error: 'Unauthorized' }
        assert.isNull(err)
        assert.equal(res && res.statusCode, 401)
        done()
      })
    })
  })
}
