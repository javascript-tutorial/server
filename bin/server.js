#!/usr/bin/env node

const config = require('config');
const app = require('engine/koa/app');
const log = require('engine/log')();

app.waitBootAndListen(config.server.host, config.server.port).then(() => {
  log.info("App is listening");
}).catch(function(err) {
  log.error(err);
  process.exit(1); // fatal error, could not boot!
});

process.on('SIGINT', async () => {
  // The process is going to be reloaded
  // Have to close all database/socket.io/* connections

  let dieDelay = process.env.PM2_GRACEFUL_TIMEOUT || 4000;
  // I have 4000ms to let all connections finish
  // not accepting new connections, closing socket.io (if used)
  // keep-alive connection to server may still be alive, but safe to nuke the server w/ them
  setTimeout(function notifyAboutProblem() {
    // just log, kill is accomplished by PM2
    log.error("App is stopping for too long! Will be killed now!");
  }, dieDelay - 100);

  log.info("Closing the app...");
  await app.close();
  // messages below may be not in logs due to PM2 bug
  log.info("App closed, exiting");
  process.exit(0);

});



// отслеживаем unhandled ошибки
// https://iojs.org/api/process.html#process_event_rejectionhandled
let unhandledRejections = [];
process.on('unhandledRejection', function(reason, p) {
  p.trackRejectionId = Math.random();

  setTimeout(function() { // 100 ms to catch up and handle rejection
    if (p.trackRejectionId) { // if not rejectionHandled yet, report
      unhandledRejections.push(p);
      let report = {
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
