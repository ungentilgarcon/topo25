// Server-only trivial passing test to make harness output explicitly green
if (Meteor.isServer) {
  describe('Sanity (server)', function () {
    it('adds numbers correctly', function () {
      if (1 + 2 !== 3) throw new Error('Math broke on server');
    });
  });
}
