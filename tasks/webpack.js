var webpack = require('webpack');
var gp = require('gulp-load-plugins')();
var notifier = require('node-notifier');

module.exports = function() {

  return function(callback) {

    var config = require('config').webpack;

    webpack(config, function(err, stats) {
      if (!err) {
        // errors in files do not stop webpack watch
        // instead, they are gathered, so I get the first one here (if no other)
        var jsonStats = stats.toJson();
        err = jsonStats.errors[0];
      }

      if (err) {

        notifier.notify({
          message: err
        });

        gp.util.log(err);

        if (!config.watch) callback(err);
        return;
      }

      /*
      Log profile
      console.log( stats.toJson().modules.map(function(mod) {
        return {
          identifier: mod.identifier,
          name: mod.name,
          profile: mod.profile
        };
      }) );
      */

      /*
      For webpack analyse
      require('fs').writeFileSync('/tmp/webpack.json', JSON.stringify(stats.toJson()));
      */

      gp.util.log('[webpack]', stats.toString({
        hash: false,
        version: false,
        timings: true,
        assets: true,
        chunks: false,
        modules: false,
        cached: true,
        colors: true
      }));

      /*
      Log profile and all details
       gp.util.log('[webpack]', stats.toString({
       hash: false,
       version: false,
       timings: true,
       assets: true,
       chunks: true,
       chunkModules: true,
       modules: true,
       cached: true,
       colors: true,
       profile: true
       }));

       */

      if (!config.watch) callback();
    });

  };
};
