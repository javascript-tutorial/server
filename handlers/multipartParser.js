const PathListCheck = require('pathListCheck');
const multiparty = require('multiparty');

let log = require('log')();

class MultipartParser {
  constructor() {
    this.ignore = new PathListCheck();
  }


  parse(req) {

    return new Promise((resolve, reject) => {
      let form = new multiparty.Form();

      let hadError = false;
      let fields = {};

      form.on('field', function (name, value) {
        fields[name] = value;
      });

      // multipart file must be the last
      form.on('part', function (part) {
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
        resolve(fields);
      }

      function onError(err) {
        log.debug("multipart error", err);
        if (hadError) return;
        hadError = true;
        reject(err);
      }
    });

  };


  middleware() {
    let self = this;

    return async function (ctx, next) {
      // skip these methods
      let contentType = ctx.get('content-type') || '';
      if (!~['DELETE', 'POST', 'PUT', 'PATCH'].indexOf(ctx.method) || !contentType.startsWith('multipart/form-data')) {
        return await next();
      }

      if (!self.ignore.check(ctx.path)) {
        ctx.log.debug("multipart will parse");

        // ctx may throw an error w/ status 400 or 415 or...
        ctx.request.body = await self.parse(ctx.req);

        ctx.log.debug("multipart done parse");
      } else {
        ctx.log.debug("multipart skip");
      }

      await next();
    };
  };
}

exports.init = function(app) {
  app.multipartParser = new MultipartParser();
  app.use(app.multipartParser.middleware());
};


function createError(status, message) {
  let error = new Error(message);
  Error.captureStackTrace(error, createError);
  error.status = status;
  error.statusCode = status;
  return error;
}
