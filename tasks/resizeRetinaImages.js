const es = require('event-stream');
const path = require('path');
const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const fs = require('fs');
const gm = require('gm');

/**
 * Resize all @2x. images to normal resolution
 * @param options
 *  options.root => the root to resize from
 * @returns {Function}
 */
module.exports = function(options) {
  options = options || {};

  const root = options.root || require('yargs').argv.root;

  if (!root) {
    throw new Error("Root not set");
  }

  return function(callback) {

    gutil.log("resize retina images " + root);

    return gulp.src(root + '/**/*@2x.{png,jpg,gif}')
      .pipe(gp.debug())

      .pipe(es.map(function(file, cb) {
        var normalResolutionPath = file.path.replace(/@2x(?=\.[^.]+$)/, '');
        gutil.log(file.path + ' -> ' + normalResolutionPath);
        gm(file.path).resize("50%").write(normalResolutionPath, cb);
      }));
  };


};

