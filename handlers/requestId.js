var uuid = require('node-uuid').v4;

// RequestCaptureStream wants "req_id" to identify the request
// we take it from upper chain (varnish? nginx on top?) OR generate
exports.init = function(app) {
  app.use(function*(next) {
    /* jshint -W106 */
    this.requestId = this.get('X-Request-Id') || uuid();
    yield next;
  });
};
