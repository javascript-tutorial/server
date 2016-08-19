const PathListCheck = require('pathListCheck');

function VerboseLogger() {
  this.logPaths = new PathListCheck();
}


VerboseLogger.prototype.middleware = function() {
  var self = this;

  return function*(next) {

    if (self.logPaths.check(this.path)) {
      this.log.info({requestVerbose: this.request});
    }

    yield* next;
  };

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

module.exports = VerboseLogger;
