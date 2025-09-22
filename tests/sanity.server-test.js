/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

if (Meteor.isServer) {
  describe('Sanity (server recognized)', function () {
    it('should be true', function () {
      if (!true) throw new Error('Unexpected false');
    });
  });
}
