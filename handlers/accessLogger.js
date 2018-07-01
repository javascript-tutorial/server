'use strict';

// adapted koa-logger for bunyan

// binds onfinish to current context
// bindEmitter didn't work here
exports.init = function(app) {
  app.use(async function logger(ctx, next) {
    // request
    let req = ctx.req;

    let start = Date.now();
    ctx.log.info({
      event: "request-start",
      method: req.method,
      url: req.url,
      referer: ctx.request.get('referer'),
      ua: ctx.request.get('user-agent')
    }, "--> %s %s", req.method, req.originalUrl || req.url);

    try {
      await next();
    } catch (err) {
      // log uncaught downstream errors
      log(ctx, start, err);
      throw err;
    }

    // log when the response is finished or closed,
    // whichever happens first.
    let res = ctx.res;

    let onfinish = done.bind(null, 'finish');
    let onclose = done.bind(null, 'close');

    function done(event) {
      res.removeListener('finish', onfinish);
      res.removeListener('close', onclose);
      log(ctx, start, null, event);
    }

    /**
     * Log helper.
     */

    function log(ctx, start, err, event) {
      // get the status code of the response
      let status = err ? (err.status || 500) : (ctx.status || 404);

      // set the color of the status code;
      let s = status / 100 | 0;

      // not ctx.url, but ctx.originalUrl because mount middleware changes it
      // request to /payments/common/order in case of error is logged as /order

      ctx.log[err ? 'error' : 'info']({
        event:    "request-end",
        method:   ctx.method,
        url:      ctx.originalUrl,
        status:   status,
        timeDuration: Date.now() - start
      }, "<-- %s %s", ctx.method, ctx.originalUrl);
    }

  });
};
