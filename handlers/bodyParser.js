const bodyParser = require('koa-bodyparser');
const PathListCheck = require('pathListCheck');

class BodyParser {
  constructor() {
    this.ignore = new PathListCheck();

    // default limits are:
    // formLimit: limit of the urlencoded body. If the body ends up being larger than this limit, a 413 error code is returned.
    //   Default is 56kb
    // jsonLimit: limit of the json body.
    //   Default is 1mb
    this.parser = bodyParser({
      formLimit: '1mb', // 56kb is not enough for mandrill webhook which is urlencoded
      jsonLimit: '1mb',
      enableTypes: ['json', 'form', 'text']
    });
  }

  middleware() {
    let self = this;

    return async function (ctx, next) {

      if (!self.ignore.check(ctx.path)) {
        ctx.log.debug("bodyParser will parse");

        await self.parser(ctx, next);

        ctx.log.debug("bodyParser done parse");
      } else {
        ctx.log.debug("bodyParser skip");
        await next();
      }

    };
  };
}

exports.init = function (app) {

  app.bodyParser = new BodyParser();
  app.use(app.bodyParser.middleware());
};
