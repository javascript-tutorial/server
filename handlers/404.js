
exports.init = function(app) {
  // by default if the router didn't find anything => it yields to next middleware
  // so I throw error here manually
  app.use(function* (next) {
    yield* next;

    if (this.status == 404) {
      // still nothing found? let default errorHandler show 404
      this.throw(404);
    }
  });


};