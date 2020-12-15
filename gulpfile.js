/**
 * NB: All tasks are initialized lazily, even plugins are required lazily,
 * running 1 task does not require all tasks' files
 */

const gulp = require('gulp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const {lazyRequireTask, requireModuleTasks} = require('engine/gulp/requireModuleTasks');
const {task, series, parallel} = require('gulp');

const config = require('config');

process.on('uncaughtException', function(err) {
  console.error(err.message, err.stack, err.errors);
  process.exit(255);
});


task("nodemon", lazyRequireTask('./tasks/nodemon', {
  // shared client/server code has require('template.jade) which precompiles template on run
  // so I have to restart server to pickup the template change
  ext:    "js,yml",

  nodeArgs: process.env.NODE_DEBUG  ? ['--debug'] : [],
  script: "./bin/server.js",
  //ignoreRoot: ['.git', 'node_modules'].concat(glob.sync('{handlers,modules}/**/client')), // ignore handlers' client code
  ignore: ['**/client/', 'public'], // ignore handlers' client code
  watch:  ["modules"]
}));

task('livereload', lazyRequireTask('./tasks/livereload', {
  // watch files *.*, not directories, no need to reload for new/removed files,
  // we're only interested in changes

  base: `public/${config.lang}`,
  watch: [
    `public/${config.lang}/pack/**/*.*`,
    // not using this file, using only styles.css (extracttextplugin)
    `!public/${config.lang}/pack/styles.js`,
    // this file changes every time we update styles
    // don't watch it, so that the page won't reload fully on style change
    `!public/${config.lang}/pack/head.js`
  ]
}));

requireModuleTasks('engine/koa/tutorial');

let testSrcs = ['modules/**/test/**/*.js'];
// on Travis, keys are required for E2E Selenium tests
// for PRs there are no keys, so we disable E2E
if (!process.env.TEST_E2E || process.env.CI && process.env.TRAVIS_SECURE_ENV_VARS=="false") {
  testSrcs.push('!modules/**/test/e2e/*.js');
}

task("test", lazyRequireTask('./tasks/test', {
  src: testSrcs,
  reporter: 'spec',
  timeout: 100000 // big timeout for webdriver e2e tests
}));


task('webpack', lazyRequireTask('./tasks/webpack'));
// gulp.task('webpack-dev-server', lazyRequireTask('./tasks/webpackDevServer'));


task('build', series('webpack'));

task('server', lazyRequireTask('./tasks/server'));

task('edit', parallel('webpack', 'engine:koa:tutorial:importWatch', 'livereload', 'server'));


task('dev', parallel('nodemon', 'livereload', 'webpack'));

gulp.on('err', function(gulpErr) {
  if (gulpErr.err) {
    // cause
    console.error("Gulp error details", [gulpErr.err.message, gulpErr.err.stack, gulpErr.err.errors].filter(Boolean));
  }
  mongoose.disconnect();
});
