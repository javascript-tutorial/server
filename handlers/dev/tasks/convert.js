var co = require('co');
var fs = require('fs');
var path = require('path');
var log = require('log')();
var gutil = require('gulp-util');
var glob = require('glob');
let exec = require('mz/child_process').exec;
let ini = require('ini');

module.exports = function(options) {

  return function() {

    return async function() {
      console.log("TEST");

    }();
  };
};
