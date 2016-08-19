const pngquant = require('imagemin-pngquant');
const path = require('path');
const gulp = require('gulp');
const gp = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const fs = require('fs');

/**
 *
 * @param options
 *  options.root => the root to import from
 * @returns {Function}
 */
module.exports = function(options) {
  options = options || {};

  const root = options.root || require('yargs').argv.root;

  if (!root) {
    throw new Error("Root not set");
  }

  return function(callback) {

    gutil.log("minify " + root);

    // When enable: CHECK demo.svg (!!!)
    // it has JS inside!!! svgo breaks it by removing t-template-path
    return gulp.src(root + '/**/*.{png,jpg,gif}')
    //return gulp.src(root + '/**/*.{svg,png,jpg,gif}')
      .pipe(gp.debug())

      .pipe(gp.imagemin({
        verbose: true,
        progressive: true,
      //  svgoPlugins: [{removeViewBox: false}],
        use:         [pngquant()]
      }))
      .pipe(gulp.dest(root));
  };


};

