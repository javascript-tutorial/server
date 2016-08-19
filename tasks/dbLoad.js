var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;

module.exports = function() {
  return function() {

    var args = require('yargs')
      .usage("gulp db:load --from fixture/init")
      .example("gulp db:load --from fixture/more --no-reset")
      .demand(['from'])
      .default('reset', true)
      .describe('from', 'file to import')
      .argv;

    var dbPath = path.join(projectRoot, args.from);

    gutil.log("loading db " + dbPath);

    return co(function*() {

      yield* dataUtil.loadModels(dbPath, { reset: args.reset });

      gutil.log("loaded db " + dbPath);
    });

  };
};

