let conditional = require('koa-conditional-get');
let etag = require('koa-etag');

exports.init = function(app) {
  // use it upstream from etag so
  // that they are present

  // conditional triggers AFTER other middleware and returns 304/empty body if etag/modified matches
  app.use(conditional());

  // add etags AFTER every request (even POST), using file/body content and crc32
  app.use(etag());

  // set expires to ctx.expires
  app.use(async function (ctx, next) {
    await next();

    if (!ctx.expires) return;

    if (process.env.NODE_ENV === 'development') {
      // override any value with 2 secs, we don't need long expires to block our changes in dev
      ctx.expires = 2;
    }
    ctx.set('Expires', new Date(Date.now() + ctx.expires*1e3).toUTCString());
  });
};

