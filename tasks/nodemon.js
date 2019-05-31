const nodemon = require('nodemon');

module.exports = async function(options) {

  nodemon({
    // shared client/server code has require('template.pug) which precompiles template on run
    // so I have to restart server to pickup the template change
    ext:          "js",
    verbose:      true,
    delay:        10,
    nodeArgs:     process.env.NODE_DEBUG ? ['--inspect'] : [],
    script:       "./bin/server.js",
    //ignoreRoot: ['.git', 'node_modules'].concat(glob.sync('{handlers,modules}/**/client')), // ignore handlers' client code
    ignore:       ['**/client/', '**/photoCut/', 'public'], // ignore handlers' client code
    watch:        ["modules"],
    watchOptions: {
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval:       100
      }
    }
  })
    .on('log', function(log) {
      console.log(log.colour);
    });

  await new Promise(resolve => {});
};
