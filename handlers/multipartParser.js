const PathListCheck = require('pathListCheck');
const multiparty = require('multiparty');
const thunkify = require('thunkify');

var log = require('log')();

function MultipartParser() {
  this.ignore = new PathListCheck();
}


MultipartParser.prototype.parse = thunkify(function(req, callback) {

  var form = new multiparty.Form();

  var hadError = false;
  var fields = {};

  form.on('field', function(name, value) {
    fields[name] = value;
  });

  // multipart file must be the last
  form.on('part', function(part) {
    if (part.filename !== null) {
      // error is made the same way as multiparty uses
      callback(createError(400, 'Files are not allowed here'));
    } else {
      throw new Error("Must never reach this line (field event parses all fields)");
    }
    part.on('error', onError);
  });

  form.on('error', onError);

  form.on('close', onDone);

  form.parse(req);

  function onDone() {
    log.debug("multipart parse done", fields);
    if (hadError) return;
    callback(null, fields);
  }

  function onError(err) {
    log.debug("multipart error", err);
    if (hadError) return;
    hadError = true;
    callback(err);
  }

});


MultipartParser.prototype.middleware = function() {
  var self = this;

  return function*(next) {
    // skip these methods
    var contentType = this.get('content-type') || '';
    if (!~['DELETE', 'POST', 'PUT', 'PATCH'].indexOf(this.method) || !contentType.startsWith('multipart/form-data')) {
      return yield* next;
    }

    if (!self.ignore.check(this.path)) {
      this.log.debug("multipart will parse");

      // this may throw an error w/ status 400 or 415 or...
      this.request.body = yield self.parse(this.req);

      this.log.debug("multipart done parse");
    } else {
      this.log.debug("multipart skip");
    }

    yield* next;
  };
};


exports.init = function(app) {
  app.multipartParser = new MultipartParser();
  app.use(app.multipartParser.middleware());
};


function createError(status, message) {
  var error = new Error(message);
  Error.captureStackTrace(error, createError);
  error.status = status;
  error.statusCode = status;
  return error;
}
