#!/usr/bin/env node

const config = require('config');
const co = require('co');
const app = require('app');
const log = require('log')();

co(function*() {

  yield* app.waitBootAndListen(config.server.host, config.server.port);

  log.info("App is listening");

}).catch(function(err) {
  log.error(err);
  process.exit(1); // fatal error, could not boot!
});

process.on('message', function(msg) {
  if (msg == 'shutdown') { // PM2 sends this on graceful reload
    shutdown();
  }
});


function shutdown() {
  // The process is going to be reloaded
  // Have to close all database/socket.io/* connections

  co(function*() {
    log.info("Closing the app...");
    yield* app.close();
    // messages below not in logs due to PM2 bug
    log.info("App closed");
  }).then(function() {
    log.info("Exiting");
    process.exit(0);
  }, function(err) {
    log.error(err);
  });

  var dieDelay = process.env.PM2_GRACEFUL_TIMEOUT || 4000;
  // I have 4000ms to let all connections finish
  // not accepting new connections, closing socket.io (if used)
  // keep-alive connection to server may still be alive, but safe to nuke the server w/ them
  setTimeout(function() {
    log.error("App is stopping for too long! Will be killed now!");
    // kill is accomplished by PM2
  }, dieDelay - 100);

}

// отслеживаем unhandled ошибки
// https://iojs.org/api/process.html#process_event_rejectionhandled
var unhandledRejections = [];
process.on('unhandledRejection', function(reason, p) {
  p.trackRejectionId = Math.random();

  setTimeout(function() { // 100 ms to catch up and handle rejection
    if (p.trackRejectionId) { // if not rejectionHandled yet, report
      unhandledRejections.push(p);
      var report = {
        err: reason,
        trackRejectionId: p.trackRejectionId,
        length: unhandledRejections.length
      };

      log.error(report, "unhandledRejection");
    }
  }, 100);

});

// если вдруг есть catch, но позже - скажем и об этом, с указанием промиса /trackRejectionId/
process.on('rejectionHandled', function(p) {
  if (~unhandledRejections.indexOf(p)) {
    // too more than 100 ms to handle
    // already in the rejection list, let's report
    unhandledRejections.splice(unhandledRejections.indexOf(p), 1);

    log.error({
      trackRejectionId: p.trackRejectionId,
      length: unhandledRejections.length
    }, "rejectionHandled");
  } else {
    // handled soon, don't track
    delete p.trackRejectionId;
  }


});
