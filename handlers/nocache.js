
exports.init = function(app) {
  app.use(async function(ctx, next) {

    ctx.nocache = function() {
      ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    };

    await next();
  });

};
