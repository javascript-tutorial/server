
module.exports = function*(next) {
  if (!this.isAuthenticated()) {
    yield* next;
  } else {
    this.throw(403, 'Это действие доступно только для неавторизованных посетителей.');
  }
};
