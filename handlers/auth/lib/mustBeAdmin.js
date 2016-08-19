'use strict';

module.exports = function*(next) {

  if (this.isAdmin) {
    yield* next;
  } else {
    this.throw(403);
  }
};
