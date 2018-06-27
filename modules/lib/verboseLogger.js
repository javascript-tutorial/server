const PathListCheck = require('pathListCheck');

module.exports = class VerboseLogger {
  constructor() {
    this.logPaths = new PathListCheck();
  }

  middleware() {
    var self = this;

    return async function (ctx, next) {

      if (self.logPaths.check(ctxx.path)) {
        ctx.log.info({requestVerbose: ctx.request});
      }

      await next;
    };

  }
};

/*
VerboseLogger.prototype.log = function(context) {

  for (var name in context.req.headers) {
    console.log(name + ": " + context.req.headers[name]);
  }

  if (context.request.body) {
    console.log(context.request.body);
  }

};
*/

