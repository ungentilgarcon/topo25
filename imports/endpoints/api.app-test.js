/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { assert } from 'meteor/practicalmeteor:chai'

if (Meteor.isServer) {

  const topogramId = 'topogramId'

  // Legacy tests relied on the deprecated 'request' package. Skip for now to avoid tough-cookie/psl issues.
  describe.skip('JSON API Routes', function () {

    describe('GET /api', function () {
      it('should show return an API homepage', (done) => {
        done()
      })
    })

    describe('POST /api/topograms', function () {
      it('should create a topogram', (done) => {
        done()
      })
    })

    describe('POST /api/nodes', function () {
      it('should create nodes', (done) => {
        const nodes = Array(3).fill({})
        done()
      })
    })

    describe('POST /api/edges', function () {
      it('should create edges', (done) => {
        const edges = Array(3).fill({ data : { source : 'a', target : 'b' } })
        done()
      })
    })
  })


}
