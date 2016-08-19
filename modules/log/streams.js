const RequestCaptureStream = require('./requestCaptureStream');

var streams;

if (process.env.LOG_LEVEL) {
  streams = [{
    level:  process.env.LOG_LEVEL,
    stream: process.stdout
  }];
} else {

  switch (process.env.NODE_ENV) {
  case 'development':
    streams = [{
      level:  'debug',
      stream: process.stdout
    }];
    break;
  case 'test':
    streams = [/* empty, don't log anything, set LOG_LEVEL if want to see errors */];
    break;
  case 'ebook':
  case 'production':

    // normally I see only info, but look in error in case of problems
    streams = [
      {
        level:  'info',
        stream: process.stdout
      },
      {
        level:  'debug',
        type:   'raw',
        stream: new RequestCaptureStream({
          level:         'error',
          maxRecords:    150,
          maxRequestIds: 2000,
          stream:        process.stderr
        })
      }
    ];
  }
}

module.exports = streams;
