let uuid = require('node-uuid').v4;

// RequestCaptureStream wants "req_id" to identify the request
// we take it from upper chain (varnish? nginx on top?) OR generate
exports.init = function(app) {
  app.use(async function(ctx, next) {
    /* jshint -W106 */
    ctx.requestId = ctx.get('X-Request-Id') || uuid();
    await next();
  });
};
