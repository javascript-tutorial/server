var fs = require('fs');
var co = require('co');
var path = require('path');
var gutil = require('gulp-util');
var dataUtil = require('lib/dataUtil');
var mongoose = require('lib/mongoose');

module.exports = function() {
  return function() {

    return co(function*() {

      yield* dataUtil.createEmptyDb();

      gutil.log("cleared db");
    });

  };
};

