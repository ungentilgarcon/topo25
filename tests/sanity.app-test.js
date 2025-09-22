describe('Sanity', function () {
  it('should pass a trivial assertion', function () {
    // This ensures the test harness reports an explicit green count
    if (1 + 1 !== 2) throw new Error('Math broke');
  });
});
