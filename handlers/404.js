
exports.init = function(app) {
  // by default if the router didn't find anything => it awaits to next middleware
  // so I throw error here manually
  app.use(async function (ctx, next) {
    await next();

    if (ctx.status === 404) {
      // still nothing found? let default error show 404
      ctx.throw(404);
    }
  });


};