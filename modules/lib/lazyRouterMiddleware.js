// router middleware which does require() on first activation
// instead of:
//   require('./router').middleware()
// do:
//   require('lib/lazyRouter')('./router')
// purpose: don't require everything on startup
module.exports = function(routerModulePath) {
  let middleware = module.parent.require(routerModulePath).middleware();

  return async function(ctx, next) {
    await middleware(ctx, next);
  };

};

delete require.cache[__filename];
