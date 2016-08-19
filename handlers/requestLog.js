
exports.init = function(app) {
  app.use(function*(next) {

    /* jshint -W106 */
    this.log = app.log.child({
      requestId: this.requestId
    });

    yield* next;
  });

};
