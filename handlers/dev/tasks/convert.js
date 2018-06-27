let co = require('co');
let fs = require('fs');
let path = require('path');
let log = require('log')();
let gutil = require('gulp-util');
let glob = require('glob');
let exec = require('mz/child_process').exec;
let ini = require('ini');

module.exports = function(options) {

  return function() {

    return async function() {
      console.log("TEST");

    }();
  };
};
