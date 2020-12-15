let livereloadServer = require('engine/livereloadServer')
let chokidar = require('chokidar');

// options.watch must NOT be www/**, because that breaks (why?!?) supervisor reloading
// www/**/*.* is fine
module.exports = async function(options) {

  function onChokidarChange(changed) {
    changed = changed.slice(options.base.length + 1);
    // console.log("CHANGE", changed);

    if (!changed.match(/\.(jpg|css|png|gif|svg)/i)) {
      changed = '/fullpage'; // make all requests that cause full-page reload be /fullpage
      // otherwise we'll have many reloads (once per diffrent .js url)
    }
    livereloadServer.queueFlush(changed);
  }

  setTimeout(function() {
    // console.log("livereload: listen on change " + options.watch);

    chokidar.watch(options.watch, {
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval:       100
      }
    }).on('change', onChokidarChange);

  }, 1000);

  await new Promise(resolve => {});
};
