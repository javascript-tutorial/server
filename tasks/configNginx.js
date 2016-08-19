/**
 * Copies nginx config to --prefix dir, passing through EJS template engine
 * Usage example:
 * gulp config:nginx --prefix /etc/nginx --env prod
 */

var fs = require('fs');
var co = require('co');
var path = require('path');
var gulp = require('gulp');
var gp = require('gulp-load-plugins')();
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;
var ejs = require('ejs');
var through = require('through2');
var del = require('del');
var config = require('config');

module.exports = function() {
  return function() {

    var args = require('yargs')
      .usage("Prefix where to put config files is required and environment for the config.\n")
      .example("gulp config:nginx --prefix /etc/nginx --root /js/javascript-nodejs --env production")
      .example("gulp config:nginx --prefix /etc/nginx --root /js/javascript-nodejs --env production --setPassword --sslEnabled")
      .example("gulp config:nginx --prefix /opt/local/etc/nginx --root /js/javascript-nodejs --env development --debug")
      .describe("prefix", "where to copy config files")
      .describe("env", "test/development/production enviromnent, config files are piped through EJS template, env is used for replacements")
      .describe("clear", "delete all files from prefix, use if no other nginx sites exist")
      .describe("sslEnabled", "enable ssl (certificates must be placed separately to SECRET_DIR)")
      .describe("setPassword", "close access, /etc/nginx.passwd is used for HTTP Auth")
      .describe("debug", "enable nginx debug in error_log")
      .demand(['prefix', 'env'])
      .boolean('setPassword')
      .argv;

    var locals = {
      env: args.env,
      root: args.root,
      nginxPrefix: args.prefix,
      sslEnabled: !!args.sslEnabled,
      certDir: config.certDir,
      setPassword: !!args.setPassword,
      // debug is used for EJS internal debugging
      debugOn: args.debug
    };

    if (args.clear) {
      gp.util.log("clear ", args.prefix);
      del.sync(path.join(args.prefix, '**'), {force: true});
    }

    return gulp.src(path.join(projectRoot, 'nginx', '**'))
      .pipe(through.obj(function(file, enc, cb) {

        if (file.isNull() || /\.dat$/.test(file.path)) {
          this.push(file);
          return cb();
        }

        gp.util.log("Process", file.path, '->', args.prefix);

        try {
          file.contents = new Buffer(ejs.render(file.contents.toString(), locals));
        } catch (err) {
          this.emit('error', new gp.util.PluginError('configNginx', err));
        }

        this.push(file);
        cb();
      }))
      .pipe(gulp.dest(args.prefix));

  };
};
