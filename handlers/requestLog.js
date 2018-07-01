
exports.init = function(app) {
  app.use(async function(ctx, next) {

    /* jshint -W106 */
    ctx.log = app.log.child({
      requestId: ctx.requestId
    });

    await next();
  });

};
