//require("time-require");

const fs = require('fs');
const config = require('config');

const Application = require('application');
const app = new Application();


if (process.env.NODE_ENV != 'development') {

  // only log.error in prod, otherwise just die
  process.on('uncaughtException', function(err) {
    // let bunyan handle the error
    app.log.error({
      message: err.message,
      name:    err.name,
      errors:  err.errors,
      stack:   err.stack
    });
    process.exit(255);
  });

}


// The app is always behind Nginx which serves static
// (Maybe behind Cloudflare as well)
// trust all headers from the proxy
// X-Forwarded-Host
// X-Forwarded-Proto
// X-Forwarded-For -> ip
app.proxy = true;

// ========= Helper handlers ===========

config.handlers.forEach(handler => app.requireHandler(handler));

// must be last
app.requireHandler('404');


// uncomment for time-require to work
//process.emit('exit');

module.exports = app;
