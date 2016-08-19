const config = require('config');
const escapeHtml = require('escape-html');
const _ = require('lodash');
const path = require('path');

var isDevelopment = process.env.NODE_ENV == 'development';

// can be called not from this MW, but from anywhere
// this.templateDir can be anything
function renderError(err) {
  /*jshint -W040 */

  // don't pass just err, because for "stack too deep" errors it leads to logging problems
  var report = {
    message: err.message,
    stack: err.stack,
    errors: err.errors, // for validation errors
    status: err.status,
    referer: this.get('referer'),
    cookie: this.get('cookie')
  };
  if (!err.expose) { // dev error
    report.requestVerbose = this.request;
  }

  this.log.error(report);

  // may be error if headers are already sent!
  this.set('X-Content-Type-Options', 'nosniff');

  var preferredType = this.accepts('html', 'json');

  if (err.name == 'ValidationError') {
    this.status = 400;

    if (preferredType == 'json') {
      var errors = {};

      for (var field in err.errors) {
        errors[field] = err.errors[field].message;
      }

      this.body = {
        errors: errors
      };
    } else {
      this.body = this.render(path.join(__dirname, "templates/400"), {
        useAbsoluteTemplatePath: true,
        error: err
      });
    }

    return;
  }

  if (isDevelopment) {
    this.status = err.status || 500;

    var stack = (err.stack || '')
      .split('\n').slice(1)
      .map(function(v) {
        return '<li>' + escapeHtml(v).replace(/  /g, ' &nbsp;') + '</li>';
      }).join('');

    if (preferredType == 'json') {
      this.body = {
        message: err.message,
        stack: stack
      };
      this.body.statusCode = err.statusCode || err.status;
    } else {
      this.type = 'text/html; charset=utf-8';
      this.body = "<html><body><h1>" + err.message + "</h1><ul>" + stack + "</ul></body></html>";
    }

    return;
  }

  this.status = err.expose ? err.status : 500;

  if (preferredType == 'json') {
    this.body = {
      message: err.message,
      statusCode: err.status || err.statusCode
    };
    if (err.description) {
      this.body.description = err.description;
    }
  } else {
    var templateName = ~[500, 401, 404, 403].indexOf(this.status) ? this.status : 500;
    this.body = this.render(`${__dirname}/templates/${templateName}`, {
      useAbsoluteTemplatePath: true,
      error: err,
      requestId: this.requestId
    });
  }

}


exports.init = function(app) {

  app.use(function*(next) {
    this.renderError = renderError;

    try {
      yield* next;
    } catch (err) {
      if (typeof err == 'string') { // fx error
        err = new Error(err);
      }
      // this middleware is not like others, it is not endpoint
      // so wrapHmvcMiddleware is of little use
      try {
        this.renderError(err);
      } catch(renderErr) {
        // could not render, maybe template not found or something
        this.status = 500;
        this.body = "Server render error";
        this.log.error(renderErr); // make it last to ensure that status/body are set
      }
    }
  });

  // this middleware handles error BEFORE ^^^
  // rewrite mongoose wrong mongoose parameter -> 400 (not 500)
  app.use(function* rewriteCastError(next) {

    try {
      yield next;
    } catch (err) {
      if (err.name == 'CastError') {
        // malformed or absent mongoose params
        if (process.env.NODE_ENV == 'production') { // do not rewrite in dev/test env
          this.throw(400);
        }
      }

      throw err;
    }

  });

};
