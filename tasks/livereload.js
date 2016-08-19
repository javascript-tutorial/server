var livereload = require('gulp-livereload');
var gulp = require('gulp');
var gutil = require('gulp-util');
var throttle = require('lodash/throttle');
var chokidar = require('chokidar');

// options.watch must NOT be www/**, because that breaks (why?!?) supervisor reloading
// www/**/*.* is fine
module.exports = function(options) {

  // listen to changes after the file events finish to arrive
  // no one is going to livereload right now anyway
  return function(callback) {
    livereload.listen();

    // reload once after all scripts are rebuit
    livereload.changedSoon = throttle(livereload.changed, 1000, {leading: false});
    //livereload.changedVerySoon = _.throttle(livereload.changed, 100, {leading: false});

    setTimeout(function() {
      gutil.log("livereload: listen on change " + options.watch);

      chokidar.watch(options.watch, {
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100
        }
      }).on('change', function(changed) {
        if (changed.match(/\.(js|map)/)) {
          // full page reload
          livereload.changedSoon(changed);
        } else {
          livereload.changed(changed);
        }
      });

    }, 1000);
  };
};


