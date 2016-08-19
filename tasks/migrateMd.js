'use strict';

var fs = require('fs');
var fse = require('fs-extra');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var glob = require('glob');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');
var projectRoot = require('config').projectRoot;
var migrate = require('markit/migrate');

module.exports = function() {
  return function() {


    var args = require('yargs')
      .usage("gulp migrate:md --file file.md")
      .demand(['file'])
      .argv;

    return co(function*() {

      let migration = migrate(fs.readFileSync(args.file, 'utf-8'));

      let text = migration.text;

      console.log(args.file, text, "\n\n\n\n\n");

      fs.writeFileSync(args.file, text);

    });

  };
};

