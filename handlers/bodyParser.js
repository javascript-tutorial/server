const bodyParser = require('koa-bodyparser');
const PathListCheck = require('pathListCheck');

function BodyParser() {
  this.ignore = new PathListCheck();

  // default limits are:
  // formLimit: limit of the urlencoded body. If the body ends up being larger than this limit, a 413 error code is returned.
  //   Default is 56kb
  // jsonLimit: limit of the json body.
  //   Default is 1mb
  this.parser = bodyParser({
    formLimit: '1mb', // 56kb is not enough for mandrill webhook which is urlencoded
    jsonLimit: '1mb'
  });
}

BodyParser.prototype.middleware = function() {
  var self = this;

  return function*(next) {

    if (!self.ignore.check(this.path)) {
      this.log.debug("bodyParser will parse");

      yield* self.parser.call(this, next);

      this.log.debug("bodyParser done parse");
    } else {
      this.log.debug("bodyParser skip");
    }

    yield* next;
  };
};


exports.init = function(app) {

  app.bodyParser = new BodyParser();
  app.use(app.bodyParser.middleware());
};
