/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'
import { assert } from 'meteor/practicalmeteor:chai'

if (Meteor.isServer) {
  describe('Accounts sanity', function () {
    it('creates a user and validates password check', function () {
      const email = `user${Date.now()}@test.local`
      const password = 'pass1234'
      const userId = Accounts.createUser({ email, password })
      assert.isString(userId)
      const user = Meteor.users.findOne(userId)
      assert.isOk(user)
      const result = Accounts._checkPassword(user, password)
      assert.equal(result.error, null)
    })
  })
}
