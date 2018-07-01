#!/usr/bin/env node

const config = require('config');
const app = require('app');
const log = require('log')();

app.waitBootAndListen(config.server.host, config.server.port).then(() => {
  log.info("App is listening");
}).catch(function(err) {
  log.error(err);
  process.exit(1); // fatal error, could not boot!
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
