
exports.init = function(app) {
  app.use(function*(next) {

    this.nocache = function() {
      this.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    };

    yield* next;
  });

};
